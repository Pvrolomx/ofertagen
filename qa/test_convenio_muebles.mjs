#!/usr/bin/env node
/**
 * QA: Convenio Privado de Enajenación de Bienes Muebles (comportamiento)
 *
 * Ensambla y renderiza de verdad, luego inspecciona el texto resultante.
 *
 * Lo que más importa aquí es la NUMERACIÓN ORDINAL: las cláusulas se numeran
 * en letra (PRIMERA, SEGUNDA…) y el ordinal depende de qué bloques quedaron
 * activos. Encender o apagar un toggle debe renumerar todo lo que sigue, sin
 * huecos ni repeticiones.
 *
 * Ejecutar: node qa/test_convenio_muebles.mjs
 */

import PLANTILLA from '../src/lib/plantillas/convenio_muebles.js';
import { ensamblarContextoConvenio, renderizarBloquesConvenio, PENDIENTE_MARK } from '../src/lib/plantillas/ensamblador_convenio.js';
import { generarDocx } from '../src/lib/docx/generador.js';

const VERDE = '\x1b[32m';
const ROJO = '\x1b[31m';
const GRIS = '\x1b[90m';
const RESET = '\x1b[0m';

let passed = 0, failed = 0;
function test(nombre, cond, detalle = '') {
  if (cond) { console.log(`  ${VERDE}✅${RESET} ${nombre}`); passed++; }
  else { console.log(`  ${ROJO}❌${RESET} ${nombre}${detalle ? `  ${GRIS}${detalle}${RESET}` : ''}`); failed++; }
}
function section(t) { console.log(`\n📋 ${t}`); }

function datosBase() {
  return {
    partes: {
      enajenante: { tipoPersona: 'fisica', nacionalidad: 'estadounidense', nacionalidad_en: 'American',
        personas: [{ nombre: "Michael Charles D'Agata", genero: 'M', estado_civil: 'soltero' }] },
      adquirente: { tipoPersona: 'fisica', nacionalidad: 'mexicano', nacionalidad_en: 'Mexican',
        personas: [{ nombre: 'Marialegria Busso Rojo', genero: 'F', estado_civil: 'soltera' }] },
    },
    bloques: { cl_iva: true, cl_pago: true, cl_penalidad: true, cl_condicion_cruzada: false, vehiculo: false, cl_nota_idioma: true },
    campos: {
      inmueble: { identificacion: 'el Departamento 204 del Condominio "Los Veneros", Bahía de Banderas, Nayarit' },
      precio: { precio_muebles: 250000, precio_vehiculo: 50000, moneda: 'USD', deposito: 30000 },
      iva: { incluido: true, tasa: '16%' },
      plazos: { dias_deposito: 5, dias_saldo: 5 },
      escrow: { empresa_escrow: 'ARMOUR SECURE ESCROW, S DE RL DE CV' },
      fechas: { ciudad: 'Bucerías, Nayarit', fecha_firma: '2026-09-08' },
      jurisdiccion: { ciudad: 'Bucerías, Nayarit' },
      penalidad: { porcentaje: '10%' },
    },
  };
}

function render(mut) {
  const d = JSON.parse(JSON.stringify(datosBase()));
  if (mut) mut(d);
  const ctx = ensamblarContextoConvenio(PLANTILLA, d);
  const bl = renderizarBloquesConvenio(PLANTILLA, ctx);
  return {
    bloques: bl,
    es: bl.map(b => `${b.titulo?.es || ''}\n${b.es || ''}`).join('\n'),
    en: bl.map(b => `${b.titulo?.en || ''}\n${b.en || ''}`).join('\n'),
    bloque: (id) => bl.find(b => b.id === id),
    ordinalDe: (id) => (bl.find(b => b.id === id)?.titulo?.es || '').split('.')[0],
    ordinales: bl.filter(b => /^[A-ZÁÉÍÓÚ]+\.\s/.test(b.titulo?.es || '')).map(b => b.titulo.es.split('.')[0]),
  };
}

console.log('\n══ QA: Convenio de bienes muebles ══');

// ============================================================
section('1. Estructura básica');
{
  const r = render();
  test('Genera bloques', r.bloques.length > 8, `${r.bloques.length}`);
  test('Sin vehículo: el título no lo menciona',
    (r.bloque('encabezado')?.titulo?.es || '').includes('BIENES MUEBLES Y ENSERES') &&
    !(r.bloque('encabezado')?.titulo?.es || '').includes('VEHÍCULO'));
  test('Comparece cada parte con su denominación',
    r.es.includes('"EL ENAJENANTE"') && r.es.includes('"LA ADQUIRENTE"'));
  test('Concordancia de género por parte (masculino / femenino)',
    r.es.includes('EL ENAJENANTE') && r.es.includes('LA ADQUIRENTE'));
  test('Identifica dónde están los muebles', r.es.includes('Departamento 204'));
  test('Remite al ANEXO "A"', r.es.includes('ANEXO "A"'));
  test('Sin contracción "a el ANEXO"', !r.es.includes('a el ANEXO'), r.es.match(/.{0,30}a el ANEXO/)?.[0]);
}

// ============================================================
section('2. Numeración ordinal dinámica');
{
  const r = render();
  test('Base (sin vehículo, sin condición cruzada): PRIMERA→OCTAVA sin huecos',
    r.ordinales.join(',') === 'PRIMERA,SEGUNDA,TERCERA,CUARTA,QUINTA,SEXTA,SÉPTIMA,OCTAVA',
    r.ordinales.join(','));
  test('Sin repeticiones', new Set(r.ordinales).size === r.ordinales.length);
}
{
  const r = render(d => { d.bloques.vehiculo = true; d.bloques.cl_condicion_cruzada = true; });
  test('Con vehículo + condición cruzada: llega a DÉCIMA',
    r.ordinales.length === 10 && r.ordinales[9] === 'DÉCIMA', r.ordinales.join(','));
  test('La cláusula del vehículo aparece', !!r.bloque('cl_vehiculo'));
  test('La condición cruzada aparece', !!r.bloque('cl_condicion_cruzada'));
}
{
  // Apagar un bloque de en medio debe correr los ordinales, no dejar hueco.
  const conIva = render();
  const sinIva = render(d => { d.bloques.cl_iva = false; });
  test('Con IVA, el pago es CUARTA', conIva.ordinalDe('cl_pago') === 'CUARTA', conIva.ordinalDe('cl_pago'));
  test('Sin IVA, el pago sube a TERCERA', sinIva.ordinalDe('cl_pago') === 'TERCERA', sinIva.ordinalDe('cl_pago'));
  test('Sin IVA no queda hueco en la secuencia',
    sinIva.ordinales.join(',') === 'PRIMERA,SEGUNDA,TERCERA,CUARTA,QUINTA,SEXTA,SÉPTIMA', sinIva.ordinales.join(','));
}

// ============================================================
section('3. Precio y desglose');
{
  const r = render();
  const cl = r.bloque('cl_objeto_precio')?.es || '';
  test('Sin vehículo: total = precio de muebles', cl.includes('$250,000.00 USD'));
  test('Sin vehículo: no hay desglose', !cl.includes('por EL VEHÍCULO'));
}
{
  const r = render(d => { d.bloques.vehiculo = true; });
  const cl = r.bloque('cl_objeto_precio')?.es || '';
  test('Con vehículo: total suma ambos ($300,000)', cl.includes('$300,000.00 USD'));
  test('Con vehículo: desglosa muebles y vehículo',
    cl.includes('$250,000.00 USD') && cl.includes('$50,000.00 USD') && cl.includes('por EL VEHÍCULO'));
  test('Con vehículo: el título lo menciona',
    (r.bloque('encabezado')?.titulo?.es || '').includes('VEHÍCULO'));
  test('Con vehículo: aparece el ANEXO "B"', r.es.includes('ANEXO "B"'));
}
{
  const r = render(d => { d.campos.precio.moneda = 'MXN'; });
  test('MXN: la columna EN no dice "U.S. Dollars"', !r.en.includes('U.S. Dollars'));
  test('MXN: la columna EN dice "Mexican Pesos"', r.en.includes('Mexican Pesos'));
}

// ============================================================
section('4. IVA — el hueco del ejercicio original, aquí resuelto');
{
  const r = render(d => { d.campos.iva.incluido = true; });
  const cl = r.bloque('cl_iva')?.es || '';
  test('Precio con IVA incluido: lo dice expresamente', cl.includes('**incluye** dicho impuesto'));
  test('Obliga a expedir CFDI con el impuesto desglosado', cl.includes('comprobante fiscal digital'));
}
{
  const r = render(d => { d.campos.iva.incluido = false; });
  const cl = r.bloque('cl_iva')?.es || '';
  test('Precio sin IVA: lo traslada en adición al precio',
    cl.includes('**no incluye** dicho impuesto') && cl.includes('en adición al precio'));
}
{
  const r = render(d => { d.bloques.cl_iva = false; });
  test('Se puede apagar la cláusula de IVA', !r.bloque('cl_iva'));
  test('La cláusula de impuestos no queda huérfana', (r.bloque('cl_impuestos')?.es || '').length > 50);
}

// ============================================================
section('5. Condición suspensiva cruzada (opt-in por su costo fiscal)');
{
  const r = render();
  test('Apagada por defecto', !r.bloque('cl_condicion_cruzada'));
  test('Sin ella, las declaraciones NO dicen "unidad indivisible"',
    !r.es.includes('unidad operativa indivisible'));
  test('Sin ella, las declaraciones sí afirman la separación',
    r.es.includes('separada e independiente') && r.es.includes('bienes de naturaleza distinta'));
}
{
  const r = render(d => { d.bloques.cl_condicion_cruzada = true; });
  const cl = r.bloque('cl_condicion_cruzada')?.es || '';
  test('Encendida: sujeta el convenio a que se escriture el inmueble',
    cl.includes('condición suspensiva') && cl.includes('escritura pública'));
  test('Encendida: rescisión de pleno derecho con restitución',
    cl.includes('rescindido de pleno derecho') && cl.includes('restituirse las prestaciones'));
}

// ============================================================
section('6. Pena convencional');
{
  const r = render();
  test('10% de $250,000 = $25,000', (r.bloque('cl_penalidad')?.es || '').includes('$25,000.00 USD'));
}
{
  const r = render(d => { d.bloques.vehiculo = true; });
  test('Con vehículo, 10% de $300,000 = $30,000',
    (r.bloque('cl_penalidad')?.es || '').includes('$30,000.00 USD'));
}
{
  const r = render(d => { d.bloques.cl_penalidad = false; });
  test('Se puede apagar', !r.bloque('cl_penalidad'));
}

// ============================================================
section('7. Pago y escrow');
{
  const r = render();
  const cl = r.bloque('cl_pago')?.es || '';
  test('Nombra a la depositaria', cl.includes('ARMOUR SECURE ESCROW'));
  test('Con depósito: incisos A) y B)', cl.includes('A) Dentro de los') && cl.includes('B) El saldo'));
  test('Saldo = total − depósito ($220,000)', cl.includes('$220,000.00 USD'));
  test('Plazos en número y letra', cl.includes('cinco (5) días hábiles'));
}
{
  const r = render(d => { d.campos.precio.deposito = 0; });
  const cl = r.bloque('cl_pago')?.es || '';
  test('Sin depósito: pago en una sola exhibición, sin incisos',
    !cl.includes('A) Dentro de los') && cl.includes('El precio se transferirá'));
}

// ============================================================
section('8. Datos faltantes y generación');
{
  const r = render(d => { d.campos.inmueble.identificacion = ''; d.campos.escrow.empresa_escrow = ''; });
  test('Marca los huecos con ⟦Pendiente⟧ en vez de dejarlos en blanco',
    r.es.includes(PENDIENTE_MARK));
}
{
  const r = render();
  const buf = await generarDocx(r.bloques, PLANTILLA.meta, { idiomaSecundario: 'en' });
  test('El .docx se genera', buf && buf.length > 8000, `${buf?.length} bytes`);
}

// ============================================================
const total = passed + failed;
console.log('\n' + '═'.repeat(58));
console.log(failed === 0
  ? `  ${VERDE}RESULTADO: ${passed}/${total} tests — TODO OK${RESET}`
  : `  ${ROJO}RESULTADO: ${passed}/${total} tests — ${failed} FALLO(S)${RESET}`);
console.log('═'.repeat(58) + '\n');
process.exit(failed === 0 ? 0 : 1);
