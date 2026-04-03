// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * OfertaGen E2E Tests - Configuración Playwright
 * 
 * Ejecutar:
 *   npm run test:e2e          # Headless (CI)
 *   npm run test:e2e:ui       # Con UI (desarrollo)
 *   npm run test:e2e:debug    # Debug mode
 */

export default defineConfig({
  testDir: './qa/e2e',
  
  // Timeout por test (los flujos completos pueden tardar)
  timeout: 60 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 10 * 1000,
  },

  // Correr tests en paralelo
  fullyParallel: true,
  
  // Fail fast en CI
  forbidOnly: !!process.env.CI,
  
  // Reintentos: 2 en CI, 0 local
  retries: process.env.CI ? 2 : 0,
  
  // Workers: 1 en CI para estabilidad, auto local
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: process.env.CI 
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  // Configuración global
  use: {
    // Base URL del servidor Next.js
    baseURL: 'http://localhost:3000',

    // Capturar trace solo en fallo
    trace: 'on-first-retry',
    
    // Screenshot en fallo
    screenshot: 'only-on-failure',
    
    // Video en fallo (CI only)
    video: process.env.CI ? 'on-first-retry' : 'off',
  },

  // Proyectos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile viewport para responsive
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Levantar servidor Next.js antes de tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos para build
  },
});
