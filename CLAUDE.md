@AGENTS.md

# Mapa de Reconocimiento — Ofertagen

> Reconocimiento SOLO LECTURA (2026-07-06). Mapa de 7 puntos del primer contacto con el repo.

## 1. Stack
- **Next.js 16.2.1** + **React 19.2.4**, **JavaScript** (no TypeScript — `jsconfig.json`), gestor **npm** (`package-lock.json` presente).
- **Tailwind v4** (vía `@tailwindcss/postcss`).
- Motor de documentos: `docx` v9, `@react-pdf/renderer`, `jspdf`, `pdfmake`. QA con **Playwright**.
- ⚠️ `AGENTS.md` advierte: *"This is NOT the Next.js you know"* — Next 16 tiene breaking changes; leer `node_modules/next/dist/docs/` antes de tocar código.

## 2. Estructura
```
src/app/            → page.js, layout.js, contraoferta/page.js, globals.css   (App Router)
src/lib/core/       → concordancia, fechas, num2words (motor lingüístico ES/EN)
src/lib/docx/       → generador.js, generador_contraoferta.js
src/lib/pdf/        → generador_pdf.js
src/lib/plantillas/ → oferta_compra, contraoferta, ensambladores, traducciones_fr
qa/                 → tests .mjs/.py + qa/e2e/ofertagen.spec.js (Playwright)
public/             → PWA (manifest.json, sw.js, icon-192/512)
```

## 3. Ramas
Solo **`main`** (local y remoto). No hay `production` ni ramas de feature.

## 4. Production branch real → `main`
- **No hay `vercel.json`** ni workflow de deploy en el repo. El único workflow `.github/workflows/qa.yml` corre **QA** (unitarios + build + E2E) en `push`/`PR` a `main` — no despliega.
- Vercel está conectado por dashboard. Sin override → production branch = default de Vercel = **`main`** (única rama, y la que QA protege).

## 5. Estado del repo
- Working tree limpio, al día con `origin/main`.
- Commits recientes (español, Sprint 5): validación inline de campos requeridos, deshabilitar Notaría 2 Bucerías, cláusula adicional con traducción automática, precio compuesto (inmueble + muebles), contacto en líneas separadas.

## 6. Despliegue / Producción
- **URL de producción:** https://ofertagen.expatadvisormx.com (responde HTTP 200; también `/contraoferta`).
- **Qué es:** generador de ofertas de compra inmobiliaria bilingües (ES/EN) para compradores extranjeros en Puerto Vallarta / Bahía de Banderas. Arquitecto: Rolo (Expat Advisor MX).
- Documentación real en los archivos `HANDOFF*.md` (el `README.md` es el boilerplate por defecto de create-next-app).

## 7. Riesgos conocidos
- ⚠️ En clon fresco, `node_modules` ausente — para correr QA/dev hace falta `npm ci` (toca solo `node_modules`, no el lock).
- ✅ Sin secretos commiteados (`.env*` ignorados; sin tokens `ghp_`). Los Project/Team ID de Vercel en los HANDOFF son identificadores, no credenciales.
- ✅ Con lockfile, sin artefactos de build (`.next/`, `out/` ignorados).
- Nota menor: `README.md` es boilerplate; la doc útil vive en los `HANDOFF*.md`.
