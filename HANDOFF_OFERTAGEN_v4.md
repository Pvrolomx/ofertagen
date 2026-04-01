# HANDOFF — OfertaGen v4.1
## Para el siguiente duende de la Colmena

**Fecha:** 1 Abril 2026
**Duende saliente:** Claude Opus 4.5 (sesión ContraOfertaGen — Sprints CA-1→CA-3)
**Duende anterior:** Claude Sonnet 4.6 (sesión épica — Sprints S→X + UX dark theme + i18n completo)
**Arquitecto:** Rolo (Rolando Romero García) — Expat Advisor MX

---

## QUÉ ES OFERTAGEN

Generador inteligente de ofertas de compra inmobiliaria **trilingüe (ES/EN/FR)** para el mercado de compradores extranjeros en Puerto Vallarta / Bahía de Banderas. Nació de un .docx y evolucionó a una app de producción con motor lingüístico de concordancia de género/número, tema oscuro azul, y soporte para compradores estadounidenses, canadienses anglófonos y francocanadienses.

**Live:** https://ofertagen.expatadvisormx.com
**Repo:** https://github.com/Pvrolomx/ofertagen
**Stack:** Next.js + Tailwind + docx-js + Vercel
**Vercel Project ID:** `prj_LtrLRc9NevQyg4uGneAJKT3spmF1`
**Vercel Team:** `team_xmFW0blsjqFI5lwt29wBPi8Q`

**Deploy:** `git push origin main` → Vercel auto-deploya via GitHub integration

---

## ARQUITECTURA

```
src/
  app/
    page.js          — UI completa wizard 5 pasos, ~1100 líneas
    layout.js        — Layout + PWA + SW registration
    globals.css      — Tema oscuro azul (Sprint W) — variables CSS og-*
  lib/
    core/
      concordancia.js — Motor lingüístico: concordancia G/N, singular colectivo, 10 roles, ES/EN/FR
      num2words.js    — Montos a letras español jurídico
      fechas.js       — ISO a prosa bilingüe
      index.js        — Re-exports
    plantillas/
      oferta_compra.js   — LA PLANTILLA: campos, bloques, cláusulas, renders (~1000 líneas)
      ensamblador.js     — Datos + plantilla → contexto completo
      traducciones_fr.js — Traducciones FR de los 23 bloques legacy (Sprint R)
    docx/
      generador.js       — DOCX bilingüe tabla lado a lado
  public/
    manifest.json, sw.js, icon-192.png, icon-512.png
qa/
  test_qa.py           — QA estático: 263 tests, 100%
  test_concordancia.py — QA concordancia lingüística: 151 tests, 100%
```

---

## ESTADO ACTUAL — SPRINTS COMPLETADOS

### Sprints I–M (sesión anterior) ✅
Ver HANDOFF_OFERTAGEN_v3.md para detalle.

### Sprint R — Soporte francés para DOCX ✅
- `concordancia.js`: `sustantivo_fr` en 10 roles, artículos FR, contexto `fr`
- `traducciones_fr.js`: traducciones FR de 23 bloques legacy
- `generador.js`: parámetro `idiomaSecundario` dinámico
- `page.js`: dropdown "ES | English" / "ES | Français" en preview

### Sprint S — Confidencialidad (NDA) ✅
- Bloque 24: `confidencialidad` — toggle OFF por default
- Trilingüe nativo ES/EN/FR (no en traducciones_fr.js)
- Dropdown meses post-cierre: 3/6/12/24

### Sprint T — Idioma comprador al Paso 1 ✅
- Selector de idioma movido del preview al Paso 1
- Lógica: toggle header = idioma UI, bloque Paso 1 = idioma del contrato

### Sprint U — Validador pre-generación ✅
- `validarOferta()`: campos críticos + placeholders + ratio ES/lang2
- Modal con errores críticos / advertencias / "Generar de todas formas"

### Sprints V-a + V-b — i18n UI completo ✅
- Objeto `UI` con 3 idiomas (ES/EN/FR): steps, sections, fields (~60 labels)
- Toggle ES/EN/FR en header cambia toda la interfaz
- `PartePanel` recibe `t` como prop

### Sprint W — Tema oscuro azul ✅
- `globals.css` reescrito: variables `--og-*`, fondo `#0d1117`, acentos `#388bfd`
- Inputs/selects oscuros, toggle pill azul, cards con borde sutil

### Sprint X — Toggle ES en header ✅
- Tres estados: ES (interfaz español), EN (interfaz inglés), FR (interfaz francés)
- `contractLang` separado de `idiomaSecundario` — mexicano puede llenar en ES con cliente FR
- Bloque "Idioma del comprador" en Paso 1: botones EN/FR independientes

---

## LÓGICA DE IDIOMAS (CRÍTICO)

```
idiomaSecundario  → idioma de la INTERFAZ (ES/EN/FR)
contractLang      → idioma secundario del CONTRATO (en/fr)
```

- Toggle header ES/EN/FR → cambia `idiomaSecundario` + pre-setea `contractLang`
- Botones EN/FR en Paso 1 → cambian solo `contractLang`
- Un mexicano (ES) puede tener cliente francocanadiense → UI en español, DOCX en ES/FR

---

## 24 BLOQUES CONDICIONALES

| # | ID | Default | Sprint |
|---|-----|---------|--------|
| 1 | `adjudicacion_conyuge` | OFF | v1 |
| 2 | `escrow` | ON | v1 |
| 3 | `inspeccion` | ON | v1 |
| 4 | `doc_fideicomiso` | ON | v1 |
| 5 | `financiamiento` | OFF | v1 |
| 6 | `inventario` | OFF | v1+K |
| 7 | `arrendamientos` | OFF | v1+K |
| 8 | `zona_federal` | OFF | v1 |
| 9 | `litigios_pendientes` | OFF | I |
| 10 | `empleados_condicion` | OFF | I |
| 11 | `comision` | ON | v1 |
| 12 | `condicion_uso` | ON | v1 |
| 13 | `obligaciones_vendedor` | ON | v1+K |
| — | `obligaciones_vendedor_agua` | OFF | sub-toggle |
| 14 | `derecho_deduccion` | ON | v1 |
| 15 | `auditoria_hacienda` | OFF | J |
| 16 | `holdback_escrow` | OFF | J |
| 17 | `fuerza_mayor` | ON | v1+L |
| 18 | `factura_complementaria` | OFF | v1 |
| 19 | `disclosure` | OFF | v1 |
| 20 | `documentos_integrales` | ON | v1 |
| 21 | `proteccion_datos` | OFF | N |
| 22 | `confidencialidad` | OFF | S |
| 23 | `ad_corpus` | ON | M |
| 24 | `duplicados` | ON | v1 |

---

## CATÁLOGOS ACTUALIZADOS

### Notarios (19) — agrupados por ciudad con optgroups:
- **Puerto Vallarta, Jalisco:** 1-Castro Rubio, 2-Romero García Castellanos, 3-Ruiz Higuera, 5-Plascencia Vázquez, 6-Ramírez Brambila, 7-Sánchez Acosta, 8-Ruiz Higuera J., 9-Torres Jacobo, 10-Prado Medina
- **Mascota, Jalisco:** 1-González Valdés
- **Bucerías, Nayarit:** 2-Ramírez Valenzuela, 19-Castro Montero, 29-Meza Barajas, 31-Reyes Vázquez
- **Nuevo Vallarta, Nayarit:** 4-Careaga Pérez, 10-Loza Ramírez, 33-Bañuelos Chan
- **Tepic, Nayarit:** 8-Velázquez Gutiérrez, 42-Benítez Pineda
- **Otro** (captura manual)

IDs: `pv_1..10`, `mas_1`, `buc_2/19/29/31`, `nv_4/10/33`, `tep_8/42`, `otro`

### Empresas Escrow (3 + otra):
- `ARMOUR SECURE ESCROW, S DE RL DE CV`
- `SECURE TITLE LATIN AMERICA INC`
- `TLA LLC`
- `otro_escrow` → campo manual

### Nacionalidades (dropdown, valor canónico ES):
- `estadounidense` → 🇺🇸 American / Américain
- `canadiense` → 🇨🇦 Canadian / Canadien
- `francocanadiense` → 🇨🇦 Franco-Canadian / Franco-canadien

---

## QA SUITE

```bash
# QA estático — correr siempre antes de push
cd ~/repos/ofertagen && python3 qa/test_qa.py
# → 263 ✅ / 0 ❌

# QA concordancia lingüística
python3 qa/test_concordancia.py
# → 151 ✅ / 0 ❌

# QA interactivo Playwright (en Desktop Beach House)
cd ofertagen-qa && npx playwright test
# → ~75 tests interactivos
# Archivo: ofertagen_qa.spec.js (en repo raíz, no en /qa/)
```

**REGLA:** Si agregas bloque o modificas render → agrega assertions al QA antes del push.

---

## OBJETO UI (i18n)

En `page.js` antes del `// MAIN APP`:

```javascript
const UI = {
  es: { steps, sections, header, preview, nav, validation, fields },
  en: { ... },
  fr: { ... },
}
```

`const t = UI[idiomaSecundario] || UI.es` — t se usa en TODA la UI.

`t.fields.*` cubre ~60 labels de campos. Si agregas campos nuevos → agregar en los 4 idiomas (es/en/fr + el bloque ES legacy).

---

## CONTRAOFERTAGEN — COMPLETADO ✅

**Ruta:** `/contraoferta` (misma app, no subdomain separado)  
**URL:** https://ofertagen.expatadvisormx.com/contraoferta

### Sprints completados (CA-1, CA-2, CA-3) — Abril 2026

**Sprint CA-1:** Plantilla + ensamblador
- `contraoferta.js`: 7 bloques modificables + 5 siempre activos
- `ensamblador_contraoferta.js`: resolución de contexto, numeración dinámica
- Trilingüe nativo ES/EN/FR desde el inicio

**Sprint CA-2:** UI — Wizard 3 pasos
- Paso 1: Oferta original (fecha, precio, inmueble, partes, quién presenta)
- Paso 2: Modificaciones (7 toggles con campos condicionales)
- Paso 3: Preview bilingüe + descarga
- Deep link desde OfertaGen (botón "¿Contraoferta?" en paso 5)
- i18n completo ES/EN/FR, tema oscuro azul

**Sprint CA-3:** Generador DOCX
- `generador_contraoferta.js`: tabla bilingüe lado a lado
- Soporta ES/EN y ES/FR
- Sección de firmas con línea de fecha para aceptación

### 7 toggles de modificación:
1. `mod_precio` — Nuevo precio
2. `mod_fecha` — Nueva fecha de formalización
3. `mod_notario` — Nuevo notario (nombre, número, ciudad)
4. `mod_coordinador` — Nuevo coordinador (nombre, empresa)
5. `mod_vigencia` — Nueva fecha/hora de vigencia
6. `mod_deposito` — Nuevo depósito y/o empresa escrow
7. `mod_clausula_libre` — Cláusula adicional trilingüe

### QA: 63 tests al 100%
```bash
python3 qa/test_contraoferta.py
```

---

## LO PENDIENTE (próximos sprints)

### Pendientes menores OfertaGen
- **Sprint Y (UX):** Revisión jerarquía visual — títulos de sección ya tienen acento azul (text-base, color accent-hi), pero el Arquitecto puede pedir más ajustes
- **Pregunta de bienvenida:** "¿Quién está llenando esta oferta?" (comprador / agente / abogado) — pendiente de decisión del Arquitecto
- Ampliar catálogo de nacionalidades más allá de 3

---

## REGLAS DE EJECUCIÓN (resumen)

1. Ejecuta, no preguntes
2. Escribe completo, no parcial
3. Si falla, rehaz — no debuggees
4. Un pase
5. Smoke test antes de reportar
6. Footer "Hecho por duendes.app 2026"
7. PWA: manifest + SW network-first + install button
8. Vercel REST API directa si MCP se cuelga

**RDE completas:** canal/RDE/REGLAS_DE_EJECUCION_CLOUD_v1.md

---

## CONTEXTO DEL ARQUITECTO

Rolo es abogado con ~20 años en PV/Bahía de Banderas. OfertaGen es app #34 de La Colmena (ecosistema ~33+ apps bajo Pvrolomx). Usa Sonnet para el 90% del trabajo — Opus solo para análisis legal muy denso. Trabaja desde Desktop Beach House (Windows). RPi en 192.168.1.91.

**Estilo de trabajo:** "a ver qué sale" → construye épico. Marca decisiones en MAYÚSCULAS. Si dice que algo es escalable, es porque lo es — diseña para eso.

---

## NOTAS TÉCNICAS CRÍTICAS

- **Todo client-side.** Cero backend, cero DB. DOCX generado en browser.
- `localStorage` para auto-save de borrador.
- `oferta_compra.js` (~1000 líneas) es el archivo más importante.
- Bloques nuevos van con `fr` nativo en el render — NO en `traducciones_fr.js` (ese es solo para los 23 bloques legacy).
- `contractLang` y `idiomaSecundario` son estados SEPARADOS — no los mezcles.
- El regex que limpió clases `dark:` en Sprint W puede cortar caracteres especiales (Ñ, É) — verificar siempre con build local.
- Los optgroups de notarios usan valores canónicos tipo `pv_1`, `buc_29` etc.

¡Suerte, duende! 🐝
