#!/usr/bin/env node
/**
 * QA MASTER: Ejecuta todos los tests de OfertaGen
 * 
 * Ejecutar: node qa/test_all.mjs
 * 
 * Incluye:
 * - test_full.mjs (119 assertions) - Análisis estático
 * - test_fideicomiso.mjs (26 assertions) - Lógica fideicomiso
 * - test_integration.mjs (48 assertions) - Generación documentos
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VERDE = '\x1b[32m';
const ROJO = '\x1b[31m';
const CYAN = '\x1b[36m';
const AMARILLO = '\x1b[33m';
const RESET = '\x1b[0m';

const tests = [
  { name: 'Análisis Estático', file: 'test_full.mjs' },
  { name: 'Lógica Fideicomiso', file: 'test_fideicomiso.mjs' },
  { name: 'Integración DOCX', file: 'test_integration.mjs' },
];

async function runTest(test) {
  return new Promise((resolve) => {
    const start = Date.now();
    const proc = spawn('node', [join(__dirname, test.file)], {
      stdio: 'pipe',
      cwd: join(__dirname, '..')
    });

    let output = '';
    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { output += data.toString(); });

    proc.on('close', (code) => {
      const elapsed = Date.now() - start;
      resolve({ 
        name: test.name, 
        file: test.file,
        passed: code === 0, 
        elapsed,
        output 
      });
    });
  });
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${CYAN}QA MASTER: OfertaGen — Suite Completa${RESET}`);
  console.log('═'.repeat(60));

  const startTotal = Date.now();
  const results = [];

  for (const test of tests) {
    process.stdout.write(`\n  ⏳ ${test.name}...`);
    const result = await runTest(test);
    results.push(result);
    
    if (result.passed) {
      console.log(`\r  ${VERDE}✅${RESET} ${test.name} (${result.elapsed}ms)`);
    } else {
      console.log(`\r  ${ROJO}❌${RESET} ${test.name} (${result.elapsed}ms)`);
    }
  }

  const totalElapsed = Date.now() - startTotal;
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;

  // Extraer totales de cada test
  let totalAssertions = 0;
  for (const r of results) {
    const match = r.output.match(/(\d+)\/(\d+) tests/);
    if (match) {
      totalAssertions += parseInt(match[2]);
    }
  }

  console.log('\n' + '═'.repeat(60));
  if (allPassed) {
    console.log(`  ${VERDE}✅ TODOS LOS TESTS PASAN${RESET}`);
    console.log(`  ${passedCount}/${tests.length} suites | ~${totalAssertions} assertions | ${totalElapsed}ms`);
  } else {
    console.log(`  ${ROJO}❌ ALGUNOS TESTS FALLARON${RESET}`);
    console.log(`  ${passedCount}/${tests.length} suites pasaron`);
    
    console.log(`\n  ${AMARILLO}Detalles de fallos:${RESET}`);
    for (const r of results.filter(r => !r.passed)) {
      console.log(`\n  ${ROJO}── ${r.name} ──${RESET}`);
      // Mostrar solo las líneas con ❌
      const lines = r.output.split('\n').filter(l => l.includes('❌'));
      for (const line of lines.slice(0, 10)) {
        console.log(`  ${line}`);
      }
    }
  }
  console.log('═'.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

main();
