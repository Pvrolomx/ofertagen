# Diagnóstico — ¿OfertaGen comprende la modalidad mexicano → mexicano?

**Fecha:** 5-sep-2026 · **Detonante:** oferta Valle Dorado / Valle de Aosta 58, que salió con lenguaje de fideicomiso siendo una operación entre mexicanos sobre un inmueble en dominio pleno.

> **ESTADO: los siete arreglos ya están aplicados en el working tree (sin commitear).** Ver §8 al final.
> Respaldo del estado previo: `…\scratchpad\ofertagen_backup_pre_fix\` (los 4 archivos, incluidos los cambios sin commitear de AGY).

---

## Respuesta corta

**Sí la comprende — y en el caso de Valle Dorado esa comprensión quedó desactivada por una condición previa.**

La lógica de modalidad existe, está bien pensada, y cubre los cuatro cruces. Pero (a) se salta entera cuando el precio es compuesto, y (b) aunque no se saltara, hay cuatro cláusulas con el fideicomiso escrito a mano que ninguna condición gobierna.

---

## 1. La matriz sí existe y es correcta

`src/lib/plantillas/oferta_compra.js:468-493` resuelve el tipo de contrato según el cruce de nacionalidades:

| Vendedor → Comprador | Contrato que arma |
|---|---|
| MX → EXT | Constitución de Fideicomiso Traslativo de Dominio Irrevocable en Zona Restringida |
| **MX → MX** | **Contrato de Compraventa (directo, sin fideicomiso)** ✔ |
| EXT → MX | Transmisión de Propiedad en Ejecución de los Fines del Fideicomiso |
| EXT → EXT | Cesión de Derechos y Obligaciones de Fideicomisario |

Está bien resuelto y es la parte más sólida del molde. El helper vive en `ensamblador.js:136`:

```js
ctxParte.esMexicano = nacKey === 'mexicano' || nacKey === 'mexicana' || nacKey === 'mexican';
```

Y el bloque `doc_fideicomiso` (`oferta_compra.js:836-866`) también bifurca bien: si el vendedor es mexicano pide **LA ESCRITURA PÚBLICA**; si es extranjero pide el fideicomiso. Incluso maneja `es_condominio` para decidir si pide actas de asamblea. Es el bloque mejor implementado del archivo.

---

## 2. Bug principal — `precio_compuesto` desactiva la matriz

`oferta_compra.js:456`:

```js
// ---- PRECIO COMPUESTO: Inmueble + Muebles ----
if (ctx.bloques.precio_compuesto) {
  ...
  return { ... };          // ← sale aquí
}

// ---- PRECIO SIMPLE — tipo de contrato según nacionalidad ----
const vendedorMx = ctx.propietario.esMexicano;   // ← nunca se llega
const compradorMx = ctx.ofertante.esMexicano;
```

**La rama de precio compuesto retorna antes de evaluar nacionalidades.** Activar el toggle "precio compuesto" apaga en silencio toda la lógica de modalidad — sin aviso, sin fallback, sin log.

Valle Dorado tiene `precio_compuesto: true` (inmueble + negocio). De ahí que la matriz nunca se ejecutara.

**Además, esa rama trae tres defectos propios:**

| Línea | Defecto |
|---|---|
| 459-460 | **Moneda hardcodeada en USD**: `piUsd = \`USD $${pi.monto.toLocaleString('en-US'...)}\`` — ignora `ctx.precio.moneda` |
| 464 | Dice **"la unidad privativa"** — lenguaje condominal, en un molde que ya sabe distinguir `es_condominio` |
| 464 | Describe el objeto como **"mobiliario, decoración y electrodomésticos"** — no contempla negocio en marcha, inventario ni acreditamiento comercial |

---

## 3. Bug secundario — cuatro cláusulas con fideicomiso escrito a mano

Estas **no consultan `esMexicano` en absoluto**. Salen igual aunque la matriz funcionara, aunque el vendedor sea mexicano y aunque el precio sea simple:

| Ubicación | Texto | Condicional |
|---|---|---|
| `oferta_compra.js:428` | Cl. 3 — *"adquirió los **derechos fideicomisarios** sobre el siguiente inmueble"* | **ninguna** |
| `oferta_compra.js:646` | Cl. 10 — *"honorarios **fiduciarios** por cesión, instrucción o extinción de fideicomiso, debiendo estar al corriente de las **anualidades del fideicomiso**"* | **ninguna** (`siempre: true`) |
| `oferta_compra.js:1131` | fuerza_mayor — *"los beneficiarios designados en su **escritura de fideicomiso**"* | **ninguna** |
| `oferta_compra.js:670` | Cl. 12 — *"La **cesión o transmisión de los derechos** materia de la presente oferta"* | **ninguna** |

`esMexicano` se consulta en **exactamente 2 lugares** de 1,357 líneas de plantilla: la cláusula 4 (rama de precio simple) y el bloque `doc_fideicomiso`. Ningún otro bloque lo mira.

La Cl. 10 es la más gravosa de las cuatro: obliga al vendedor a pagar honorarios fiduciarios y anualidades **de un fideicomiso que puede no existir**.

---

## 4. Bug de núcleo — todo monto en letras en inglés dice dólares

`src/lib/core/num2words.js:329-335`:

```js
export function montoALetrasEn(monto) {          // ← sin parámetro moneda
  ...
  return `${letras} U.S. Dollars and ${sufijo}`; // ← siempre
}
```

Contra su contraparte española, en el mismo archivo (`num2words.js:154`):

```js
export function montoALetras(monto, moneda = 'USD') {   // ← sí recibe moneda
  const config = MONEDAS[moneda];
  if (!config) throw new Error(`Moneda no soportada: "${moneda}"...`);
```

**La versión española está parametrizada y valida contra un catálogo de monedas; la inglesa ni siquiera acepta el argumento.** Es un olvido, no una decisión de diseño.

**Consecuencia:** en cualquier oferta bilingüe denominada en pesos, la columna española dice *"$330,000.00 M.N."* y la inglesa dice *"Three Hundred Thirty Thousand **U.S. Dollars**"*. Ese es el origen exacto de los tres desajustes de moneda detectados en el borrador bilingüe de Valle Dorado — **no vinieron de la traducción ni del operador, sino del núcleo.**

⚠️ **Este defecto es latente en toda oferta en MXN generada en modo bilingüe.** Vale la pena revisar el histórico.

---

## 5. Nota metodológica

**⚠️ Corrección — el archivo cambió durante el diagnóstico.**

La versión de `generar_oferta_valle_dorado_espanol.mjs` analizada (14:43 h) **importaba el motor real del repo** (`oferta_compra.js`, `ensamblador.js`, `generador.js`), se limitaba a fijar `idiomaSecundario: null` y no parchaba una sola cláusula. Para esa versión, todo el texto observado era salida legítima del molde y los defectos eran del molde, no de quien lo operó — que es lo que sostienen las secciones 1 a 4.

**A las 16:23 h el script fue reescrito** (junto con `OFERTA_COMPRA_VALLE_DORADO_ESPANOL.md`). La versión actual **ya no usa el molde**: declara sus 20 cláusulas a mano en un arreglo literal (`cl_ofertante`, `cl_propietario`, `cl_inmueble`, … `cl_gravamenes`, `cl_isr`, `cl_fallecimiento`) y solo importa `generarDocx` para el renderizado.

Consecuencias:

- **El diagnóstico de los defectos del molde sigue siendo válido** — se verificó leyendo `src/lib/`, no el script.
- **Los arreglos siguen siendo necesarios**: el molde es lo que usa la app en `src/app/page.js`, o sea toda oferta generada por la interfaz.
- **Pero los arreglos no alcanzan al borrador de las 16:23**, porque ese ya no pasa por el molde. Un borrador escrito a mano se aparta del motor: gana control puntual y pierde toda corrección futura del molde.

---

## 6. Qué habría que arreglar, en orden

1. **`num2words.js:329`** — dar a `montoALetrasEn` el parámetro `moneda` y su catálogo, en paridad con `montoALetras`. Es el fix más pequeño y el de mayor alcance: corrige toda oferta bilingüe en pesos, pasada y futura.
2. **`oferta_compra.js:456`** — resolver la modalidad por nacionalidad **antes** de bifurcar por tipo de precio, para que ambas ramas la hereden. Hoy la lógica vive dentro de una de las dos ramas.
3. **Las cuatro cláusulas del punto 3** — condicionarlas a `esMexicano`, igual que ya lo hace `doc_fideicomiso`. El patrón correcto ya está escrito en el mismo archivo; solo hay que replicarlo.
4. **Rama de precio compuesto** — respetar `ctx.precio.moneda`, respetar `es_condominio` en lugar de decir "unidad privativa", y admitir objeto distinto de "mobiliario y electrodomésticos" (negocio en marcha, inventario, acreditamiento comercial).
5. **`oferta_compra.js:464`** — revisar la frase *"obligándose las partes a no incluir este valor ni dichos bienes dentro de la Escritura Pública del inmueble"*, que hoy sale en **toda** oferta con precio compuesto. Ver las observaciones del expediente Valle Dorado: es una obligación bilateral de omisión documental que conviene no imprimir por defecto.

---

## 7. Lo que este diagnóstico no cubre

- No se revisó `contraoferta.js` ni `ensamblador_contraoferta.js`, que probablemente comparten los mismos moldes.
- No se revisó `traducciones_fr.js` más allá de constatar que consulta `esMexicano` en su bloque `doc_fideicomiso` (línea 55), o sea que hereda la misma cobertura parcial.
- No se corrió la suite de `qa/`.

---

## 8. Arreglos aplicados (5-sep-2026)

Working tree, **sin commitear**. Respaldo previo en `scratchpad\ofertagen_backup_pre_fix\`.

| # | Archivo | Cambio |
|---|---|---|
| 1 | `core/num2words.js` | `montoALetrasEn(monto, moneda)` ahora recibe moneda y la valida contra `MONEDAS`, en paridad con `montoALetras`. Se añadió `en_plural` al catálogo (`U.S. Dollars` / `Mexican Pesos` / `Euros`). `bloquePrecio` propaga la moneda. Default `'USD'` conservado por retrocompatibilidad |
| 1b | `plantillas/ensamblador.js` | Las dos llamadas de precio compuesto pasan `moneda` |
| 2 | `plantillas/oferta_compra.js` | La matriz de modalidad por nacionalidad se resuelve **antes** de bifurcar por tipo de precio; ambas ramas la heredan. Se eliminó la copia duplicada |
| 3 | `plantillas/oferta_compra.js` | Condicionadas a `esMexicano`: Cl. 3 antecedente (ES+EN), Cl. 10 ISR honorarios fiduciarios (ES+EN), fuerza_mayor (ES+EN, con redacción sucesoria para dominio pleno), Cl. 12 (ES+EN), Cl. 6 aceptación del fiduciario, Cl. 7 demora del fiduciario y la enumeración "migratoria, fiduciaria" |
| 4 | `plantillas/oferta_compra.js` | Rama de precio compuesto: respeta `ctx.precio.moneda` (fuera `piUsd`/`pmUsd` hardcodeados), respeta `es_condominio` (fuera "unidad privativa" fija, con concordancia `descrito`/`descrita`), incorpora el objeto del contrato según modalidad, y admite objeto de muebles y nombre de convenio configurables vía `campos.muebles` |
| 5 | `plantillas/oferta_compra.js` | El pacto *"obligándose las partes a no incluir este valor…"* pasa a **opt-in** por `bloques.pacto_no_incluir_muebles` (default `false`). Ya no se imprime por defecto |
| 6 | `plantillas/oferta_compra.js` | `documentos_integrales`: se quita el **"y Vehículo"** hardcodeado; ahora usa `ctx.muebles.convenio_es/en` con default genérico. Las ramas del ternario pasaron a template literals |
| 7 | `plantillas/ensamblador.js` | **`ctx.bloques.precio_compuesto` ahora se copia.** Se leía solo como variable local, así que la rama de precio compuesto de §4 era inalcanzable desde el ensamblador — bug latente hallado durante la verificación |

### Campos nuevos (todos opcionales, con default retrocompatible)

```js
bloques: {
  precio_compuesto: true,
  pacto_no_incluir_muebles: false,   // opt-in; default no imprime el pacto
}
campos: {
  muebles: {
    objeto_es: '...',    // default: "el mobiliario, decoración y electrodomésticos..."
    objeto_en: '...',
    convenio_es: '...',  // default: "Contrato Privado de Compraventa de Bienes Muebles"
    convenio_en: '...',
  },
}
```

### Verificación

Cuatro escenarios ensamblados con los datos de Valle Dorado (precio compuesto, MXN, no condominio):

| Escenario | Resultado |
|---|---|
| **MX → MX** | "Contrato de Compraventa". **Cero** ocurrencias de fideicomiso, fiduciario, trust, U.S. Dollars, unidad privativa, Vehículo o pacto de omisión |
| **MX → Extranjero** | "Contrato de Constitución de Fideicomiso Traslativo de Dominio Irrevocable en Zona Restringida" — la modalidad extranjera sigue intacta |
| **MX → MX + objeto a la medida** | Toma el negocio en marcha y el convenio nombrado; sin marcadores |
| **MX → MX + `pacto_no_incluir_muebles: true`** | El pacto aparece solo aquí. Opt-in confirmado |

Regresión:

| Suite | Antes | Después |
|---|---|---|
| `test_fideicomiso.mjs` | 26/26 | **26/26** |
| `test_all.mjs` | 3/3 suites (~169 assertions) | **3/3** |
| `test_full.mjs` | 121/121 | **121/121** |
| `test_integration.mjs` | 48/48 | **48/48** |
| `test_contraoferta.py` | 71/71 | **71/71** |
| `test_concordancia.py` | 150/151 | **150/151** (el fallo es **preexistente**: se reprodujo con el ensamblador de respaldo) |
| `test_qa.py` | requiere sitio live | no ejecutable sin red — sin relación con estos cambios |

### Pendiente

- `contraoferta.js` y `ensamblador_contraoferta.js` no se revisaron; comparten moldes y probablemente los mismos defectos.
- `traducciones_fr.js` hereda la cobertura parcial de `esMexicano` (solo su bloque `doc_fideicomiso`).
- La UI (`src/app/page.js`) no expone todavía `pacto_no_incluir_muebles` ni `campos.muebles`: hoy solo se alcanzan por JSON o por script.

---

## 9. Segunda tanda — pendientes de §8 cerrados (5-sep-2026)

| # | Archivo | Cambio |
|---|---|---|
| 8 | `plantillas/ensamblador_contraoferta.js` | **La contraoferta no tenía concepto de moneda.** Las tres llamadas a `bloquePrecio` iban con `'USD'` fijo, así que una contraoferta en pesos salía en dólares **en ambos idiomas** (no solo en la columna inglesa: `bloquePrecio(x,'USD')` produce también *"dólares estadounidenses"* en español). Ahora resuelve `moneda` desde `oferta_original.moneda` → `campos.precio.moneda` → `'USD'` y la propaga |
| 9 | `plantillas/traducciones_fr.js` | `cl_precio` bifurcaba **solo por el vendedor** (2 ramas), de modo que MX→MX imprimía *"Constitution de Fidéicommis en Zone Restreinte"*. Llevado a la misma matriz de 4 cruces que ES/EN. Y `cl_formalizacion` decía siempre *"l'acte de cession des droits fiduciaires"*: ahora dice *"l'acte de vente"* cuando ambas partes son mexicanas |
| 10 | `app/page.js` | Las etiquetas de precio compuesto decían **"(USD)"** fijo y el total se rotulaba **"USD"**, aunque el selector de moneda dijera MXN. Ahora siguen a `campos.precio.moneda` |
| 11 | `app/page.js` | La UI expone los campos nuevos: objeto de la operación de muebles, nombre del convenio, y el toggle de `pacto_no_incluir_muebles` (con la advertencia de que obliga también a la parte vendedora). Declarado en `INIT` para que arranque controlado |

**Nota sobre la contraoferta:** no hereda los defectos de modalidad — no contiene una sola mención a fideicomiso, fiduciario ni trust. Su problema era exclusivamente la moneda, y era más grave que el de la oferta.

### Verificación de la segunda tanda

| Suite | Resultado |
|---|---|
| `test_fideicomiso.mjs` | 26/26 |
| `test_all.mjs` | 3/3 suites |
| `test_full.mjs` | 121/121 |
| `test_integration.mjs` | 48/48 |
| `test_contraoferta.py` | 71/71 |
| `test_concordancia.py` | 150/151 (el mismo fallo preexistente) |
| `npx next build` | ✓ Compiled successfully — las 5 páginas se generan |

### Defecto preexistente detectado, NO corregido

Durante el prerender, `/contraoferta` registra `ensamblar: Cannot read properties of undefined (reading 'split')`. Está capturado por el `try/catch` de `src/app/contraoferta/page.js:229`, devuelve `null` y **no rompe el build**.

**Se verificó que es preexistente**: el mensaje aparece igual al hacer el build con el `ensamblador_contraoferta.js` de respaldo. Queda fuera del alcance de estos arreglos, pero vale la pena rastrearlo — es la página ensamblando con datos vacíos y tragándose el error en silencio.

### Sigue pendiente

- El fallo de `test_concordancia.py` ("Ensamblador pasa rol + personas + usarSingularColectivo"), preexistente y verificado contra el respaldo.
- El `split` de `/contraoferta` descrito arriba.
- La UI de contraoferta no tiene selector de moneda: el motor ya la respeta, pero desde la interfaz sigue tomando el default `USD`.
