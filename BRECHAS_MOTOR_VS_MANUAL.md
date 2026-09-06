# Motor vs. borrador manual — qué le falta a OfertaGen

**Fecha:** 5-sep-2026 · **Caso de prueba:** Valle Dorado / Aosta 58 (MX→MX, dominio pleno, precio compuesto, MXN, no condominio).

Comparados:
- **A.** `OFERTA_COMPRA_VALLE_DORADO_ESPANOL.md` — 20 cláusulas escritas a mano por AGY, sin pasar por el molde.
- **B.** `OFERTA_VD_MOTOR_CC.md` — generada 100% desde el motor post-fix (`generar_oferta_vd_motor.mjs`), sin una sola cláusula a mano.

---

## Veredicto

**El motor ya produce un documento correcto y completo para este caso.** Cero menciones de fideicomiso, cero "U.S. Dollars", cero "unidad privativa", cero "Vehículo", el pacto de omisión apagado y el objeto de muebles descrito como negocio en marcha.

Lo que el borrador manual tiene de más son **cuatro cláusulas de fondo** que el molde no contempla. Ninguna es un defecto: son huecos de cobertura, y tres de las cuatro salen del expediente concreto.

---

## 1. Defectos encontrados al comparar — YA CORREGIDOS

| # | Defecto | Origen |
|---|---|---|
| 12 | `obligaciones_vendedor` pedía **"carta de no adeudo emitida por la Administración de Condóminos"** y prorrateaba **"cuotas ordinarias y extraordinarias de condóminos"** aunque `es_condominio` fuera `false`. El molde ya distinguía el régimen en `doc_fideicomiso`, pero no aquí | Defecto del molde, nunca corregido. AGY lo arregló a mano en su borrador; la app seguía emitiéndolo |
| 13 | `"El precio de la compraventa de el negocio mercantil…"` | **Introducido por mí** al hacer configurable el objeto de muebles: el valor debe absorber la preposición, como ya hacía `unidadEs`. Corregido en el default, en el placeholder de la UI y en el generador |

Ambos quedaron cubiertos con 6 assertions nuevas en `qa/test_modalidad.mjs` (43/43).

---

## 2. Lo que el borrador manual tiene y el molde NO — candidatos a adicionar

### 2.1 · Libertad de gravámenes como CONDICIÓN INDISPENSABLE, con carta de saldo — ✅ IMPLEMENTADO (ver §6)

El borrador manual dedica una cláusula entera a esto:

> *"LA PROPIETARIA se obliga a tramitar y exhibir ante el Notario Público designado, con al menos 10 (diez) días hábiles de anticipación a la FECHA DE FORMALIZACIÓN, **la carta de saldo** y la documentación jurídica necesaria para la formalización de **la cancelación de los gravámenes e hipotecas** inscritos en los antecedentes registrales del inmueble, cuya cancelación se otorgará en forma previa o simultánea con la escritura definitiva."*

**Qué tiene hoy el molde:** la §12 declara que se transmite libre de gravámenes, y `obligaciones_vendedor` pide el Certificado de No Gravamen dentro de los 30 días previos. Eso constata el problema; **no lo resuelve.**

**Qué falta:** el caso de que exista **una hipoteca viva que haya que cancelar**. Requiere carta de saldo del acreedor, plazo propio, y cancelación previa o simultánea a la firma. Y debe ser **condición indispensable**, no una obligación más de la lista: si no se cancela, no hay operación.

No es un caso raro: cualquier inmueble comprado con crédito lo tiene. En Valle Dorado la hipoteca es de 2004 (Hipotecaria Nacional / SHF) y no hay evidencia de cancelación.

**Propuesta:** bloque condicional nuevo `gravamen_por_cancelar`, con campos para el acreedor y el plazo de la carta de saldo, colocado entre las condiciones indispensables.

### 2.2 · Inventario de negocio en marcha ⭐ prioridad media

El bloque `inventario` del molde está pensado para muebles de casa habitación: lista de inclusiones, fotografías, prohibición de retirar.

El borrador manual describe otra cosa: **levantamiento conjunto** de activos, mobiliario, refrigeradores y mercancías, dentro de un plazo previo al cierre, protocolizado como anexo del convenio privado y con valor asignado.

**Qué falta:** una variante de `inventario` para negocio en marcha. Hoy `campos.muebles.objeto_es` ya permite describir el objeto en la §4, pero el bloque de inventario sigue hablando de electrodomésticos.

### 2.3 · ISR con fundamento y caso de uso mixto ⭐ prioridad media

El molde emite un ISR genérico ("una vez aplicadas, en su caso, las exenciones…"). El borrador manual cita el **art. 93 fr. XIX LISR**.

**Cuidado:** citarlo a secas en un inmueble de uso mixto —como este, 62.05 m² habitacionales y 58.58 m² de local comercial— **le crea al vendedor una expectativa de exención total que no se cumple.** Si se adiciona al molde, debe venir con la variante de exención parcial, no solo con la cita.

**Propuesta:** campo `uso_mixto` en el inmueble que, cuando esté activo, redacte la §10 reconociendo que la exención alcanza solo la porción habitacional.

### 2.4 · Organismo operador de agua nominado ⭐ prioridad baja

`obligaciones_vendedor_agua` dice "el organismo operador correspondiente". El borrador manual nombra **OROMAPAS Bahía de Banderas**. Un campo de texto libre lo resuelve.

---

## 3. Lo que el molde tiene y el borrador manual NO

No todo va en una dirección. El motor emite, y el borrador manual omitió:

- **Cesión de contratos de servicios** (CFE, internet, cable) con plazo de 30 días y regla de reconexión.
- **Cláusula de penalidad** completa, con el mecanismo de liberación del escrow en ambos sentidos.
- **Fuerza mayor** con catálogo de eventos y prórroga día por día hasta 90 días.
- **Comunicaciones electrónicas** con validez de firma electrónica y plazo de originales.
- **Duplicados** y **documentos integrales**.
- **Condición de uso y desgaste** ("AS-IS" con equipos en buen funcionamiento).
- La **inspección** con su procedimiento de rechazo y silencio positivo.

En conjunto, el documento del motor es **más completo** que el manual: 33 bloques contra 20 cláusulas.

---

## 4. Nota sobre los títulos en salidas Markdown

En el markdown generado aparecen encabezados con el id técnico del bloque (`### escrow`, `### doc_fideicomiso`, `### fuerza_mayor`). **No es un defecto del molde.**

31 de los 54 bloques no tienen `titulo` porque son **sub-bloques**: cuelgan de la cláusula numerada anterior. El generador DOCX lo maneja bien — `if (bloque.titulo || bloque.t)` omite el encabezado y el texto fluye dentro de la cláusula. El id aparece solo porque los exportadores a Markdown usan `|| b.id` como último recurso.

**Si se quiere salida Markdown presentable**, el fallback debe ser `b.etiqueta` (que sí existe y es legible: *"Entrega de documentación (escritura/fideicomiso)"*), o simplemente no emitir encabezado. Es un fix del exportador, no del molde.

Vale la pena señalarlo porque es plausible que sea **la razón por la que el borrador manual abandonó el molde**: para poder titular las 20 cláusulas.

---

## 5. Resumen accionable

| Prioridad | Qué | Dónde |
|---|---|---|
| ~~Alta~~ **✅ hecho** | Bloque `gravamen_por_cancelar` (carta de saldo + cancelación previa/simultánea) como condición indispensable — ver §6 | `oferta_compra.js` + UI |
| Media | Variante de `inventario` para negocio en marcha | `oferta_compra.js` |
| ~~Media~~ **✅ hecho** | §10 con exención parcial cuando el inmueble es de uso mixto — ver §7 | `oferta_compra.js` + campo `uso_mixto` |
| Baja | Nombre del organismo operador de agua | campo de texto |
| Baja | Fallback de título en exportadores Markdown: `etiqueta` en vez de `id` | exportadores |

---

## 6. Implementado: bloque `gravamen_por_cancelar`

Cubre el hueco de §2.1. Condicional, **apagado por defecto**, emitido como inciso de las condiciones indispensables — si el gravamen no se cancela, no hay operación.

Los incisos se renumeran solos según qué bloques estén activos: con él encendido queda **A** inspección, **B** documentación, **C** gravamen, **D** inventario; apagado, el inventario recupera la C.

**Campos:** `campos.gravamen.acreedor` (con fórmula genérica *"la institución acreedora"* si se omite) y `campos.gravamen.dias_carta_saldo` (default 10, emitido en número y letra).

**Qué obliga**, incluyendo dos cosas que el borrador manual no decía:

- carta de saldo o de no adeudo del acreedor, con plazo propio anterior al cierre;
- documentación de cancelación, otorgada **previa o simultáneamente** a la escritura definitiva;
- **los gastos, derechos e impuestos de la cancelación son por cuenta del vendedor** ← no estaba en el manual;
- **salida para el comprador**: si no se cancela en plazo, puede extender la FECHA DE FORMALIZACIÓN o terminar la oferta sin responsabilidad, **con devolución íntegra del depósito en garantía** ← tampoco estaba.

Bilingüe ES/EN. Expuesto en la UI con su toggle y sus dos campos. 12 assertions en `qa/test_modalidad.mjs` (55/55), incluida la renumeración de incisos con y sin el bloque.

---

## 7. Implementado: §10 ISR con exención parcial por uso mixto

Cubre el hueco de §2.3, y de la forma que ahí se advertía: **no basta con citar el art. 93 fr. XIX**. Citarlo a secas en un inmueble mixto promete una exención total que no existe.

**Campos:** `campos.inmueble.uso_mixto` (bool) y, opcionalmente, `superficie_habitacional_m2` / `superficie_comercial_m2`.

Con `uso_mixto` activo, la §10 añade que:

- el inmueble es de uso mixto, **con las superficies si se capturaron**;
- la exención del art. 93 fr. XIX inciso a) aplica **únicamente a la proporción habitacional**, quedando gravada la restante;
- la apartición la determina el fedatario con base en el avalúo;
- el vendedor se obliga a aportar la documentación para **acreditar el destino habitacional** de la porción exenta.

Sin superficies capturadas emite el texto **sin cifras**, en vez de inventarlas. Y convive con la lógica de fideicomiso de la misma cláusula: un vendedor extranjero con inmueble mixto recibe ambos párrafos.

Bilingüe ES/EN. En la UI va junto al régimen de condominio, con las dos superficies desplegables y la advertencia de por qué importa. 8 assertions en `qa/test_modalidad.mjs` (63/63).

**Caso Valle Dorado:** con 62.05 m² habitacionales y 58.58 m² comerciales tomados del avalúo MIPSA, la cláusula ahora dice en el documento que la exención alcanza solo a la primera porción.
