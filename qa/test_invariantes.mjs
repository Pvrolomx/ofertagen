#!/usr/bin/env node
/**
 * QA: Invariantes sobre cobertura por pares.
 *
 * Los 63 tests de test_modalidad.mjs son assertions POR CASO: cada uno afirma
 * algo sobre una combinación escrita a mano. Este archivo es otra cosa:
 *
 *   1. Declara el espacio de estado completo (39 interruptores) en grafo.js.
 *   2. Genera un conjunto que cubre TODO PAR de estados alcanzable.
 *   3. Renderiza cada caso con el pipeline real y verifica invariantes que
 *      deben cumplirse en cualquier combinación legal.
 *   4. Verifica que la declaración no se haya quedado atrás del código.
 *
 * El punto 4 es el que evita que esto se vuelva documentación muerta: si alguien
 * agrega un bloque o una lectura cruzada y no la declara, este test falla.
 *
 * Ejecutar: node qa/test_invariantes.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import PLANTILLA from '../src/lib/plantillas/oferta_compra.js';
import { ensamblarContexto, renderizarBloques } from '../src/lib/plantillas/ensamblador.js';
import { INTERRUPTORES, RELACIONES, LECTURAS, IDS, esLegal } from '../src/lib/plantillas/grafo.js';
import { generarPares, verificarCobertura } from './lib/pairwise.mjs';
import { INVARIANTES } from './lib/invariantes.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDE = '\x1b[32m', ROJO = '\x1b[31m', AMBAR = '\x1b[33m', GRIS = '\x1b[90m', RESET = '\x1b[0m';

let passed = 0, failed = 0;
const fallas = [];

function test(nombre, ok, detalle = '') {
  if (ok) { console.log(`  ${VERDE}✅${RESET} ${nombre}`); passed++; }
  else { console.log(`  ${ROJO}❌${RESET} ${nombre}${detalle ? `  ${GRIS}${detalle}${RESET}` : ''}`); failed++; fallas.push(`${nombre} — ${detalle}`); }
}
function section(t) { console.log(`\n📋 ${t}`); }

// ════════════════════════════════════════════════════════════════
// FIXTURE — completa a propósito: cualquier hueco que quede es señal,
// no ruido. Si un bloque produce "undefined" con esto lleno, el bloque
// está pidiendo un campo que nadie documentó.
// ════════════════════════════════════════════════════════════════

function datosBase() {
  return {
    partes: {
      ofertante: {
        tipoPersona: 'fisica', nacionalidad: 'mexicano', domicilio: 'Calle X 1, Puerto Vallarta',
        celular: '322 000 0000', email: 'comprador@ejemplo.mx',
        personas: [{ nombre: 'JUAN PEREZ', genero: 'M', estado_civil: 'soltero' }],
      },
      propietario: {
        tipoPersona: 'fisica', nacionalidad: 'mexicano', domicilio: 'Calle Y 2, Bucerías',
        celular: '322 111 1111', email: 'vendedora@ejemplo.mx', titulo_vendedor: 'propietario',
        personas: [{ nombre: 'ALICIA NACINOVICH CORDOVA', genero: 'F', estado_civil: 'soltera' }],
      },
    },
    bloques: {},
    campos: {
      inmueble: {
        descripcion_corta: 'Finca urbana marcada con el número 58',
        ubicacion_completa: 'en el Fraccionamiento Valle Dorado, Bahía de Banderas, Nayarit',
        superficie_m2: 120.63,
        superficie_letras: 'ciento veinte metros sesenta y tres decímetros cuadrados',
        es_condominio: false,
      },
      antecedente: {
        fecha_escritura: '2004-02-13', numero_escritura: '29808',
        notario_anterior: 'Lic. José Luis Bejar Fonseca',
        numero_notaria_anterior: '13', ciudad_notaria_anterior: 'Tepic, Nayarit',
        cuenta_predial: 'U000000',
      },
      precio: {
        precio_total: 3300000, moneda: 'MXN', deposito_escrow: 330000,
        dias_deposito: 3, dias_saldo: 5, anticipo_gastos: '3000',
        precio_inmueble: 2800000, precio_muebles: 500000,
      },
      muebles: { objeto_es: 'el mobiliario', objeto_en: 'the furniture' },
      escrow: { empresa_escrow: 'SECURE TITLE LATIN AMERICA INC', honorarios_escrow: 750, incluir_honorarios: true },
      fechas: {
        fecha_presentacion: '2026-09-09', ciudad_presentacion: 'Bucerías, Nayarit',
        fecha_vigencia: '2026-09-14', hora_vigencia: 'medianoche',
        fecha_formalizacion: 'a más tardar el día 31 de enero de 2027',
        fecha_formalizacion_en: 'no later than January 31, 2027',
        fecha_extension: '28 de febrero de 2027', fecha_extension_en: 'February 28, 2027',
      },
      notario: { notario_seleccion: 'meza_29' },
      comision: {
        porcentaje_total: '8%', incluye_iva: true,
        agencia1_nombre: 'Bienvenidos Real Estate', agencia1_porcentaje: '4%',
        agencia2_nombre: 'Castle Bay PV, SRL de CV', agencia2_porcentaje: '4%',
      },
      penalidad: { porcentaje_penalidad: '10%' },
      jurisdiccion: { ciudad_jurisdiccion: 'Bucerías, Nayarit, México' },
      inspeccion: { dias_inspeccion: 5, dias_revision: 3 },
      coordinador: { nombre_coordinador: 'Lic. Rolando Romero García' },
      gravamen: { acreedor: 'Hipotecaria Nacional, S.A. de C.V.', dias_carta_saldo: 10 },
      inventario: { exclusiones: 'los cuadros de la sala', exclusiones_en: 'the living room paintings' },
      financiamiento: { dias_aprobacion: 20 },
      clausula_adicional: {
        texto_es: 'Las partes acuerdan una cláusula adicional de prueba.',
        texto_en: 'The parties agree to an additional test clause.',
      },
      condicion_libre: {
        texto_es: 'Que se satisfaga la condición libre de prueba.',
        texto_en: 'That the free test condition be satisfied.',
      },
    },
  };
}

const ESCENARIOS = [
  { nombre: 'MX→MX (pesos)', mut: () => {} },
  {
    nombre: 'MX→extranjero (USD)',
    mut: (d) => {
      d.partes.ofertante.nacionalidad = 'canadiense';
      d.campos.precio.moneda = 'USD';
      d.campos.precio.precio_total = 500000;
      d.campos.precio.deposito_escrow = 50000;
      d.campos.precio.precio_inmueble = 450000;
      d.campos.precio.precio_muebles = 50000;
      d.campos.inmueble.es_condominio = true;
    },
  },
];

function render(estado, escenario) {
  const datos = datosBase();
  escenario.mut(datos);
  datos.bloques = { ...estado };
  try {
    const ctx = ensamblarContexto(PLANTILLA, datos);
    const bloques = renderizarBloques(PLANTILLA, ctx);
    const texto = bloques.map(b => `${b.es || ''}\n${b.en || ''}`).join('\n');
    return { datos, bloques, texto, error: null };
  } catch (e) {
    return { datos, bloques: [], texto: '', error: e };
  }
}

console.log('\n══ QA: Invariantes sobre cobertura por pares ══');

// ════════════════════════════════════════════════════════════════
section('1 · Anti-deriva: la declaración contra el código');
// ════════════════════════════════════════════════════════════════

const src = fs.readFileSync(path.join(RAIZ, 'src/lib/plantillas/oferta_compra.js'), 'utf8');
const condicionalesReales = PLANTILLA.bloques.filter(b => b.condicional).map(b => b.id);
const lecturasEnCodigo = new Set([...src.matchAll(/ctx\.bloques\.([a-z_]+)/g)].map(m => m[1]));
const lecturasDeclaradas = new Set(Object.values(LECTURAS).flat());

const bloquesSinDeclarar = condicionalesReales.filter(id => !(id in INTERRUPTORES));
test('todo bloque condicional está en INTERRUPTORES', bloquesSinDeclarar.length === 0, bloquesSinDeclarar.join(', '));

const declaradosInexistentes = IDS.filter(
  id => INTERRUPTORES[id].tipo === 'bloque' && !condicionalesReales.includes(id));
test('todo INTERRUPTOR tipo "bloque" existe como bloque condicional', declaradosInexistentes.length === 0, declaradosInexistentes.join(', '));

const banderasMalClasificadas = IDS.filter(
  id => INTERRUPTORES[id].tipo === 'bandera' && condicionalesReales.includes(id));
test('ninguna "bandera" es en realidad un bloque', banderasMalClasificadas.length === 0, banderasMalClasificadas.join(', '));

const lecturasHuerfanas = [...lecturasEnCodigo].filter(id => !lecturasDeclaradas.has(id));
test('toda lectura cruzada ctx.bloques.* del código está declarada en LECTURAS', lecturasHuerfanas.length === 0, lecturasHuerfanas.join(', '));

const lecturasFantasma = [...lecturasDeclaradas].filter(id => !lecturasEnCodigo.has(id));
test('LECTURAS no declara lecturas que ya no existen', lecturasFantasma.length === 0, lecturasFantasma.join(', '));

const interruptoresSinRespaldo = IDS.filter(
  id => INTERRUPTORES[id].tipo === 'bandera' && !lecturasEnCodigo.has(id));
test('toda "bandera" declarada se lee en algún render', interruptoresSinRespaldo.length === 0, interruptoresSinRespaldo.join(', '));

// ════════════════════════════════════════════════════════════════
section('2 · Generación de casos por pares');
// ════════════════════════════════════════════════════════════════

const defaults = Object.fromEntries(IDS.map(id => [id, INTERRUPTORES[id].default]));
const casos = generarPares(IDS, esLegal, defaults);
const cobertura = verificarCobertura(casos, IDS, esLegal);

console.log(`  ${GRIS}${IDS.length} interruptores · espacio exhaustivo 2^${IDS.length} ≈ ${(2 ** IDS.length).toExponential(1)}${RESET}`);
console.log(`  ${GRIS}${casos.length} casos generados · ${cobertura.cubiertos}/${cobertura.alcanzables} pares alcanzables cubiertos${RESET}`);

test('la cobertura por pares es completa', cobertura.faltantes.length === 0,
  cobertura.faltantes.slice(0, 3).join(' | '));
test('el conjunto generado es pequeño (< 40 casos)', casos.length < 40, `${casos.length} casos`);
test('todos los casos generados son legales', casos.every(esLegal));

// ════════════════════════════════════════════════════════════════
section(`3 · Invariantes sobre ${casos.length * ESCENARIOS.length} renders`);
// ════════════════════════════════════════════════════════════════

const resultados = new Map(INVARIANTES.map(inv => [inv.id, { evaluados: 0, fallos: [] }]));

for (const escenario of ESCENARIOS) {
  for (const [i, estado] of casos.entries()) {
    const r = render(estado, escenario);
    for (const inv of INVARIANTES) {
      if (inv.aplica && !inv.aplica(r)) continue;
      const acc = resultados.get(inv.id);
      acc.evaluados++;
      const { ok, detalle } = inv.check(r);
      if (!ok) {
        const encendidos = IDS.filter(id => estado[id]);
        acc.fallos.push({ escenario: escenario.nombre, caso: i, detalle, encendidos });
      }
    }
  }
}

for (const inv of INVARIANTES) {
  const acc = resultados.get(inv.id);
  const etiqueta = `${inv.id} ${GRIS}(${acc.evaluados} renders)${RESET}`;
  if (acc.fallos.length === 0) {
    test(etiqueta, true);
  } else {
    const f = acc.fallos[0];
    test(etiqueta, false, `${acc.fallos.length} fallo(s) · [${f.escenario} caso ${f.caso}] ${f.detalle}`);
    console.log(`     ${AMBAR}↳ encendidos: ${f.encendidos.join(', ') || '(ninguno)'}${RESET}`);
    console.log(`     ${GRIS}↳ porqué importa: ${inv.porque}${RESET}`);
  }
}

// ════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
if (failed === 0) {
  console.log(`  ${VERDE}RESULTADO: ${passed}/${passed + failed} — TODO OK${RESET}`);
} else {
  console.log(`  ${ROJO}RESULTADO: ${passed}/${passed + failed} — ${failed} FALLO(S)${RESET}`);
  fallas.forEach(f => console.log(`   ${ROJO}·${RESET} ${f}`));
}
console.log('══════════════════════════════════════════════════════════\n');
process.exit(failed === 0 ? 0 : 1);
