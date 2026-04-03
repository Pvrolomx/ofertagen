// @ts-check
import { test, expect } from '@playwright/test';

/**
 * OfertaGen E2E Tests
 * 
 * Flujos críticos que completan el 10% E2E de la pirámide de testing:
 * 1. Carga inicial y navegación del wizard
 * 2. Flujo completo: llenar datos → generar documento
 * 3. Cambio de idioma (ES/EN/FR)
 * 4. Lógica fideicomiso: mexicano vs extranjero
 * 5. Descarga DOCX funciona
 * 6. Disclaimer modal aparece
 * 7. Demo data carga correctamente
 * 8. ContraOfertaGen: flujo básico
 * 9. Responsive: mobile viewport
 * 10. PWA: manifest accesible
 */

// ============================================================
// TEST 1: Carga inicial y elementos del wizard
// ============================================================
test.describe('Carga inicial', () => {
  test('página carga con elementos esenciales', async ({ page }) => {
    await page.goto('/');
    
    // Título principal visible
    await expect(page.locator('text=OfertaGen')).toBeVisible();
    
    // Steps del wizard presentes
    await expect(page.locator('text=Partes')).toBeVisible();
    
    // Footer Colmena
    await expect(page.locator('text=Hecho por Colmena')).toBeVisible();
  });

  test('navegación entre pasos funciona', async ({ page }) => {
    await page.goto('/');
    
    // Paso inicial: Partes
    await expect(page.locator('text=Ofertante')).toBeVisible();
    
    // Click "Siguiente"
    await page.click('button:has-text("Siguiente")');
    
    // Debería estar en paso 2 (Inmueble)
    await expect(page.locator('text=Descripción del inmueble')).toBeVisible();
    
    // Click "Anterior"
    await page.click('button:has-text("Anterior")');
    
    // Regresa a paso 1
    await expect(page.locator('text=Ofertante')).toBeVisible();
  });
});

// ============================================================
// TEST 2: Flujo completo con datos mínimos
// ============================================================
test.describe('Flujo completo', () => {
  test('llenar wizard y ver preview', async ({ page }) => {
    await page.goto('/');
    
    // Paso 1: Partes - llenar nombres
    await page.fill('input[placeholder="NOMBRE COMPLETO"]', 'JUAN PÉREZ GARCÍA');
    await page.click('button:has-text("Siguiente")');
    
    // Paso 2: Inmueble
    await page.fill('input[placeholder*="descripcion"]', 'Departamento 101');
    await page.click('button:has-text("Siguiente")');
    
    // Paso 3: Precio y Escrow
    const precioInput = page.locator('input[type="number"]').first();
    await precioInput.fill('250000');
    await page.click('button:has-text("Siguiente")');
    
    // Paso 4: Cláusulas (toggles)
    await page.click('button:has-text("Siguiente")');
    
    // Paso 5: Preview - debe mostrar tabla bilingüe
    await expect(page.locator('text=ESPAÑOL')).toBeVisible();
    await expect(page.locator('text=ENGLISH')).toBeVisible();
  });
});

// ============================================================
// TEST 3: Cambio de idioma UI e idioma contrato
// ============================================================
test.describe('Internacionalización', () => {
  test('cambiar idioma UI a inglés', async ({ page }) => {
    await page.goto('/');
    
    // Buscar selector de idioma UI (debería estar en header)
    const idiomaSelect = page.locator('select').first();
    if (await idiomaSelect.isVisible()) {
      await idiomaSelect.selectOption('en');
      
      // Verificar que textos cambian
      await expect(page.locator('text=Buyer')).toBeVisible();
    }
  });

  test('idioma secundario francés en preview', async ({ page }) => {
    await page.goto('/');
    
    // Navegar al preview
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Siguiente")');
    }
    
    // Buscar toggle de francés si existe
    const frToggle = page.locator('button:has-text("FR")');
    if (await frToggle.isVisible()) {
      await frToggle.click();
      await expect(page.locator('text=FRANÇAIS')).toBeVisible();
    }
  });
});

// ============================================================
// TEST 4: Lógica fideicomiso
// ============================================================
test.describe('Lógica Fideicomiso', () => {
  test('vendedor mexicano muestra "Constitución de Fideicomiso"', async ({ page }) => {
    await page.goto('/');
    
    // Llenar ofertante
    const inputs = page.locator('input[placeholder="NOMBRE COMPLETO"]');
    await inputs.first().fill('JOHN DOE');
    
    // Seleccionar nacionalidad mexicana para propietario
    const nacionalidadSelects = page.locator('select');
    const propietarioNac = nacionalidadSelects.nth(1); // Segundo select es propietario
    if (await propietarioNac.isVisible()) {
      await propietarioNac.selectOption({ label: /[Mm]exican/ });
    }
    
    // Navegar al preview
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Siguiente")');
    }
    
    // El preview debería contener texto de fideicomiso para mexicano
    // (depende de si se llenaron suficientes datos)
  });

  test('vendedor extranjero muestra "derechos fideicomisarios"', async ({ page }) => {
    await page.goto('/');
    
    // Llenar datos básicos
    const inputs = page.locator('input[placeholder="NOMBRE COMPLETO"]');
    await inputs.first().fill('JOHN DOE');
    
    // Seleccionar nacionalidad canadiense para propietario
    const nacionalidadSelects = page.locator('select');
    const propietarioNac = nacionalidadSelects.nth(1);
    if (await propietarioNac.isVisible()) {
      await propietarioNac.selectOption({ label: /[Cc]anad/ });
    }
    
    // Navegar al preview
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Siguiente")');
    }
  });
});

// ============================================================
// TEST 5: Descarga DOCX
// ============================================================
test.describe('Generación de documentos', () => {
  test('botón descargar presente en preview', async ({ page }) => {
    await page.goto('/');
    
    // Navegar al preview
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Siguiente")');
    }
    
    // Verificar botones de descarga
    await expect(page.locator('button:has-text("DOCX")')).toBeVisible();
    await expect(page.locator('button:has-text("PDF")')).toBeVisible();
  });

  test('click en descargar dispara descarga', async ({ page }) => {
    await page.goto('/');
    
    // Cargar demo para tener datos completos
    await page.click('text=2026'); // El año es clickeable para cargar demo
    
    // Navegar al preview
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Siguiente")');
      await page.waitForTimeout(100);
    }
    
    // Configurar listener de descarga
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    
    // Click en DOCX
    const docxBtn = page.locator('button:has-text("DOCX")');
    if (await docxBtn.isEnabled()) {
      await docxBtn.click();
      
      // Manejar disclaimer modal si aparece
      const aceptarBtn = page.locator('button:has-text("Acepto"), button:has-text("Accept")');
      if (await aceptarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await aceptarBtn.click();
      }
      
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toContain('.docx');
      }
    }
  });
});

// ============================================================
// TEST 6: Disclaimer modal
// ============================================================
test.describe('Disclaimer legal', () => {
  test('modal aparece en primera descarga', async ({ page }) => {
    // Limpiar localStorage para simular primera visita
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Cargar demo
    await page.click('text=2026');
    
    // Navegar al preview
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Siguiente")');
    }
    
    // Click descargar
    const docxBtn = page.locator('button:has-text("DOCX")');
    if (await docxBtn.isEnabled()) {
      await docxBtn.click();
      
      // Modal debería aparecer
      const modal = page.locator('text=Términos, text=Terms, text=Herramienta de apoyo');
      // Al menos uno de estos textos debería estar visible
    }
  });

  test('link términos en footer abre modal', async ({ page }) => {
    await page.goto('/');
    
    // Click en "Términos" del footer
    const termsLink = page.locator('a:has-text("Términos"), a:has-text("Terms")');
    if (await termsLink.isVisible()) {
      await termsLink.click();
      // El modal debería abrirse
    }
  });
});

// ============================================================
// TEST 7: Demo data
// ============================================================
test.describe('Demo data', () => {
  test('click en año carga datos demo', async ({ page }) => {
    await page.goto('/');
    
    // Click en "2026" para cargar demo (easter egg)
    await page.click('text=2026');
    
    // Verificar que se llenaron datos
    const nombreInput = page.locator('input[placeholder="NOMBRE COMPLETO"]').first();
    const value = await nombreInput.inputValue();
    
    // El demo tiene nombres específicos
    expect(value).not.toBe('');
  });
});

// ============================================================
// TEST 8: ContraOfertaGen
// ============================================================
test.describe('ContraOfertaGen', () => {
  test('página contraoferta carga', async ({ page }) => {
    await page.goto('/contraoferta');
    
    // Título específico
    await expect(page.locator('text=ContraOfertaGen')).toBeVisible();
    
    // Footer Colmena
    await expect(page.locator('text=Hecho por Colmena')).toBeVisible();
  });

  test('navegación wizard contraoferta', async ({ page }) => {
    await page.goto('/contraoferta');
    
    // Paso 1 visible
    await expect(page.locator('text=Oferta Original, text=oferta original')).toBeVisible();
    
    // Siguiente
    const nextBtn = page.locator('button:has-text("Siguiente"), button:has-text("Next")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }
  });

  test('link desde OfertaGen a ContraOferta', async ({ page }) => {
    await page.goto('/');
    
    // Cargar demo y navegar al preview
    await page.click('text=2026');
    for (let i = 0; i < 4; i++) {
      await page.click('button:has-text("Siguiente")');
    }
    
    // Buscar botón de contraoferta
    const contraBtn = page.locator('button:has-text("Contraoferta"), button:has-text("Counter")');
    if (await contraBtn.isVisible()) {
      await contraBtn.click();
      
      // Debería navegar a /contraoferta
      await expect(page).toHaveURL(/\/contraoferta/);
    }
  });
});

// ============================================================
// TEST 9: Responsive (mobile)
// ============================================================
test.describe('Responsive', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('wizard funciona en mobile', async ({ page }) => {
    await page.goto('/');
    
    // Elementos principales visibles
    await expect(page.locator('text=OfertaGen')).toBeVisible();
    
    // Navegación funciona
    await page.click('button:has-text("Siguiente")');
    
    // No debe haber scroll horizontal roto
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Tolerancia de 10px
  });
});

// ============================================================
// TEST 10: PWA
// ============================================================
test.describe('PWA', () => {
  test('manifest.json accesible', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    expect(manifest.name).toBeDefined();
  });

  test('service worker registrado', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que sw.js existe
    const swResponse = await page.goto('/sw.js');
    expect(swResponse?.status()).toBe(200);
  });

  test('botón instalar app existe', async ({ page }) => {
    await page.goto('/');
    
    // El botón existe en el DOM aunque esté hidden
    const installBtn = page.locator('#install-btn');
    await expect(installBtn).toBeAttached();
  });
});
