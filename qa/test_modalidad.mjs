#!/usr/bin/env node
/**
 * QA: Modalidad por nacionalidad y moneda — TEST DE COMPORTAMIENTO
 *
 * A diferencia de test_fideicomiso.mjs, que busca cadenas en el código fuente,
 * este test ENSAMBLA Y RENDERIZA de verdad y luego inspecciona el texto que
 * saldría en el documento.
 *
 * Existe por un caso concreto: la matriz de modalidad por nacionalidad era
 * correcta, pero vivía dentro de la rama de precio simple de §4, de modo que
 * toda oferta con precio compuesto la perdía en silencio. Ningún test de
 * cadenas podía detectarlo, porque las cadenas correctas seguían ahí.
 *
 * Ejecutar: node qa/test_modalidad.mjs
 */

import PLANTILLA from '../src/lib/plantillas/oferta_compra.js';
import { ensamblarContexto, renderizarBloques } from '../src/lib/plantillas/ensamblador.js';

const VERDE = '\x1b[32m';
const ROJO = '\x1b[31m';
const GRIS = '\x1b[90m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function test(nombre, condicion, detalle = '') {
  if (condicion) {
    console.log(`  ${VERDE}✅${RESET} ${nombre}`);
    passed++;
  } else {
    console.log(`  ${ROJO}❌${RESET} ${nombre}${detalle ? `  ${GRIS}${detalle}${RESET}` : ''}`);
    failed++;
  }
}

function section(titulo) {
  console.log(`\n📋 ${titulo}`);
}

// ============================================================
// FIXTURE
// ============================================================

function datosBase() {
  return {
    partes: {
      ofertante: {
        tipoPersona: 'fisica', nacionalidad: 'mexicano', domicilio: 'Calle X 1', celular: '322 000 0000', email: 'comprador@ejemplo.mx',
        personas: [{ nombre: 'JUAN PEREZ', genero: 'M', estado_civil: 'soltero' }],
      },
      propietario: {
        tipoPersona: 'fisica', nacionalidad: 'mexicano', domicilio: 'Calle Y 2', celular: '322 111 1111', email: 'vendedora@ejemplo.mx',
        titulo_vendedor: 'propietario',
        personas: [{ nombre: 'ALICIA NACINOVICH CORDOVA', genero: 'F', estado_civil: 'soltera' }],
      },
    },
    bloques: {
      escrow: true, inspeccion: true, inventario: true, obligaciones_vendedor: true,
      fuerza_mayor: true, documentos_integrales: true, doc_fideicomiso: true, ad_corpus: true,
    },
    campos: {
      inmueble: {
        descripcion_corta: 'Finca urbana marcada con el número 58',
        ubicacion_completa: 'en el Fraccionamiento Valle Dorado, Bahía de Banderas, Nayarit',
        superficie_m2: 120.63, superficie_letras: 'ciento veinte metros sesenta y tres decímetros cuadrados',
        es_condominio: false,
      },
      antecedente: {
        fecha_escritura: '2004-02-13', numero_escritura: '29808',
        notario_anterior: 'Lic. José Luis Bejar Fonseca',
        numero_notaria_anterior: '13', ciudad_notaria_anterior: 'Tepic, Nayarit',
      },
      precio: { precio_total: 3300000, moneda: 'MXN', deposito_escrow: 330000, dias_deposito: 3, dias_saldo: 5 },
      escrow: { empresa_escrow: 'SECURE TITLE LATIN AMERICA INC' },
      fechas: { fecha_presentacion: '2026-09-08', ciudad_presentacion: 'Bucerías, Nayarit' },
      notario: {}, jurisdiccion: {}, penalidad: {}, comision: {},
      inspeccion: { dias_inspeccion: 5, dias_revision: 3 },
    },
  };
}

/** Ensambla y devuelve todo el texto renderizado (ES + EN). */
function render(mut) {
  const datos = datosBase();
  if (mut) mut(datos);
  const ctx = ensamblarContexto(PLANTILLA, datos);
  const bloques = renderizarBloques(PLANTILLA, ctx);
  return {
    es: bloques.map(b => b.es || '').join('\n'),
    en: bloques.map(b => b.en || '').join('\n'),
    todo: bloques.map(b => `${b.es || ''}\n${b.en || ''}`).join('\n'),
    bloque: (id) => bloques.find(b => b.id === id),
  };
}

const compuesto = (d) => {
  d.bloques.precio_compuesto = true;
  d.bloques.mobiliario_separado = true;
  d.campos.precio.precio_inmueble = 2800000;
  d.campos.precio.precio_muebles = 500000;
};
const compradorExtranjero = (d) => { d.partes.ofertante.nacionalidad = 'canadiense'; };
const vendedorExtranjero  = (d) => { d.partes.propietario.nacionalidad = 'canadiense'; };

// Marcadores que NUNCA deben aparecer entre dos mexicanos.
const RE_FIDEICOMISO = /fideicomis\w*|fiduciari\w*|trust\b|trustee/i;

console.log('\n══ QA: Modalidad por nacionalidad y moneda (comportamiento) ══');

// ============================================================
section('1. Matriz de modalidad — PRECIO SIMPLE');

{
  const r = render();
  test('MX→MX: arma "Contrato de Compraventa"', r.es.includes('Contrato de Compraventa'));
  test('MX→MX: sin rastro de fideicomiso en TODO el documento',
    !RE_FIDEICOMISO.test(r.todo), r.todo.match(RE_FIDEICOMISO)?.[0]);
}
{
  const r = render(compradorExtranjero);
  test('MX→EXT: constituye fideicomiso en zona restringida',
    r.es.includes('Constitución de Fideicomiso Traslativo de Dominio Irrevocable en Zona Restringida'));
}
{
  const r = render(vendedorExtranjero);
  test('EXT→MX: ejecuta los fines del fideicomiso',
    r.es.includes('Ejecución de los Fines del Fideicomiso'));
}
{
  const r = render((d) => { vendedorExtranjero(d); compradorExtranjero(d); });
  test('EXT→EXT: cede derechos de fideicomisario',
    r.es.includes('Cesión de Derechos y Obligaciones de Fideicomisario'));
}

// ============================================================
section('2. Matriz de modalidad — PRECIO COMPUESTO (la regresión original)');

{
  const r = render(compuesto);
  test('MX→MX compuesto: arma "Contrato de Compraventa"', r.es.includes('Contrato de Compraventa'));
  test('MX→MX compuesto: sin rastro de fideicomiso en TODO el documento',
    !RE_FIDEICOMISO.test(r.todo), r.todo.match(RE_FIDEICOMISO)?.[0]);
  test('MX→MX compuesto: la §4 usa la rama compuesta',
    (r.bloque('cl_precio')?.es || '').includes('dos operaciones distintas'));
}
{
  const r = render((d) => { compuesto(d); compradorExtranjero(d); });
  test('MX→EXT compuesto: conserva el fideicomiso',
    r.es.includes('Constitución de Fideicomiso Traslativo de Dominio Irrevocable en Zona Restringida'));
}

// ============================================================
section('3. Cláusulas que traían el fideicomiso escrito a mano');

{
  const r = render(compuesto);
  test('§3 antecedente: "adquirió la propiedad", no derechos fideicomisarios',
    r.es.includes('adquirió la propiedad') && !r.es.includes('derechos fideicomisarios'));
  test('§10 ISR: sin honorarios fiduciarios ni anualidades',
    !r.es.includes('honorarios fiduciarios') && !r.es.includes('anualidades del fideicomiso'));
  test('§12: "La transmisión de la propiedad", no cesión de derechos',
    r.es.includes('La transmisión de la propiedad'));
  test('fuerza mayor: redacción sucesoria, no beneficiarios de fideicomiso',
    r.es.includes('herederos o legatarios') && !r.es.includes('escritura de fideicomiso'));
  test('EN: sin "trust" en todo el documento inglés', !/trust/i.test(r.en));
}
{
  // §3 y §10 dependen del VENDEDOR, no del comprador: §3 describe cómo adquirió
  // él, y §10 carga honorarios de un fideicomiso que solo existe si él es
  // fideicomisario. Con vendedor mexicano no aplican, aunque el comprador sea
  // extranjero — ahí el fideicomiso se constituye en la operación nueva.
  const r = render((d) => { compuesto(d); vendedorExtranjero(d); });
  test('Vendedor EXT: §3 sí dice "derechos fideicomisarios"', r.es.includes('derechos fideicomisarios'));
  test('Vendedor EXT: §10 sí carga honorarios fiduciarios', r.es.includes('honorarios fiduciarios'));
}
{
  const r = render((d) => { compuesto(d); compradorExtranjero(d); });
  test('Vendedor MX → comprador EXT: §3 dice "adquirió la propiedad" (el antecedente es suyo)',
    r.es.includes('adquirió la propiedad'));
  test('Vendedor MX → comprador EXT: §10 no le carga honorarios fiduciarios',
    !r.es.includes('honorarios fiduciarios'));
}

// ============================================================
section('4. Moneda — la columna inglesa debe seguir a la operación');

{
  const r = render();
  test('MXN: la columna EN no dice "U.S. Dollars"', !r.en.includes('U.S. Dollars'),
    r.en.match(/[A-Z][\w ]*U\.S\. Dollars/)?.[0]);
  test('MXN: la columna EN dice "Mexican Pesos"', r.en.includes('Mexican Pesos'));
  test('MXN: la columna ES dice "M.N."', r.es.includes('M.N.'));
}
{
  const r = render(compuesto);
  test('MXN compuesto: la §4 inglesa no dice "U.S. Dollars"',
    !(r.bloque('cl_precio')?.en || '').includes('U.S. Dollars'));
  test('MXN compuesto: la §4 inglesa no dice "USD $"',
    !(r.bloque('cl_precio')?.en || '').includes('USD $'));
}
{
  const r = render((d) => { d.campos.precio.moneda = 'USD'; });
  test('USD: la columna EN sí dice "U.S. Dollars"', r.en.includes('U.S. Dollars'));
}

// ============================================================
section('5. Pacto de no incluir el valor en la Escritura (opt-in)');

const PACTO_ES = 'no incluir este valor';
const PACTO_EN = 'not to include this value';
{
  const r = render(compuesto);
  test('Por defecto NO se imprime (ES)', !r.es.includes(PACTO_ES));
  test('Por defecto NO se imprime (EN)', !r.en.includes(PACTO_EN));
}
{
  const r = render((d) => { compuesto(d); d.bloques.pacto_no_incluir_muebles = true; });
  test('Con el flag SÍ se imprime (ES)', r.es.includes(PACTO_ES));
  test('Con el flag SÍ se imprime (EN)', r.en.includes(PACTO_EN));
}

// ============================================================
section('6. Régimen del inmueble y objeto configurable');

{
  const r = render(compuesto);
  test('No condominio: §4 dice "del inmueble", no "unidad privativa"',
    (r.bloque('cl_precio')?.es || '').includes('del inmueble') &&
    !(r.bloque('cl_precio')?.es || '').includes('unidad privativa'));
  test('No condominio: sin contracción incorrecta "de el inmueble"',
    !r.es.includes('de el inmueble'));
  test('documentos_integrales: sin el "Vehículo" hardcodeado', !r.es.includes('Vehículo'));
  test('No condominio: obligaciones NO piden carta de la Administración de Condóminos',
    !r.es.includes('Administración de Condóminos'));
  test('No condominio: el prorrateo no menciona cuotas de condóminos',
    !r.es.includes('cuotas ordinarias y extraordinarias de condóminos'));
  test('No condominio (EN): sin Homeowner\'s Administration', !r.en.includes("Homeowner's Administration"));
  test('Sin contracciones "de el" en todo el documento',
    !/\bde el [a-záéíóúñ]/.test(r.es), r.es.match(/.{0,40}\bde el [a-záéíóúñ]\w*/)?.[0]);
}
{
  const r = render((d) => { compuesto(d); d.campos.inmueble.es_condominio = true; });
  test('Condominio: SÍ pide carta de la Administración de Condóminos',
    r.es.includes('Administración de Condóminos'));
  test('Condominio: el prorrateo SÍ menciona cuotas de condóminos',
    r.es.includes('cuotas ordinarias y extraordinarias de condóminos'));
}
{
  const r = render((d) => { compuesto(d); d.campos.inmueble.es_condominio = true; });
  test('Condominio: §4 dice "de la unidad privativa descrita"',
    (r.bloque('cl_precio')?.es || '').includes('de la unidad privativa descrita'));
}
{
  const r = render((d) => {
    compuesto(d);
    d.campos.muebles = {
      objeto_es: 'el negocio mercantil en operación denominado "Abarrotes La Esperanza"',
      convenio_es: 'Contrato Privado de Compraventa de Negocio y Bienes Muebles',
    };
  });
  const cl4 = r.bloque('cl_precio')?.es || '';
  test('Objeto de muebles configurable', cl4.includes('Abarrotes La Esperanza'));
  test('Nombre del convenio configurable', cl4.includes('Compraventa de Negocio y Bienes Muebles'));
  test('El convenio configurado llega a documentos_integrales',
    r.es.includes('Compraventa de Negocio y Bienes Muebles'));
}

// ============================================================
section('7. Gravamen vigente por cancelar');

{
  const r = render(compuesto);
  test('Apagado por defecto: no aparece la carta de saldo', !r.es.includes('carta de saldo'));
}
{
  const r = render((d) => {
    compuesto(d);
    d.bloques.gravamen_por_cancelar = true;
    d.campos.gravamen = { acreedor: 'Hipotecaria Nacional, S.A. de C.V. / SHF', dias_carta_saldo: 10 };
  });
  const g = r.bloque('gravamen_por_cancelar');
  test('Encendido: emite el bloque', !!g);
  test('Nombra al acreedor configurado', (g?.es || '').includes('Hipotecaria Nacional'));
  test('Exige carta de saldo con plazo en número y letra',
    (g?.es || '').includes('carta de saldo') && (g?.es || '').includes('diez (10) días hábiles'));
  test('Cancelación previa o simultánea a la escritura',
    (g?.es || '').includes('previa o simultánea a la escritura definitiva'));
  test('Los gastos de cancelación son del vendedor',
    (g?.es || '').includes('por cuenta exclusiva de LA PROPIETARIA'));
  test('Da salida al comprador si no se cancela (con devolución del depósito)',
    (g?.es || '').includes('dar por terminada la presente oferta') &&
    (g?.es || '').includes('devuelta íntegramente'));
  test('EN: payoff letter y release', (g?.en || '').includes('payoff') && (g?.en || '').includes('release'));
  test('Es inciso de las condiciones indispensables', /^[A-Z]\)/.test(g?.es || ''));
  test('Sin acreedor configurado usa una fórmula genérica',
    (render((d) => { compuesto(d); d.bloques.gravamen_por_cancelar = true; })
      .bloque('gravamen_por_cancelar')?.es || '').includes('la institución acreedora'));
}
{
  // Los incisos se renumeran solos según qué bloques estén activos.
  const conGrav = render((d) => { compuesto(d); d.bloques.gravamen_por_cancelar = true; });
  const letra = (r, id) => (r.bloque(id)?.es || '').match(/^([A-Z])\)/)?.[1];
  test('Con gravamen: A inspección, B documentación, C gravamen, D inventario',
    letra(conGrav, 'inspeccion') === 'A' && letra(conGrav, 'doc_fideicomiso') === 'B' &&
    letra(conGrav, 'gravamen_por_cancelar') === 'C' && letra(conGrav, 'inventario') === 'D');
  const sinGrav = render(compuesto);
  test('Sin gravamen: el inventario recupera la C', letra(sinGrav, 'inventario') === 'C');
}

// ============================================================
section('8. §10 ISR — uso mixto y exención parcial');

{
  const r = render(compuesto);
  const isr = r.bloque('cl_isr')?.es || '';
  test('Sin uso mixto: no menciona el art. 93 ni proporciones', !isr.includes('artículo 93'));
}
{
  const r = render((d) => {
    compuesto(d);
    d.campos.inmueble.uso_mixto = true;
    d.campos.inmueble.superficie_habitacional_m2 = 62.05;
    d.campos.inmueble.superficie_comercial_m2 = 58.58;
  });
  const isr = r.bloque('cl_isr')?.es || '';
  const isrEn = r.bloque('cl_isr')?.en || '';
  test('Uso mixto: cita el art. 93 fr. XIX inciso a)',
    isr.includes('artículo 93, fracción XIX, inciso a)'));
  test('Uso mixto: dice que la exención es SOLO de la porción habitacional',
    isr.includes('únicamente a la proporción') && isr.includes('quedando gravada la proporción restante'));
  test('Uso mixto: cita las superficies configuradas',
    isr.includes('62.05 m²') && isr.includes('58.58 m²'));
  test('Uso mixto: obliga al vendedor a acreditar el destino habitacional',
    isr.includes('acreditar el destino habitacional'));
  test('Uso mixto (EN): exemption applies solely to the residential portion',
    isrEn.includes('article 93') && isrEn.includes('solely to the portion'));
}
{
  // Sin superficies, el texto sigue siendo correcto: solo omite las cifras.
  const r = render((d) => { compuesto(d); d.campos.inmueble.uso_mixto = true; });
  const isr = r.bloque('cl_isr')?.es || '';
  test('Uso mixto sin superficies: emite el texto sin inventar cifras',
    isr.includes('artículo 93, fracción XIX') && !isr.includes('aproximadamente'));
}
{
  // El uso mixto no debe interferir con la lógica de fideicomiso de la misma cláusula.
  const r = render((d) => { compuesto(d); d.campos.inmueble.uso_mixto = true; vendedorExtranjero(d); });
  const isr = r.bloque('cl_isr')?.es || '';
  test('Uso mixto + vendedor extranjero: conviven exención parcial y honorarios fiduciarios',
    isr.includes('artículo 93, fracción XIX') && isr.includes('honorarios fiduciarios'));
}

// ============================================================
section('9. Bloque doc_fideicomiso pide el documento correcto');

{
  const r = render();
  test('Vendedor mexicano: pide LA ESCRITURA PÚBLICA', r.es.includes('LA ESCRITURA PÚBLICA'));
}
{
  const r = render(vendedorExtranjero);
  test('Vendedor extranjero: pide el fideicomiso', /fideicomiso/i.test(r.es));
}

// ============================================================
const total = passed + failed;
console.log('\n' + '═'.repeat(58));
if (failed === 0) {
  console.log(`  ${VERDE}RESULTADO: ${passed}/${total} tests — TODO OK${RESET}`);
} else {
  console.log(`  ${ROJO}RESULTADO: ${passed}/${total} tests — ${failed} FALLO(S)${RESET}`);
}
console.log('═'.repeat(58) + '\n');

process.exit(failed === 0 ? 0 : 1);
