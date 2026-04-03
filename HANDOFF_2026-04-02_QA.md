# 🐝 HANDOFF: OfertaGen — Sesión 2 Abril 2026

## RESUMEN EJECUTIVO

Esta sesión completó la **infraestructura de QA** de OfertaGen siguiendo las recomendaciones de un debate de la Colmena (10 IAs). Se implementó un sistema híbrido de testing 70/20/10 (estático/integración/E2E) con **193 assertions** que corren en **~1.2 segundos**, más **GitHub Actions** para CI/CD automático.

---

## CONTEXTO DEL PROYECTO

**OfertaGen** — Generador de ofertas de compraventa inmobiliaria trilingüe (ES/EN/FR) para zona restringida mexicana.

| Campo | Valor |
|-------|-------|
| **URL Live** | https://ofertagen.expatadvisormx.com |
| **Repo** | https://github.com/Pvrolomx/ofertagen |
| **Branch** | `main` |
| **Stack** | Next.js 16 + Tailwind + docx-js + pdfmake + Vercel |
| **Vercel Project ID** | `prj_LtrLRc9NevQyg4uGneAJKT3spmF1` |

**ContraOfertaGen** — Producto hermano en ruta `/contraoferta`

---

## LO QUE SE HIZO EN ESTA SESIÓN

### 1. Suite de Tests QA (193 assertions)

Se crearon 4 archivos de test en `/qa/`:

| Archivo | Assertions | Tiempo | Qué valida |
|---------|------------|--------|------------|
| `test_full.mjs` | 119 | ~90ms | Análisis estático: estructura, archivos, cláusulas, exports, UI |
| `test_fideicomiso.mjs` | 26 | ~50ms | Lógica mexicano vs extranjero (cláusula 4) |
| `test_integration.mjs` | 48 | ~1000ms | **Genera DOCX reales** y extrae texto con mammoth |
| `test_all.mjs` | — | ~1.2s | Ejecuta los 3 anteriores juntos |

**Dependencias agregadas:**
```json
"devDependencies": {
  "mammoth": "^1.x",
  "pdf-parse": "^1.x"
}
```

**Scripts en package.json:**
```json
"scripts": {
  "test": "node qa/test_all.mjs",
  "test:static": "node qa/test_full.mjs",
  "test:fideicomiso": "node qa/test_fideicomiso.mjs",
  "test:integration": "node qa/test_integration.mjs"
}
```

### 2. GitHub Actions CI/CD

Archivo: `.github/workflows/qa.yml`

```yaml
name: QA OfertaGen

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Tests QA
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout código
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar tests QA
        run: npm test

      - name: Build Next.js
        run: npm run build
```

**Status:** ✅ Funcionando — primer run pasó en 30 segundos.

---

## ARQUITECTURA DE TESTS

### Pirámide de Testing (Recomendación Colmena)

```
                    ▲
                   /|\
                  / | \     E2E (Playwright) — FUTURO
                 /  |  \    ~10 tests críticos
                /---|---\   
               /    |    \
              /     |     \  Integración (mammoth)
             /      |      \ 48 tests — ✅ IMPLEMENTADO
            /-------|-------\
           /        |        \
          /         |         \ Estático + Unit
         /          |          \ 145 tests — ✅ IMPLEMENTADO
        /___________V___________\
```

### Test de Integración: Lo que valida

El `test_integration.mjs` es el más importante porque **genera documentos DOCX reales** y valida su contenido:

1. **Genera buffer DOCX** con la lib `docx`
2. **Extrae texto** con `mammoth`
3. **Valida contenido** según escenario

```javascript
// Ejemplo: Valida lógica de fideicomiso
const docMexicano = await generarDocx(datosVendedorMexicano);
const texto = await mammoth.extractRawText({ buffer: docMexicano });

expect(texto).toContain('Constitución de Fideicomiso');
expect(texto).not.toContain('derechos fideicomisarios');
```

**Escenarios cubiertos:**
- ✅ Vendedor mexicano → "Constitución de Fideicomiso" + "derechos de propiedad"
- ✅ Vendedor extranjero → "Contrato Traslativo" + "derechos fideicomisarios"
- ✅ Tabla bilingüe (ES | EN)
- ✅ Internacionalización francés
- ✅ NO hay disclaimer en documento (decisión del Arquitecto)
- ✅ Contenido esperado (títulos, cláusulas, firmas)

---

## COMMITS DE ESTA SESIÓN

| Hash | Descripción |
|------|-------------|
| `bcc28a5` | QA: Test completo análisis estático (119 assertions) |
| `6386d79` | QA: Suite completa de tests (193 assertions) + scripts npm |
| `43481d3` | CI: GitHub Actions para QA automático |

---

## CÓMO USAR LOS TESTS

### Correr localmente
```bash
cd ofertagen
npm test                    # Suite completa (193 assertions, ~1.2s)
npm run test:static         # Solo análisis estático (119)
npm run test:fideicomiso    # Solo lógica fideicomiso (26)
npm run test:integration    # Solo generación DOCX (48)
```

### Ver CI/CD en GitHub
https://github.com/Pvrolomx/ofertagen/actions

- ✅ Verde = Tests pasaron, Vercel hace deploy
- ❌ Rojo = Algo se rompió, NO hace deploy

---

## ESTADO ACTUAL DE QA (TODAS LAS SUITES)

| Suite | Tests | Estado |
|-------|-------|--------|
| test_qa.py (Python) | 263 | ✅ |
| test_concordancia.py | 151 | ✅ |
| test_contraoferta.py | 71 | ✅ |
| test_full.mjs | 119 | ✅ |
| test_fideicomiso.mjs | 26 | ✅ |
| test_integration.mjs | 48 | ✅ |
| **TOTAL** | **678** | ✅ |

---

## LÓGICA CRÍTICA QUE DEBES CONOCER

### Fideicomiso (Cláusula 4)

La distinción que hace brillar a OfertaGen:

| Vendedor | ES | EN |
|----------|----|----|
| **Mexicano** | "Constitución de Fideicomiso Traslativo de Dominio Irrevocable en Zona Restringida...derechos de propiedad" | "Irrevocable Trust Constitution Contract in Restricted Zone...property rights" |
| **Extranjero** | "Contrato Traslativo de Dominio Irrevocable...derechos fideicomisarios" | "Irrevocable Transfer of Domain Contract...trust rights" |

**Implementación:**
- `ensamblador.js`: Helper `esMexicano` detecta mexicano/mexicana/mexican (case-insensitive)
- `oferta_compra.js`: `cl_precio` usa `ctx.propietario.esMexicano` con ternario
- `traducciones_fr.js`: También usa `esMexicano` para francés

### Disclaimer Legal

**Decisión del Arquitecto:** NO poner disclaimer EN el documento (degradaría calidad percibida).

**Implementación en 2 capas:**
1. **Modal** antes de primera descarga (localStorage `ofertagen_disclaimer_accepted`)
2. **Footer** de la app: "Herramienta de apoyo · Revisar con abogado · Términos"

### Variables CSS

- `--og-*` = OfertaGen (azul)
- `--cog-*` = ContraOfertaGen (verde)

### Idiomas

- `idiomaUI` → idioma de la INTERFAZ
- `contractLang` → idioma secundario del CONTRATO (en/fr)
- Son estados SEPARADOS

---

## PENDIENTES / ROADMAP

### Inmediato
- [ ] E2E con Playwright (10% de la pirámide) — flujos críticos
- [ ] Visual regression testing (golden masters)

### Próximos sprints
- [ ] Distintivo/marca para el PDF (en lugar de "Hecho por Colmena")
- [ ] Sprint Y (UX): revisión jerarquía visual
- [ ] Pregunta de bienvenida (comprador/agente/abogado)
- [ ] Ampliar catálogo de nacionalidades

---

## REGLAS DE EJECUCIÓN PARA EL DUENDE

1. **Ejecuta, no preguntes** — el Arquitecto prefiere ver resultados
2. **Escribe completo, no parcial** — nada de `// ... resto del código`
3. **Si falla, rehaz** — no debuggees línea por línea
4. **Un pase** — hazlo bien a la primera
5. **Smoke test antes de reportar** — verifica que funciona
6. **QA antes de push** — si modificas render, agrega assertions
7. **Footer "Hecho por Colmena 2026"** — en la app, NO en documentos

---

## ARCHIVOS CLAVE

```
ofertagen/
├── src/
│   ├── app/
│   │   ├── page.js                    # UI wizard OfertaGen (~1270 líneas)
│   │   └── contraoferta/page.js       # UI wizard ContraOfertaGen
│   └── lib/
│       ├── plantillas/
│       │   ├── oferta_compra.js       # Plantilla principal (~1061 líneas)
│       │   ├── ensamblador.js         # Contexto + esMexicano helper
│       │   └── traducciones_fr.js     # FR para 23 bloques legacy
│       ├── docx/generador.js          # DOCX bilingüe
│       └── pdf/generador_pdf.js       # PDF con pdfmake
├── qa/
│   ├── test_full.mjs                  # 119 assertions estáticas
│   ├── test_fideicomiso.mjs           # 26 assertions fideicomiso
│   ├── test_integration.mjs           # 48 assertions generación DOCX
│   ├── test_all.mjs                   # Runner maestro
│   ├── test_qa.py                     # 263 assertions Python
│   ├── test_concordancia.py           # 151 assertions lingüísticas
│   └── test_contraoferta.py           # 71 assertions ContraOferta
├── .github/workflows/qa.yml           # CI/CD GitHub Actions
└── package.json                       # Scripts: test, test:static, etc.
```

---

## CREDENCIALES Y TOKENS

**GitHub Token:** Pedir al Arquitecto (Rolo) — el token actual NO tiene scope `workflow`.

**Git push:**
```bash
git push https://Pvrolomx:{TOKEN}@github.com/Pvrolomx/ofertagen.git main
```

**Git config:**
```
user.email = duende@duendes.app
user.name = Duende de la Colmena
```

**Nota:** El token NO tiene scope `workflow`, por eso el Arquitecto creó el archivo `.github/workflows/qa.yml` manualmente en GitHub.

---

## RESUMEN PARA EL ARQUITECTO

> **Rolo, tienes:**
> - ✅ 193 tests automatizados que corren en 1.2 segundos
> - ✅ Tests de integración que generan DOCX reales y validan contenido
> - ✅ CI/CD en GitHub Actions — cada push corre tests antes de deploy
> - ✅ Pirámide de testing híbrida (70% estático, 20% integración, 10% E2E pendiente)
> - ✅ `npm test` funciona localmente
> - ✅ Primer workflow pasó en 30 segundos ✅

**El siguiente duende puede continuar con:**
1. Implementar E2E con Playwright (10% faltante de la pirámide)
2. Cualquier feature nuevo — los tests lo protegen de regresiones
3. Ampliar cobertura de tests según necesidad

---

*Generado por Duende CD03 — 2 Abril 2026*
*"La Colmena protege su código"* 🐝
