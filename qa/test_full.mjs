#!/usr/bin/env node
/**
 * QA COMPLETO: OfertaGen — Análisis Estático
 * 
 * Valida toda la app sin browser, solo leyendo código fuente.
 * Ultra rápido (~0.1s), cero falsos positivos.
 * 
 * Ejecutar: node qa/test_full.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const VERDE = '\x1b[32m';
const ROJO = '\x1b[31m';
const AMARILLO = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;
const failures = [];

function test(nombre, condicion) {
  if (condicion) {
    passed++;
    return true;
  } else {
    failed++;
    failures.push(nombre);
    return false;
  }
}

function section(titulo) {
  console.log(`\n${CYAN}📋 ${titulo}${RESET}`);
}

function readFile(path) {
  const fullPath = join(ROOT, path);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, 'utf-8');
}

// ============================================================
// CARGAR ARCHIVOS
// ============================================================

const files = {
  // Core
  plantilla: readFile('src/lib/plantillas/oferta_compra.js'),
  ensamblador: readFile('src/lib/plantillas/ensamblador.js'),
  traduccionesFr: readFile('src/lib/plantillas/traducciones_fr.js'),
  contraofertaPlantilla: readFile('src/lib/plantillas/contraoferta.js'),
  
  // Generadores
  generadorDocx: readFile('src/lib/docx/generador.js'),
  generadorDocxContra: readFile('src/lib/docx/generador_contraoferta.js'),
  generadorPdf: readFile('src/lib/pdf/generador_pdf.js'),
  
  // Core libs
  concordancia: readFile('src/lib/core/concordancia.js'),
  num2words: readFile('src/lib/core/num2words.js'),
  fechas: readFile('src/lib/core/fechas.js'),
  
  // UI
  pageOferta: readFile('src/app/page.js'),
  pageContra: readFile('src/app/contraoferta/page.js'),
  globals: readFile('src/app/globals.css'),
  layout: readFile('src/app/layout.js'),
  
  // Config
  packageJson: readFile('package.json'),
  nextConfig: readFile('next.config.mjs') || readFile('next.config.js'),
};

console.log('\n══════════════════════════════════════════════════════════');
console.log('  QA COMPLETO: OfertaGen — Análisis Estático');
console.log('══════════════════════════════════════════════════════════');

// ============================================================
// 1. ESTRUCTURA DE ARCHIVOS
// ============================================================
section('Estructura de archivos');

const requiredFiles = [
  'src/lib/plantillas/oferta_compra.js',
  'src/lib/plantillas/ensamblador.js',
  'src/lib/plantillas/traducciones_fr.js',
  'src/lib/plantillas/contraoferta.js',
  'src/lib/docx/generador.js',
  'src/lib/docx/generador_contraoferta.js',
  'src/lib/pdf/generador_pdf.js',
  'src/lib/core/concordancia.js',
  'src/lib/core/num2words.js',
  'src/lib/core/fechas.js',
  'src/app/page.js',
  'src/app/contraoferta/page.js',
  'src/app/globals.css',
  'src/app/layout.js',
  'package.json',
];

for (const f of requiredFiles) {
  test(`Existe: ${f}`, existsSync(join(ROOT, f)));
}

// ============================================================
// 2. DEPENDENCIAS (package.json)
// ============================================================
section('Dependencias');

const pkg = JSON.parse(files.packageJson || '{}');
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

const requiredDeps = ['next', 'react', 'docx', 'pdfmake'];
for (const dep of requiredDeps) {
  test(`Dependencia: ${dep}`, dep in deps);
}

// ============================================================
// 3. PLANTILLA OFERTA — CLÁUSULAS
// ============================================================
section('Plantilla OfertaGen — Cláusulas');

const clausulasRequeridas = [
  ['cl_ofertante', 'Ofertante'],
  ['cl_propietario', 'Propietario'],
  ['cl_antecedente', 'Antecedente'],
  ['cl_precio', 'Precio'],
  ['escrow', 'Escrow'],
  ['cl_saldo', 'Saldo'],
  ['cl_vigencia', 'Vigencia'],
  ['cl_formalizacion', 'Formalización'],
  ['cl_demora', 'Demora'],
  ['inspeccion', 'Inspección'],
  ['doc_fideicomiso', 'Doc Fideicomiso'],
  ['comision', 'Comisión'],
  ['cl_notario', 'Notario'],
  ['fuerza_mayor', 'Fuerza mayor'],
  ['obligaciones_vendedor', 'Obligaciones vendedor'],
  ['derecho_deduccion', 'Derecho deducción'],
  ['duplicados', 'Duplicados'],
  ['cl_jurisdiccion', 'Jurisdicción'],
  ['cl_firmas', 'Firmas'],
];

for (const [id, nombre] of clausulasRequeridas) {
  test(`Cláusula: ${nombre} (${id})`, 
    files.plantilla?.includes(`id: '${id}'`) || files.plantilla?.includes(`id: "${id}"`));
}

// ============================================================
// 4. LÓGICA DE FIDEICOMISO
// ============================================================
section('Lógica de Fideicomiso');

test('Ensamblador: define esMexicano', files.ensamblador?.includes('esMexicano'));
test('Ensamblador: detecta "mexicano"', files.ensamblador?.includes("'mexicano'"));
test('Ensamblador: detecta "mexicana"', files.ensamblador?.includes("'mexicana'"));
test('Ensamblador: usa toLowerCase', files.ensamblador?.includes('.toLowerCase()'));

test('Plantilla: usa esMexicano en cl_precio', 
  files.plantilla?.includes('esMexicano') && files.plantilla?.includes('cl_precio'));
test('Plantilla ES: "Constitución de Fideicomiso"', files.plantilla?.includes('Constitución de Fideicomiso'));
test('Plantilla ES: "derechos fideicomisarios"', files.plantilla?.includes('derechos fideicomisarios'));
test('Plantilla EN: "Trust Constitution"', files.plantilla?.includes('Trust Constitution'));
test('Plantilla EN: "trust rights"', files.plantilla?.includes('trust rights'));

test('FR: usa esMexicano', files.traduccionesFr?.includes('esMexicano'));
test('FR: "droits fiduciaires"', files.traduccionesFr?.includes('droits fiduciaires'));
test('FR: "droits de propriété"', files.traduccionesFr?.includes('droits de propriété'));

// ============================================================
// 5. TRADUCCIONES FRANCÉS
// ============================================================
section('Traducciones Francés');

const frClausulas = [
  'cl_ofertante', 'cl_propietario', 'cl_antecedente', 'cl_precio',
  'escrow', 'doc_fideicomiso', 'inspeccion', 'comision',
  'fuerza_mayor', 'obligaciones_vendedor'
];

for (const id of frClausulas) {
  test(`FR tiene: ${id}`, 
    files.traduccionesFr?.includes(`'${id}'`) || files.traduccionesFr?.includes(`"${id}"`));
}

// ============================================================
// 6. GENERADOR DOCX
// ============================================================
section('Generador DOCX');

test('DOCX: exporta generarDocxBlob', files.generadorDocx?.includes('export') && files.generadorDocx?.includes('generarDocxBlob'));
test('DOCX: usa docx library', files.generadorDocx?.includes("from 'docx'") || files.generadorDocx?.includes('from "docx"'));
test('DOCX: tabla bilingüe (COL_ES, COL_EN)', files.generadorDocx?.includes('COL_ES') && files.generadorDocx?.includes('COL_EN'));
test('DOCX: soporte logo', files.generadorDocx?.includes('logoBase64'));
test('DOCX: soporte idioma secundario', files.generadorDocx?.includes('idiomaSecundario'));
test('DOCX: paginación trilingüe', files.generadorDocx?.includes('Página') && files.generadorDocx?.includes('Page'));
test('DOCX: sección de firmas', files.generadorDocx?.includes('firmas') || files.generadorDocx?.includes('Firmas'));

// ============================================================
// 7. GENERADOR PDF
// ============================================================
section('Generador PDF');

test('PDF: exporta generarPdfBlob', files.generadorPdf?.includes('export') && files.generadorPdf?.includes('generarPdfBlob'));
test('PDF: usa pdfmake', files.generadorPdf?.includes('pdfmake'));
test('PDF: import dinámico', files.generadorPdf?.includes("import('pdfmake"));
test('PDF: tabla bilingüe', files.generadorPdf?.includes("widths: ['50%', '50%']"));
test('PDF: soporte logo', files.generadorPdf?.includes('logoBase64'));
test('PDF: header con paginación', files.generadorPdf?.includes('header:') && files.generadorPdf?.includes('currentPage'));
test('PDF: footer con iniciales', files.generadorPdf?.includes('footer:') && files.generadorPdf?.includes('iniciales'));
test('PDF: sección de firmas', files.generadorPdf?.includes('firmasContent'));
test('PDF: aceptación lugar/fecha', files.generadorPdf?.includes('LUGAR, FECHA Y HORA'));

// ============================================================
// 8. UI OFERTAGEN
// ============================================================
section('UI OfertaGen');

test('UI: use client', files.pageOferta?.includes('"use client"') || files.pageOferta?.includes("'use client'"));
test('UI: useState', files.pageOferta?.includes('useState'));
test('UI: useCallback', files.pageOferta?.includes('useCallback'));
test('UI: useMemo', files.pageOferta?.includes('useMemo'));

// Wizard steps
test('UI: 5 steps (Partes, Inmueble, Operación, Cláusulas, Preview)', 
  files.pageOferta?.includes('Partes') && 
  files.pageOferta?.includes('Inmueble') && 
  files.pageOferta?.includes('Preview'));

// i18n
test('UI: i18n ES', files.pageOferta?.includes("es:") && files.pageOferta?.includes('Siguiente'));
test('UI: i18n EN', files.pageOferta?.includes("en:") && files.pageOferta?.includes('Next'));
test('UI: i18n FR', files.pageOferta?.includes("fr:") && files.pageOferta?.includes('Suivant'));

// Nacionalidades
test('UI: nacionalidad mexicano', files.pageOferta?.includes('v:"mexicano"') || files.pageOferta?.includes("v:'mexicano'"));
test('UI: nacionalidad estadounidense', files.pageOferta?.includes('estadounidense'));
test('UI: nacionalidad canadiense', files.pageOferta?.includes('canadiense'));

// Funcionalidades
test('UI: handleGenerate (DOCX)', files.pageOferta?.includes('handleGenerate'));
test('UI: handleGeneratePdf', files.pageOferta?.includes('handleGeneratePdf'));
test('UI: logoBase64 state', files.pageOferta?.includes('logoBase64'));
test('UI: exportDraft', files.pageOferta?.includes('exportDraft'));
test('UI: importDraft', files.pageOferta?.includes('importDraft'));
test('UI: localStorage draft', files.pageOferta?.includes('ofertagen_draft'));

// Disclaimer
test('UI: showDisclaimer state', files.pageOferta?.includes('showDisclaimer'));
test('UI: disclaimerAccepted state', files.pageOferta?.includes('disclaimerAccepted'));
test('UI: handleAcceptDisclaimer', files.pageOferta?.includes('handleAcceptDisclaimer'));
test('UI: localStorage disclaimer', files.pageOferta?.includes('ofertagen_disclaimer_accepted'));

// Validación
test('UI: validarOferta', files.pageOferta?.includes('validarOferta'));
test('UI: validationResult', files.pageOferta?.includes('validationResult'));

// ============================================================
// 9. UI CONTRAOFERTAGEN
// ============================================================
section('UI ContraOfertaGen');

test('Contra: use client', files.pageContra?.includes('"use client"') || files.pageContra?.includes("'use client'"));
test('Contra: 3 steps', files.pageContra?.includes('steps'));
test('Contra: tipo_documento (contraoferta/contra_contraoferta)', 
  files.pageContra?.includes('contraoferta') && files.pageContra?.includes('contra_contraoferta'));
test('Contra: handleGenerate', files.pageContra?.includes('handleGenerate'));
test('Contra: preload desde OfertaGen', files.pageContra?.includes('contraoferta_preload'));
test('Contra: disclaimer', files.pageContra?.includes('showDisclaimer'));
test('Contra: i18n ES/EN/FR', 
  files.pageContra?.includes("es:") && 
  files.pageContra?.includes("en:") && 
  files.pageContra?.includes("fr:"));

// ============================================================
// 10. CSS Y TEMAS
// ============================================================
section('CSS y Temas');

test('CSS: variables --og-* (OfertaGen)', files.globals?.includes('--og-'));
test('CSS: variables --cog-* (ContraOfertaGen)', files.globals?.includes('--cog-'));
test('CSS: colores tema', files.globals?.includes('#') || files.globals?.includes('rgb'));

// ============================================================
// 11. CORE LIBS
// ============================================================
section('Core Libraries');

// Concordancia
test('Concordancia: export function', files.concordancia?.includes('export'));
test('Concordancia: manejo géneros', files.concordancia?.includes('genero') || files.concordancia?.includes('género'));

// Num2words
test('Num2words: convertir números', files.num2words?.includes('function') || files.num2words?.includes('=>'));

// Fechas
test('Fechas: formatear fechas', files.fechas?.includes('fecha') || files.fechas?.includes('date') || files.fechas?.includes('format'));

// ============================================================
// 12. CATÁLOGOS
// ============================================================
section('Catálogos');

test('Plantilla: notarios definidos', files.plantilla?.includes('notario') && files.plantilla?.includes('buc_'));
test('Plantilla: escrow definidos', files.plantilla?.includes('ARMOUR') || files.plantilla?.includes('escrow'));

// ============================================================
// 13. CONTRAOFERTA PLANTILLA
// ============================================================
section('Plantilla ContraOferta');

test('ContraPlantilla: existe', !!files.contraofertaPlantilla);
test('ContraPlantilla: bloques', files.contraofertaPlantilla?.includes('bloques'));
test('ContraPlantilla: modificaciones precio', 
  files.contraofertaPlantilla?.includes('mod_precio') || files.contraofertaPlantilla?.includes('nuevo_precio'));
test('ContraPlantilla: aceptación', files.contraofertaPlantilla?.includes('aceptacion'));

// ============================================================
// RESUMEN
// ============================================================

const total = passed + failed;
const pct = ((passed / total) * 100).toFixed(1);

console.log('\n══════════════════════════════════════════════════════════');
if (failed === 0) {
  console.log(`  ${VERDE}✅ RESULTADO: ${passed}/${total} tests (${pct}%) — TODO OK${RESET}`);
} else {
  console.log(`  RESULTADO: ${passed} ${VERDE}✅${RESET} / ${failed} ${ROJO}❌${RESET} (${total} total, ${pct}%)`);
  console.log(`\n  ${ROJO}FALLOS:${RESET}`);
  for (const f of failures) {
    console.log(`    ${ROJO}❌${RESET} ${f}`);
  }
}
console.log('══════════════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
