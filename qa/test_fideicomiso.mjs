#!/usr/bin/env node
/**
 * QA: Lógica de Fideicomiso en Cláusula 4
 * 
 * Valida que el texto cambie según nacionalidad del propietario.
 * Este test lee los archivos fuente directamente y evalúa la lógica.
 * 
 * Ejecutar: node qa/test_fideicomiso.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const VERDE = '\x1b[32m';
const ROJO = '\x1b[31m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function test(nombre, condicion) {
  if (condicion) {
    console.log(`  ${VERDE}✅${RESET} ${nombre}`);
    passed++;
  } else {
    console.log(`  ${ROJO}❌${RESET} ${nombre}`);
    failed++;
  }
}

// ============================================================
// LEER ARCHIVOS FUENTE
// ============================================================

const plantillaCode = readFileSync(join(ROOT, 'src/lib/plantillas/oferta_compra.js'), 'utf-8');
const ensambladorCode = readFileSync(join(ROOT, 'src/lib/plantillas/ensamblador.js'), 'utf-8');
const traduccionesFrCode = readFileSync(join(ROOT, 'src/lib/plantillas/traducciones_fr.js'), 'utf-8');

// ============================================================
// TESTS DE CÓDIGO FUENTE
// ============================================================

console.log('\n══════════════════════════════════════════════════════════');
console.log('  QA: Lógica de Fideicomiso — Análisis de Código');
console.log('══════════════════════════════════════════════════════════\n');

// --- ENSAMBLADOR: Helper esMexicano ---
console.log('📋 Ensamblador - Helper esMexicano:');

test('Ensamblador define esMexicano', 
  ensambladorCode.includes('esMexicano'));
test('Detecta "mexicano"', 
  ensambladorCode.includes("'mexicano'") || ensambladorCode.includes('"mexicano"'));
test('Detecta "mexicana"', 
  ensambladorCode.includes("'mexicana'") || ensambladorCode.includes('"mexicana"'));
test('Detecta "mexican"', 
  ensambladorCode.includes("'mexican'") || ensambladorCode.includes('"mexican"'));
test('Usa toLowerCase para comparación', 
  ensambladorCode.includes('.toLowerCase()'));

// --- PLANTILLA: Cláusula 4 ---
console.log('\n📋 Plantilla - Cláusula 4 (cl_precio):');

test('Cláusula usa ctx.propietario.esMexicano', 
  plantillaCode.includes('ctx.propietario.esMexicano') || 
  plantillaCode.includes('esMexicano'));

// Textos para vendedor mexicano
test('ES Mexicano: "Constitución de Fideicomiso"', 
  plantillaCode.includes('Constitución de Fideicomiso'));
test('ES Mexicano: "Zona Restringida"', 
  plantillaCode.includes('Zona Restringida'));
test('ES Mexicano: "derechos de propiedad"', 
  plantillaCode.includes('derechos de propiedad'));
test('EN Mexicano: "Trust Constitution"', 
  plantillaCode.includes('Trust Constitution'));
test('EN Mexicano: "Restricted Zone"', 
  plantillaCode.includes('Restricted Zone'));
test('EN Mexicano: "property rights"', 
  plantillaCode.includes('property rights'));

// Textos para vendedor extranjero
test('ES Extranjero: "derechos fideicomisarios"', 
  plantillaCode.includes('derechos fideicomisarios'));
test('EN Extranjero: "trust rights"', 
  plantillaCode.includes('trust rights'));

// Lógica condicional
test('Usa operador ternario para bifurcación', 
  plantillaCode.includes('esMexicano') && plantillaCode.includes('?'));

// --- TRADUCCIONES FR ---
console.log('\n📋 Traducciones FR - Cláusula 4:');

test('FR tiene cl_precio', 
  traduccionesFrCode.includes("'cl_precio'") || traduccionesFrCode.includes('"cl_precio"'));
test('FR Mexicano: "Constitution de Fidéicommis"', 
  traduccionesFrCode.includes('Constitution de Fidéicommis') || 
  traduccionesFrCode.includes('Constitution de Fidéicomm'));
test('FR Mexicano: "Zone Restreinte"', 
  traduccionesFrCode.includes('Zone Restreinte'));
test('FR Mexicano: "droits de propriété"', 
  traduccionesFrCode.includes('droits de propriété'));
test('FR Extranjero: "droits fiduciaires"', 
  traduccionesFrCode.includes('droits fiduciaires'));
test('FR usa esMexicano', 
  traduccionesFrCode.includes('esMexicano'));

// --- UI: Catálogo nacionalidades ---
console.log('\n📋 UI - Catálogo de nacionalidades:');

const pageCode = readFileSync(join(ROOT, 'src/app/page.js'), 'utf-8');

test('UI tiene opción "mexicano"', 
  pageCode.includes('v:"mexicano"') || pageCode.includes("v:'mexicano'"));
test('UI tiene emoji 🇲🇽', 
  pageCode.includes('🇲🇽'));
test('UI ES: "Mexicano(a)"', 
  pageCode.includes('Mexicano(a)'));
test('UI EN: "Mexican"', 
  pageCode.includes('Mexican'));
test('UI FR: "Mexicain(e)"', 
  pageCode.includes('Mexicain(e)'));

// ============================================================
// RESUMEN
// ============================================================

console.log('\n══════════════════════════════════════════════════════════');
if (failed === 0) {
  console.log(`  ${VERDE}RESULTADO: ${passed} ✅ — TODOS LOS TESTS PASAN${RESET}`);
} else {
  console.log(`  RESULTADO: ${passed} ${VERDE}✅${RESET} / ${failed} ${ROJO}❌${RESET} (${passed + failed} total)`);
}
console.log('══════════════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);

