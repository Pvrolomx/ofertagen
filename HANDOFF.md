# HANDOFF — OfertaGen v2.0
## Para el siguiente duende de la Colmena

**Fecha:** 29 Marzo 2026
**Duende saliente:** Claude (sesión épica de 2 días)
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
    page.js          — UI completa (wizard 5 pasos, ~454 líneas)
    layout.js         — Layout + PWA + SW registration
    globals.css       — Estilos Tailwind
  lib/
    core/
      concordancia.js — Motor lingüístico: concordancia G/N, singular colectivo, 9 roles jurídicos
      num2words.js    — Montos a letras español jurídico (USD/MXN/EUR)
      fechas.js       — ISO a prosa bilingüe, plazos, vencimientos
      index.js        — Re-exports
    plantillas/
      oferta_compra.js — LA PLANTILLA: campos, bloques, cláusulas, renders (~903 líneas)
      ensamblador.js   — Toma datos + plantilla → contexto completo para render
    docx/
      generador.js     — Genera DOCX bilingüe tabla lado a lado, headers, footers, firmas
  public/
    manifest.json, sw.js, icon-192.png, icon-512.png
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
Ver HANDOFF descargado por el Arquitecto o buscar en chats anteriores:
- GitHub PAT (user: Pvrolomx)
- Vercel Token
- Vercel Team ID: team_xmFW0blsjqFI5lwt29wBPi8Q
- Duendes API key (chat.duendes.app canal 1)
```

**Deploy workflow:** `git push origin main` → Vercel auto-deploya via GitHub integration

---

## 18 BLOQUES CONDICIONALES ACTUALES

| # | ID | Default | Descripción |
|---|-----|---------|-------------|
| 1 | `adjudicacion_conyuge` | OFF | 50% derechos fideicomisarios del esposo fallecido |
| 2 | `escrow` | ON | Depósito condicional irrevocable + terminación automática |
| 3 | `inspeccion` | ON | Inspección física + días revisión |
| 4 | `doc_fideicomiso` | ON | Copia fideicomiso + actas asamblea |
| 5 | `financiamiento` | OFF | Compra con crédito hipotecario |
| 6 | `inventario` | OFF | Inclusion list + exclusiones |
| 7 | `arrendamientos` | OFF | Rentas vigentes post-cierre |
| 8 | `zona_federal` | OFF | Propiedades frente al mar |
| 9 | `comision` | ON | Comisión inmobiliaria con distribución |
| 10 | `condicion_uso` | ON | Entrega en misma condición que inspección |
| 11 | `obligaciones_vendedor` | ON | Walk-through, carta no adeudo, prorrateo, cesión servicios |
| 12 | `obligaciones_vendedor_agua` | OFF | Sub-toggle: no adeudo agua (fuera de condominio) |
| 13 | `derecho_deduccion` | ON | Comprador deduce del precio reclamos no resueltos en 10 días |
| 14 | `factura_complementaria` | OFF | Solo vendedor persona moral mexicana |
| 15 | `fuerza_mayor` | ON | Fallecimiento → beneficiarios; desastre → cancela |
| 16 | `disclosure` | OFF | Notario neutral, agencia no asesora legal |
| 17 | `documentos_integrales` | ON | Lista de documentos que forman parte de la oferta |
| 18 | `duplicados` | ON | Counterparts y comunicaciones electrónicas |

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

## SPRINTS PENDIENTES (I, J, K, L)

### Sprint I — Condiciones indispensables expandidas
**Litigios pendientes como condición separada (toggle):**
- Vendedor informa litigios pendientes con copias dentro de 3 días hábiles
- Comprador acepta o rechaza en 5 días naturales
- Si rechaza → oferta nula, reembolso total
- Archivo: `oferta_compra.js` → agregar bloque `litigios_pendientes` después de `zona_federal`

**Empleados como condición separada (toggle):**
- Vendedor informa litigios laborales actuales o anteriores, 3 días hábiles
- Comprador acepta/rechaza en 5 días naturales
- Si rechaza → nulo, reembolso
- Bloque `empleados_condicion` separado de las obligaciones del vendedor

### Sprint J — Protecciones financieras
**Auditoría de Hacienda (toggle):**
- Vendedor se obliga a informar si el inmueble ha sido sujeto a auditoría
- Si hay cuotas asignadas pendientes o futuras, vendedor es responsable por período anterior
- Bloque `auditoria_hacienda`, default OFF

**Holdback en escrow por adeudos de condominio (toggle):**
- Si hay assessment pendiente o cuota extraordinaria, se retiene en escrow cantidad igual o acordada
- Se libera cuando se determine monto exacto y se pague
- Carta del administrador requerida declarando no cargos pendientes
- Bloque `holdback_escrow`, default OFF

### Sprint K — Operación y servicios
**Transferencia de utilidades con plazo:**
- 30 días calendario después del cierre para transferir servicios a nombre del comprador
- Si no transfiere, vendedor puede cancelar servicios, comprador paga reconexión
- Actualizar la cláusula de `obligaciones_vendedor` (no crear bloque nuevo)

**Inventario: mecánica de subsanación:**
- Si inmueble no se entrega con inventario aprobado → incumplimiento del vendedor
- 3 días naturales para subsanar
- Excluye fuerza mayor: robos, huracanes, marejadas
- Actualizar render del bloque `inventario` existente

**Arrendamientos: dropdown vendedor renta hasta...**
- Agregar campo `renta_hasta` tipo select con opciones:
  - `escrow` → "hasta que el dinero se refleje en escrow"
  - `cuenta_vendedor` → "hasta que el dinero se refleje en la cuenta del vendedor"
  - `cierre` → "hasta la fecha de formalización"
- Actualizar render del bloque `arrendamientos` existente
- Agregar campo al UI en paso 3 (visible cuando toggle arrendamientos ON)

### Sprint L — Comunicaciones y fuerza mayor
**Comunicaciones: medios electrónicos análogos:**
- Actualizar cláusula `cl_email` para mencionar "DocuSign, Adobe Sign u otros medios de firma electrónica análogos"
- No hardcodear "DocuSign" — mencionar como ejemplo entre varios
- Ya tenemos testigos (toggle), no agregar de nuevo

**Fuerza mayor: versión expandida:**
- REEMPLAZAR la cláusula `fuerza_mayor` actual con versión más detallada:
  - Lista específica: pandemias, huelgas, meteoritos, terremotos, guerras, disturbios civiles, tsunamis, huracanes, incendios, inundaciones
  - Extensión automática día por día por 90 días naturales
  - Después de 90 días → puede extenderse por consentimiento mutuo escrito
  - Si no se extiende → se cancela sin penalidad, reembolso total
  - Mantener: fallecimiento → continúa con beneficiarios sustitutos

---

## CÓMO AGREGAR UN BLOQUE NUEVO (receta)

1. **En `oferta_compra.js` sección `campos`:** agregar nueva sección si necesita campos
2. **En `oferta_compra.js` sección `bloques`:** agregar el bloque con `condicional: true`, `default`, `render(ctx)`
3. **En `ensamblador.js`:** agregar resolución del contexto (si tiene campos especiales)
4. **En `page.js`:** agregar Toggle en paso 4 + campos condicionales en paso 3 (si aplica)
5. **En `page.js`:** agregar default al DEMO y al INIT en la línea de `bloques:{...}`
6. `npx next build` → verificar
7. `git add -A && git commit && git push origin main` → Vercel auto-deploya

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


---

## CONTEXTO DEL ARQUITECTO

Rolo es abogado y expat advisor con ~20 años en la zona. Trabaja con su esposa Claudia (Castle Solutions, property management). OfertaGen es la app #34 de la Colmena — un ecosistema de ~33 apps bajo Pvrolomx. Rolo te va a subir ofertas de terceros en PDF para que identifiques diferencias y le preguntes qué quiere agregar. Él marca con mayúsculas sus decisiones. Si dice "a ver qué sale" — construye algo épico.

---

## NOTAS TÉCNICAS

- Todo es client-side. Cero backend, cero base de datos. El DOCX se genera en el browser.
- `localStorage` guarda borrador auto-save.
- La plantilla (`oferta_compra.js`) tiene ~903 líneas — es el archivo más importante.
- El generador DOCX usa 2 secciones: contenido (con footer de iniciales) + firmas (sin footer).
- Headers bilingües: "Página X de Y / Page X of Y" en cada página.
- Concordancia de género/número funciona automáticamente — el insight del "singular colectivo" salió de un debate multi-IA con 8 sistemas.
- Los bloques condicionales se omiten limpiamente del contrato cuando están OFF — sin huecos, sin errores.

¡Suerte, duende! 🐝
