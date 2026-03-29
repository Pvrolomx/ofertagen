# HANDOFF — OfertaGen v3.0
## Para el siguiente duende de la Colmena

**Fecha:** 29 Marzo 2026
**Duende saliente:** Claude (sesión sprints I-L + QA)
**Duende anterior:** Claude (sesión épica de 2 días — v1 a v2)
**Arquitecto:** Rolo (Rolando Romero García) — Expat Advisor MX

---

## QUÉ ES OFERTAGEN

Generador inteligente de ofertas de compra inmobiliaria bilingües (ES/EN) para el mercado de compradores extranjeros en la zona de Puerto Vallarta / Bahía de Banderas. Nació de un .docx subido "a ver qué sale" y evolucionó a una app de producción con motor lingüístico de concordancia de género/número.

**Live:** https://ofertagen.expatadvisormx.com
**Repo:** https://github.com/Pvrolomx/ofertagen
**Stack:** Next.js + Tailwind + docx-js + Vercel
**Vercel Project ID:** `prj_LtrLRc9NevQyg4uGneAJKT3spmF1`
**Vercel Team:** `team_xmFW0blsjqFI5lwt29wBPi8Q`

---

## ARQUITECTURA

```
src/
  app/
    page.js          — UI completa (wizard 5 pasos, ~470 líneas)
    layout.js         — Layout + PWA + SW registration
    globals.css       — Estilos Tailwind
  lib/
    core/
      concordancia.js — Motor lingüístico: concordancia G/N, singular colectivo, 9 roles jurídicos
      num2words.js    — Montos a letras español jurídico (USD/MXN/EUR)
      fechas.js       — ISO a prosa bilingüe, plazos, vencimientos
      index.js        — Re-exports
    plantillas/
      oferta_compra.js — LA PLANTILLA: campos, bloques, cláusulas, renders (~970 líneas)
      ensamblador.js   — Toma datos + plantilla → contexto completo para render
    docx/
      generador.js     — Genera DOCX bilingüe tabla lado a lado, headers, footers, firmas
  public/
    manifest.json, sw.js, icon-192.png, icon-512.png
qa/
  test_qa.py           — QA automatizado: 153 tests, 12 secciones
```

### Flujo de datos:
1. **UI (page.js)** captura datos en estado React
2. **Ensamblador** toma datos + plantilla → resuelve concordancia, precios, fechas → contexto
3. **Plantilla** define bloques con `render(ctx)` que produce `{ es, en }` por cláusula
4. **Generador DOCX** toma bloques renderizados → documento Word bilingüe

### Principio clave: MODULAR
- Agregar tipo de contrato = agregar un JSON (plantilla nueva), no tocar código
- Agregar cláusula = agregar un bloque a la plantilla con `condicional: true`
- Agregar notario/escrow = agregar línea al catálogo
- Agregar campo = agregar a `campos` de la plantilla + UI correspondiente

---

## CREDENCIALES

```
GitHub PAT: [ver canal general o TOKENS.md en RPi]
Vercel Token: [ver canal general o TOKENS.md en RPi]
Vercel Team: team_xmFW0blsjqFI5lwt29wBPi8Q
Duendes API: [ver canal general o TOKENS.md en RPi]
```

**Deploy workflow:** `git push origin main` → Vercel auto-deploya via GitHub integration

---

## 22 BLOQUES CONDICIONALES (21 standalone + 1 sub-toggle)

| # | ID | Default | Sprint | Descripción |
|---|-----|---------|--------|-------------|
| 1 | `adjudicacion_conyuge` | OFF | v1 | 50% derechos fideicomisarios del esposo fallecido |
| 2 | `escrow` | ON | v1 | Depósito condicional irrevocable + terminación automática |
| 3 | `inspeccion` | ON | v1 | Inspección física + días revisión |
| 4 | `doc_fideicomiso` | ON | v1 | Copia fideicomiso + actas asamblea |
| 5 | `financiamiento` | OFF | v1 | Compra con crédito hipotecario |
| 6 | `inventario` | OFF | v1+K | Inclusion list + exclusiones + subsanación 3 días + excepción fuerza mayor |
| 7 | `arrendamientos` | OFF | v1+K | Rentas vigentes + dropdown `renta_hasta` (escrow/cuenta/cierre) |
| 8 | `zona_federal` | OFF | v1 | Propiedades frente al mar |
| 9 | `litigios_pendientes` | OFF | **I** | Vendedor informa litigios en 3 días hábiles; comprador acepta/rechaza en 5 días |
| 10 | `empleados_condicion` | OFF | **I** | Vendedor informa litigios laborales en 3 días; comprador acepta/rechaza en 5 días |
| 11 | `comision` | ON | v1 | Comisión inmobiliaria con distribución |
| 12 | `condicion_uso` | ON | v1 | Entrega en misma condición que inspección |
| 13 | `obligaciones_vendedor` | ON | v1+K | Walk-through, carta no adeudo, prorrateo, cesión servicios + 30 días transferencia |
| — | `obligaciones_vendedor_agua` | OFF | v1 | **Sub-toggle** dentro de obligaciones_vendedor (no es bloque propio) |
| 14 | `derecho_deduccion` | ON | v1 | Comprador deduce del precio reclamos no resueltos en 10 días |
| 15 | `auditoria_hacienda` | OFF | **J** | Vendedor informa auditorías; responsable adeudos pre-cierre |
| 16 | `holdback_escrow` | OFF | **J** | Retención en escrow por assessments; carta administrador requerida |
| 17 | `fuerza_mayor` | ON | v1+**L** | Expandida: lista específica, 90 días extensión, consentimiento mutuo |
| 18 | `factura_complementaria` | OFF | v1 | Solo vendedor persona moral mexicana |
| 19 | `disclosure` | OFF | v1 | Notario neutral, agencia no asesora legal |
| 20 | `documentos_integrales` | ON | v1 | Lista de documentos que forman parte de la oferta |
| 21 | `duplicados` | ON | v1 | Counterparts y comunicaciones electrónicas |

**Nota:** `cl_email` (cláusula 17, siempre activa) fue actualizada en Sprint L para incluir DocuSign, Adobe Sign y firma electrónica análoga.

---

## SPRINTS COMPLETADOS (I, J, K, L) — 29 Mar 2026

### Sprint I — Condiciones indispensables expandidas ✅
- `litigios_pendientes` (G) — 3 días hábiles documentación, 5 días naturales aceptar/rechazar
- `empleados_condicion` (H) — misma mecánica para litigios laborales
- Ambos: rechazo = oferta nula, reembolso total

### Sprint J — Protecciones financieras ✅
- `auditoria_hacienda` — vendedor responsable de adeudos fiscales pre-cierre
- `holdback_escrow` — retención por assessments, carta administrador, excedente regresa

### Sprint K — Operación y servicios ✅
- `obligaciones_vendedor` actualizado: 30 días para transferir servicios + consecuencia
- `inventario` actualizado: subsanación 3 días + excepción fuerza mayor (robos, huracanes, marejadas)
- `arrendamientos` actualizado: dropdown `renta_hasta` con 3 opciones en UI paso 3

### Sprint L — Comunicaciones y fuerza mayor ✅
- `cl_email` actualizado: DocuSign, Adobe Sign, firma electrónica análoga
- `fuerza_mayor` REEMPLAZADA: pandemias, huracanes, terremotos, tsunamis, guerras, incendios, inundaciones + extensión 90 días día por día + consentimiento mutuo escrito + cancela sin penalidad

---

## QA AUTOMATIZADO

**Archivo:** `qa/test_qa.py`
**Ubicaciones:** GitHub repo + RPi (`/home/pvrolo/repos/ofertagen/qa/test_qa.py`)
**Última ejecución:** 153 ✅ / 0 ❌ — 100% pass rate — 1.8 segundos

### Cómo correr:
```bash
cd ~/repos/ofertagen && git pull && python3 qa/test_qa.py
```

### 12 secciones que valida:
1. Live site (HTML structure, steps, buttons, forms)
2. PWA (manifest, SW, icons, install button)
3. Plantilla (21 bloques standalone existen)
4. Sprint I (litigios + empleados — texto ES/EN)
5. Sprint J (auditoría + holdback — texto ES/EN)
6. Sprint K (servicios 30d, inventario subsanación, arrendamientos dropdown)
7. Sprint L (firma electrónica, fuerza mayor expandida)
8. page.js (INIT/DEMO tienen todos los bloques, toggles existen)
9. Ensamblador (resolución de contexto)
10. Concordancia engine (core modules)
11. DOCX generator (exports, bilingüe, firmas)
12. Catálogos (6 notarios, 4 escrows)

### REGLA DE QA PARA SPRINTS FUTUROS:
> **Si agregas un bloque o modificas un render, agrega tus assertions al final de la sección correspondiente en `qa/test_qa.py` ANTES de hacer push.**

Patrón para agregar assertions:
```python
# En la sección del sprint correspondiente, agregar:
log("Sprint X: nombre_bloque render ES",
    "texto clave en español" in plantilla)
log("Sprint X: nombre_bloque render EN",
    "key english text" in plantilla)
```

Y si es un bloque nuevo, agregarlo también a `BLOQUES_EXPECTED`:
```python
("nuevo_bloque_id", False, "Descripción (Sprint X)"),
```

---

## CATÁLOGOS

### Notarios (6):
```
careaga_12  — Lic. Jorge Careaga Jiménez, Notaría 12, PV Jalisco
meza_29     — Lic. Adán Meza Barajas, Notaría 29, Bucerías Nayarit
ramirez_2   — Lic. Teodoro Ramírez Valenzuela, Notaría 2, Bucerías Nayarit
agraz_3     — Lic. José Agraz Cabrales, Notaría 3, PV Jalisco
navarrete_1 — Lic. Rafael Navarrete Castellanos, Notaría 1, Bucerías Nayarit
leon_5      — Lic. Ricardo León Gutiérrez, Notaría 5, PV Jalisco
+ "otro" (captura manual)
```

### Empresas Escrow (4):
```
STEWART TITLE LATIN AMERICA
ARMOUR SETTLEMENT SERVICES
TITLE LATIN AMERICA (TLA)
P&A ESCROW
```

### Registro por estado:
```
Nayarit moderno: Folio Real Electrónico
Nayarit legacy:  Libro, Sección, Serie, Partida
Jalisco moderno: Folio Real
Jalisco legacy:  Documento, Folios, Libro, Sección
```

---

## CÓMO AGREGAR UN BLOQUE NUEVO (receta)

1. **En `oferta_compra.js` sección `campos`:** agregar nueva sección si necesita campos
2. **En `oferta_compra.js` sección `bloques`:** agregar el bloque con `condicional: true`, `default`, `render(ctx)`
3. **En `ensamblador.js`:** agregar resolución del contexto (si tiene campos especiales)
4. **En `page.js`:** agregar Toggle en paso 4 + campos condicionales en paso 3 (si aplica)
5. **En `page.js`:** agregar default al DEMO y al INIT en la línea de `bloques:{...}`
6. **En `qa/test_qa.py`:** agregar bloque a `BLOQUES_EXPECTED` + assertions de texto ES/EN
7. `npx next build` → verificar
8. `python3 qa/test_qa.py` → verificar 100%
9. `git add -A && git commit && git push origin main` → Vercel auto-deploya

---

## REGLAS RDE CLOUD v1 (resumen)

1. Ejecuta, no preguntes
2. Escribe completo, no parcial
3. Si falla, rehaz — no debuggees
4. Un pase
5. Archivos atómicos
9. Smoke test antes de reportar
10. Footer "Hecho por duendes.app 2026"
11. PWA: manifest + SW network-first + install button
15. Vercel REST API directa si MCP se cuelga

**RDE completas:** `curl -s -H "Authorization: token [GITHUB_PAT]" -H "Accept: application/vnd.github.v3.raw" "https://api.github.com/repos/Pvrolomx/canal/contents/RDE/REGLAS_DE_EJECUCION_CLOUD_v1.md"`

---

## CONTEXTO DEL ARQUITECTO

Rolo es abogado y expat advisor con ~20 años en la zona. Trabaja con su esposa Claudia (Castle Solutions, property management). OfertaGen es la app #34 de la Colmena — un ecosistema de ~33 apps bajo Pvrolomx. Rolo te va a subir ofertas de terceros en PDF para que identifiques diferencias y le preguntes qué quiere agregar. Él marca con mayúsculas sus decisiones. Si dice "a ver qué sale" — construye algo épico.

---

## NOTAS TÉCNICAS

- Todo es client-side. Cero backend, cero base de datos. El DOCX se genera en el browser.
- `localStorage` guarda borrador auto-save.
- La plantilla (`oferta_compra.js`) tiene ~970 líneas — es el archivo más importante.
- El generador DOCX usa 2 secciones: contenido (con footer de iniciales) + firmas (sin footer).
- Headers bilingües: "Página X de Y / Page X of Y" en cada página.
- Concordancia de género/número funciona automáticamente — el insight del "singular colectivo" salió de un debate multi-IA con 8 sistemas.
- Los bloques condicionales se omiten limpiamente del contrato cuando están OFF — sin huecos, sin errores.
- `obligaciones_vendedor_agua` es sub-toggle (no bloque propio) — modifica el render de `obligaciones_vendedor` via `ctx.bloques.obligaciones_vendedor_agua`.

¡Suerte, duende! 🐝
