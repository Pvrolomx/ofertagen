#!/usr/bin/env node
/**
 * QA: round-trip del borrador embebido en el .docx
 *
 * El .docx generado lleva el borrador completo en docProps/custom.xml bajo la
 * propiedad `ofertagen_data`, igual que PoderGen y GeneralesGen. Este test
 * verifica el ciclo entero: generar → abrir el zip → extraer → desescapar →
 * JSON.parse, y comparar contra el original.
 *
 * Importa porque el punto frágil es el escape XML: comillas, acentos, guiones
 * largos y ampersands dentro de los textos del expediente.
 *
 * Ejecutar: node qa/test_roundtrip_docx.mjs
 */

import JSZip from 'jszip';
import PLANTILLA from '../src/lib/plantillas/oferta_compra.js';
import { ensamblarContexto, renderizarBloques } from '../src/lib/plantillas/ensamblador.js';
import { generarDocx } from '../src/lib/docx/generador.js';

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

// Fixture con los caracteres que suelen romper el escape XML.
const data = {
  partes: {
    ofertante: {
      tipoPersona: 'fisica', nacionalidad: 'mexicano', domicilio: 'Calle "Los Álamos" 12 & 14',
      celular: '322 000 0000', email: 'a@b.mx',
      personas: [{ nombre: 'JUAN PÉREZ ÑÁNDEZ', genero: 'M', estado_civil: 'soltero' }],
    },
    propietario: {
      tipoPersona: 'fisica', nacionalidad: 'mexicano', domicilio: 'Av. México 58',
      celular: '322 111 1111', email: 'c@d.mx', titulo_vendedor: 'propietario',
      personas: [{ nombre: 'ALICIA NACINOVICH CÓRDOVA', genero: 'F', estado_civil: 'soltera' }],
    },
  },
  bloques: {
    precio_compuesto: true, mobiliario_separado: true, escrow: true, inspeccion: true,
    inventario: true, obligaciones_vendedor: true, doc_fideicomiso: true,
    gravamen_por_cancelar: true, fuerza_mayor: true, documentos_integrales: true,
  },
  campos: {
    inmueble: {
      descripcion_corta: 'Finca urbana «El Tiburón» —lote 5— con 20% de indiviso & anexos',
      ubicacion_completa: 'en el Fraccionamiento Valle Dorado, Nayarit',
      superficie_m2: 120.63, superficie_letras: 'ciento veinte metros sesenta y tres decímetros cuadrados',
      es_condominio: false, uso_mixto: true,
      superficie_habitacional_m2: 62.05, superficie_comercial_m2: 58.58,
    },
    antecedente: {
      fecha_escritura: '2004-02-13', numero_escritura: '29,808',
      notario_anterior: 'Lic. José Luis Bejar Fonseca',
      numero_notaria_anterior: '13', ciudad_notaria_anterior: 'Tepic, Nayarit',
    },
    precio: { precio_inmueble: 2800000, precio_muebles: 500000, moneda: 'MXN', deposito_escrow: 330000 },
    muebles: {
      objeto_es: 'del negocio denominado "Abarrotes La Esperanza" <con> anaqueles & refrigeradores',
      convenio_es: 'Contrato Privado de Compraventa de Negocio y Bienes Muebles',
    },
    gravamen: { acreedor: 'Hipotecaria Nacional, S.A. de C.V. & SHF, S.N.C.', dias_carta_saldo: 10 },
    escrow: { empresa_escrow: 'SECURE TITLE LATIN AMERICA INC' },
    fechas: { fecha_presentacion: '2026-09-08', ciudad_presentacion: 'Bucerías, Nayarit' },
    notario: {}, jurisdiccion: {}, penalidad: {}, comision: {},
    inspeccion: { dias_inspeccion: 5, dias_revision: 3 },
  },
};

const borrador = { version: '3.0', exportedAt: '2026-09-06T00:00:00.000Z', step: 4, data };

console.log('\n══ QA: round-trip del borrador embebido en el .docx ══\n');
console.log('📋 Generación');

const bloques = renderizarBloques(PLANTILLA, ensamblarContexto(PLANTILLA, data));
const buf = await generarDocx(bloques, PLANTILLA.meta, { idiomaSecundario: 'en', borrador });
test('El .docx se genera', buf && buf.length > 10000, `${buf?.length} bytes`);

// Sin `borrador`, el .docx NO debe traer la propiedad (retrocompatibilidad).
const bufSin = await generarDocx(bloques, PLANTILLA.meta, { idiomaSecundario: 'en' });
const zipSin = await JSZip.loadAsync(bufSin);
const cxSin = zipSin.file('docProps/custom.xml');
test('Sin `borrador` no se incrusta nada (retrocompatible)',
  !cxSin || !(await cxSin.async('string')).includes('ofertagen_data'));

console.log('\n📋 Extracción (mismo camino que importDraft)');

const zip = await JSZip.loadAsync(buf);
const cx = zip.file('docProps/custom.xml');
test('El .docx trae docProps/custom.xml', !!cx);

const xml = cx ? await cx.async('string') : '';
const m = xml.match(/name="ofertagen_data"[^>]*>\s*<vt:lpwstr>([\s\S]*?)<\/vt:lpwstr>/);
test('Contiene la propiedad ofertagen_data', !!m);

let back = null;
if (m) {
  const raw = m[1]
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
  try { back = JSON.parse(raw); } catch (e) { /* lo reporta el test siguiente */ }
}
test('El contenido desescapado es JSON válido', !!back);

console.log('\n📋 Fidelidad');

test('Round-trip exacto del objeto completo',
  JSON.stringify(back?.data) === JSON.stringify(data));
test('Conserva el step', back?.step === 4);
test('Conserva la versión', back?.version === '3.0');
test('Comillas dobles intactas',
  back?.data.campos.muebles.objeto_es.includes('"Abarrotes La Esperanza"'));
test('Ampersands intactos (sin doble-decodificar)',
  back?.data.campos.gravamen.acreedor.includes('C.V. & SHF') &&
  back?.data.partes.ofertante.domicilio.includes('12 & 14'));
test('Signos < > intactos',
  back?.data.campos.muebles.objeto_es.includes('<con>'));
test('Acentos y eñes intactos',
  back?.data.partes.propietario.personas[0].nombre === 'ALICIA NACINOVICH CÓRDOVA' &&
  back?.data.partes.ofertante.personas[0].nombre === 'JUAN PÉREZ ÑÁNDEZ');
test('Comillas angulares y guiones largos intactos',
  back?.data.campos.inmueble.descripcion_corta.includes('«El Tiburón» —lote 5—'));
test('Números siguen siendo números, no strings',
  back?.data.campos.precio.precio_inmueble === 2800000 &&
  back?.data.campos.inmueble.superficie_habitacional_m2 === 62.05);
test('Booleanos preservados', back?.data.campos.inmueble.uso_mixto === true &&
  back?.data.bloques.gravamen_por_cancelar === true);

const total = passed + failed;
console.log('\n' + '═'.repeat(58));
if (failed === 0) {
  console.log(`  ${VERDE}RESULTADO: ${passed}/${total} tests — TODO OK${RESET}`);
} else {
  console.log(`  ${ROJO}RESULTADO: ${passed}/${total} tests — ${failed} FALLO(S)${RESET}`);
}
console.log('═'.repeat(58) + '\n');

process.exit(failed === 0 ? 0 : 1);
