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

---

# 8. Segunda ronda de brechas — caso Nitta 504 / Braatz (6-sep-2026)

**Caso de prueba:** MX→extranjero, fideicomiso BBVA vivo, compra de contado negociada 15% bajo
asking, comprador que NO quiere el mobiliario, cierre diferido ~5 meses por flujo de fondos.

Detectadas al armar la oferta a mano. Ninguna se solapa con las de §2.

## 8.0 · Defecto de fondo en §4 (`cl_precio`, línea 509) — corregir, no adicionar

La cláusula dice que el precio pactado será *"el valor único y definitivo que se asentará en la
Escritura Pública … **y sobre el cual se calcularán los impuestos de adquisición y
enajenación**"*.

**Las partes no pueden pactar eso.** El ISABI/traslado de dominio se causa sobre el valor
**mayor** de los tres (operación / catastral / avalúo), y el ISR por adquisición del art. 125
LISR se determina por el avalúo. La frase crea una expectativa contractual contra la ley y es
exactamente la que un comprador citará si el avalúo sale alto.

**Fix:** recortar en `es` y `en` a "…valor único y definitivo que se asentará en la Escritura
Pública correspondiente ante el Notario Público designado." La determinación fiscal ya está bien
tratada en §10 (`cl_isr`) y en el párrafo de moneda de `cl_saldo`.

## 8.1 · Bloque `ajuste_avaluo` ⭐ prioridad alta

**No existe nada en los 57 bloques que toque el art. 125 LISR.** Si el avalúo excede en más del
10% la contraprestación, la diferencia completa es *ingreso por adquisición de bienes* del
COMPRADOR y el fedatario retiene el 20% (arts. 125, 130 fr. IV y 132 LISR). En Nitta 504, a USD
$500,000 el umbral se dispara si el TC al cierre cae por debajo de 17.58; a $490,000, por debajo
de 17.93. No es teórico.

**Campos:** `avaluo.margen_pct` (default 10) · `avaluo.dias_acceso` (default 15) ·
`avaluo.dias_eleccion` (default 5) · `avaluo.a_cargo_de` (comprador | vendedor).

**Qué debe obligar:**
- que el vendedor **dé acceso al perito valuador** dentro de N días de aceptada la oferta ← esta
  es la mitad operativa y la que se olvida: sin acceso temprano, el comprador conoce el número
  en la mesa de firma, cuando ya no puede reaccionar;
- si el avalúo excede el margen, el comprador elige en N días entre **renegociar / absorber el
  impuesto / terminar sin responsabilidad con devolución íntegra del escrow**.

**Beneficio lateral:** el avalúo temprano tiene vigencia de 6 meses, así que el mismo documento
sirve de protección y de insumo del cierre. No se paga dos veces.

Va como inciso de condiciones indispensables → se engancha a la renumeración automática ya
construida para `gravamen_por_cancelar` (§6).

## 8.2 · Modo de elección en `inventario` ⭐ prioridad alta

El bloque actual **obliga al comprador a recibir todos los muebles**: prohíbe al vendedor retirar
nada y transmite el inmueble "con todos los bienes muebles, instalaciones y electrodomésticos".
Es protección correcta para el caso normal (que el vendedor no desmantele) y contraproducente
para el comprador que va a renovar y no quiere el mobiliario — el caso Braatz.

El campo `inventario.exclusiones` **no lo resuelve**: es una lista estática que se escribe *antes*
de ver el inventario. Lo que falta es la elección *posterior* a recibirlo.

**Campo:** `inventario.modo` = `incluye_todo` (default, comportamiento actual) |
`eleccion_comprador` | `entrega_vacio`. Más `dias_eleccion` (5) y `dias_retiro` (3, sincronizado
con la ventana de walk-through que ya emite `obligaciones_vendedor`).

⚠ **El carve-out de bienes adheridos no debe ser configurable.** Instalaciones fijas, aire
acondicionado, cocina integral y muebles de baño se transmiten siempre. Sin eso, un vendedor
literal arranca la cocina alegando que el comprador "no la eligió".

**Nota de negociación** (para la UI, no para el documento): al vendedor extranjero le cuesta caro
retirar muebles a distancia. El fallback que suele cerrar es crédito en precio por desalojo.

## 8.3 · Constructor de `fecha_formalizacion` ⭐ prioridad alta, costo bajo

Tres defectos encadenados:

1. El campo es `requerido: true` pero **no se valida**: el JSON de marzo lo traía vacío y el motor
   emitió *"…a más tardar el día ."* — documento roto, enviado a firma.
2. Es **texto libre en dos idiomas**. Toda la prosa (incluido el derecho de adelantar el cierre)
   se teclea a mano, duplicada. Es el campo con más superficie de error del formulario.
3. `fecha_extension` es independiente, pero `cl_demora` ya afirma "un mes después" → hoy se
   pueden capturar valores que se contradicen dentro del mismo documento.

**Fix:** date picker + modificador (`a más tardar el` | `cualquier día hábil dentro de…`) + toggle
de **derecho de adelantar** con N días hábiles de aviso, generando ambos idiomas desde
`core/fechas.js`. Y `fecha_extension` calculada por default como formalización + 1 mes, editable.

## 8.4 · `adquisicion.ruta` para compradores extranjeros ⭐ prioridad media-alta

`cl_precio` (línea 526) ya emite una frase opcional: *"tendrá la opción de asumir los derechos
fideicomisarios existentes o constituir un nuevo fideicomiso"*. Pero eso **difiere** la decisión;
no la modela. Y es el mayor driver de tiempo y costo de toda la operación:

- **cesión sobre fideicomiso existente** → sin permiso SRE nuevo, sin constitución, hereda plazo
  remanente. Más rápida y barata;
- **fideicomiso nuevo** → permiso SRE (2–4 semanas), constitución (~USD $2,000–2,500), plazo
  fresco de 50 años.

**Campo:** `adquisicion.ruta` = `cesion_derechos` | `fideicomiso_nuevo` | `opcion_comprador`
(actual). Debe alimentar quién paga qué en §9, los plazos de autorización y KYC del fiduciario, y
si se requiere permiso SRE.

## 8.5 · Datos del fideicomiso existente ⭐ prioridad media

`doc_fideicomiso` pide la copia del fideicomiso pero no captura sus datos. Para una cesión son
materiales.

**Campos:** `fideicomiso.numero` · `fideicomiso.institucion` · `fideicomiso.fecha_constitucion` ·
`fideicomiso.plazo_anios` (default 50). Permite emitir el **plazo remanente**, que es dato de
decisión del comprador. En Nitta 504: F/4046991, BBVA, 15-jun-2009, 50 años → remanente ~2059.

## 8.6 · Vigencia como plazo, no fecha absoluta ⭐ prioridad media

`fecha_vigencia` es absoluta e independiente de `fecha_presentacion`. Si se recorre la
presentación y no se recuerda mover el vencimiento, la oferta nace con una vigencia mal calculada
—o vencida—. **Fix:** capturar `dias_vigencia` (default 5 naturales) y calcular la fecha,
mostrándola; permitir override manual.

## 8.7 · Resumen accionable

| Prioridad | Qué | Dónde |
|---|---|---|
| Alta | Recortar la promesa fiscal de §4 | `oferta_compra.js:509` (es/en) |
| Alta | Bloque `ajuste_avaluo` | `oferta_compra.js` + UI |
| Alta | `inventario.modo` con elección y carve-out de adheridos | `oferta_compra.js` + UI |
| Alta (barata) | Constructor de `fecha_formalizacion` + extensión calculada + validación | `app/page.js`, `core/fechas.js` |
| Media-alta | `adquisicion.ruta` | `oferta_compra.js` + UI |
| Media | Datos del fideicomiso existente | campos nuevos |
| Media | `dias_vigencia` calculado | `core/fechas.js` + UI |

**Escape hatch mientras tanto:** `condicion_libre` puede hospedar la cláusula de ajuste por
avalúo hoy mismo, numerada e integrada. El modo de inventario no cabe ahí (modifica el inciso
existente, no agrega uno nuevo).


---

# 9. Andamiaje de invariantes — implementado (6-sep-2026)

Responde a la decisión de que la app crezca en cobertura **sin** que aparezcan
contradicciones. La revisión —humana o de tres IAs— cubre un caso a la vez; el espacio de
combinaciones crece exponencialmente. Esto cambia lo que revisamos, no cuánto.

## 9.1 · Lo que se levantó

| Archivo | Qué hace |
|---|---|
| `src/lib/plantillas/grafo.js` | Declara los **39 interruptores** y las **7 relaciones** (requiere / incompatible_con), cada una con su `porque`. Fuente de verdad de qué combinaciones son legales. |
| `qa/lib/pairwise.mjs` | Generador all-pairs con restricciones + verificador de cobertura. |
| `qa/lib/invariantes.mjs` | 9 invariantes, cada uno con el defecto real que lo motiva. |
| `qa/test_invariantes.mjs` | Runner: anti-deriva + generación + evaluación. Registrado en `test_all.mjs` y en `npm run test:invariantes`. |

**Resultado de la corrida:** 16 casos generados cubren **2,598/2,598 pares alcanzables**, de un
espacio exhaustivo de 2^39 ≈ 5.5×10^11. Evaluación sobre 32 renders (16 casos × 2 escenarios de
modalidad).

## 9.2 · Hallazgo estructural: 6 banderas fantasma

El catálogo declara **33 bloques condicionales**, pero el código lee **39 interruptores** desde
`ctx.bloques.*`. Las 6 restantes —`precio_compuesto`, `mobiliario_separado`,
`pacto_no_incluir_muebles`, `opcion_fideicomiso`, `obligaciones_vendedor_agua`,
`condiciones_remocion`— ramifican texto y **no aparecían en ningún catálogo**. Ahora están
declaradas en `INTERRUPTORES` con `tipo: 'bandera'`. Moverlas a `campos` sería el siguiente paso:
hoy comparten namespace con los bloques sin serlo.

## 9.3 · Anti-deriva

Seis chequeos impiden que el grafo se vuelva documentación muerta. Si alguien adiciona un bloque
o un `ctx.bloques.X` y no lo declara, **el test falla**. Ese es el mecanismo que permite crecer a
80 o 120 bloques sin que la confiabilidad baje.

## 9.4 · Dos defectos encontrados en la primera corrida — ambos CORREGIDOS

Detectados por los invariantes en su primera ejecución, verificados contra el código fuente antes
de llamarlos defectos, y corregidos con autorización expresa por tratarse de texto que va a firma.

### a) `adjudicacion_conyuge` — ✅ CORREGIDO (6-sep-2026)

Emite *"será adjudicataria del 50% de los **derechos fideicomisarios**"* / *"trust rights"*
**siempre**, sin consultar nacionalidad. Es el mismo defecto que motivó `test_modalidad.mjs`,
en otro bloque: entre dos mexicanos con dominio pleno, la redacción correcta es *derechos de
copropiedad* o *la mitad proindivisa*, no derechos fideicomisarios.

**Segundo defecto en el mismo bloque:** el género está hardcodeado —*"su difunto esposo"*,
*"she"*, *"her"*— pese a que el bloque ya usa `ctx.propietario.referencia_negrita`, o sea que la
maquinaria de concordancia está disponible y no se aplicó. Un viudo recibe el texto en femenino.

**Corregido en dos frentes.**

**Modalidad.** Ahora ramifica con el mismo idioma que el resto del molde
(`propietario.esMexicano && ofertante.esMexicano`):

| | Redacción |
|---|---|
| Fideicomiso | *…será adjudicataria **del 50% de los derechos fideicomisarios** que le correspondían a su difunto cónyuge, consolidándose el 100% de los derechos fideicomisarios en ella.* |
| Dominio pleno | *…será adjudicataria **de la mitad proindivisa** que le correspondía a su difunto cónyuge, consolidándose el 100% de la propiedad en ella.* |

⚠️ **Ojo con la aritmética al redactar variantes:** la propuesta inicial decía *"el 50% de la
mitad proindivisa"*, que es 25% y no consolida el 100%. En la variante de fideicomiso el "50%"
sí funciona porque *"los derechos fideicomisarios"* es el todo; *"la mitad proindivisa"* ya es
la mitad. Un invariante de texto no atrapa esto — es aritmética dentro de la prosa. Queda como
recordatorio de que el andamiaje cubre consistencia estructural, no corrección sustantiva.

**Género.** Se aplica concordancia con el **cónyuge superviviente** (`propietario.clave`), que es
quien comparece: adjudicataria/adjudicatario · ella/él · she/he · her/him. Verificado en las 4
combinaciones (viuda/viudo × fideicomiso/dominio pleno).

**Y el género del fallecido dejó de importar:** la redacción usa *"su difunto cónyuge"* /
*"deceased spouse"*, neutro en ambos idiomas. Derivarlo del superviviente habría presupuesto
matrimonio heterosexual, y capturarlo habría agregado un campo para un dato que la redacción
correcta no necesita. **La solución al problema de concordancia fue redactar sin el dato**, no
modelar el dato.

### b) `holdback_escrow` ignoraba `es_condominio` — ✅ CORREGIDO (6-sep-2026)

Emite *"Administración de Condóminos"* / *"Homeowner's Administration"* y exige carta del
Administrador del Condominio aunque el inmueble esté **fuera de régimen**. Es el **defecto 12
replicado**: se corrigió en `obligaciones_vendedor` y no en este bloque.

**Corregido** con el mismo patrón de `obligaciones_vendedor`: el mecanismo de retención es
idéntico en ambos regímenes, lo que cambia es **quién determina el adeudo**.

| | En condominio | Fuera de régimen |
|---|---|---|
| Origen del cargo | cuota extraordinaria (assessment), derrama o cargo de la Administración de Condóminos | contribución de mejoras, derrama, cuota de asociación de colonos o cargo atribuible a EL INMUEBLE |
| Constancia | carta del Administrador del Condominio | constancia de la autoridad u organismo correspondiente |

La etiqueta del bloque pasó de *"Holdback en escrow por adeudos de condominio"* a *"…por adeudos
pendientes de determinación"*, porque ya sirve a los dos regímenes. Bilingüe ES/EN.

**Sin assertions nuevas en `test_modalidad.mjs`, a propósito:** el invariante
`sin_condominos_fuera_de_regimen` ya lo verifica sobre 16 renders en vez de sobre un caso escrito
a mano. Agregar una assertion por caso sería volver al método que este andamiaje reemplaza.

## 9.5 · Nota de método

Dos de los cuatro fallos de la primera corrida eran del andamiaje, no del molde:

- el generador declaraba irrealizables dos pares legales porque sembraba desde los **defaults**
  (con `ad_corpus` encendido, todo par con `precio_compuesto` parecía prohibido). Corregido:
  siembra desde todo apagado;
- el invariante de incisos mezclaba **dos series de letras independientes** — §4 tiene su propia
  A)/B) para las formas de pago, aparte de la serie de §15. Corregido acotándolo a §15.

Vale registrarlo: un invariante mal escrito produce alarmas que erosionan la confianza en la
suite más rápido de lo que la falta de cobertura produce defectos. **Todo invariante nuevo debe
verificarse contra el código antes de darse por bueno.**


---

# 10. Cierre del ciclo — fiscalización Braatz (6-sep-2026)

La oferta Nitta 504 pasó por CX y Agy. Sus hallazgos produjeron correcciones de plantilla y
**un invariante nuevo nacido de un defecto que esta misma suite no vio**.

## 10.1 · El fallo que el andamiaje NO atrapó

La v1 salió a fiscalización con la cláusula 8 así:

> *"Dicha escritura pública se celebrará ante la fe del , Notario Público  de ."*

Causa: el id del notario era `meza_29`, que **no existe** — el catálogo lo llama `buc_29`. El id
venía arrastrado del JSON de marzo, o sea que **la oferta de marzo también salió con el notario
en blanco** y nadie lo notó en seis meses.

Por qué se escapó: `sin_fugas_de_plantilla` busca `undefined` / `NaN`. El motor no produjo eso —
produjo **cadena vacía**. La cláusula quedó sintácticamente intacta y semánticamente nula.

**Dos correcciones:**

1. **Invariante `sin_puntuacion_huerfana`** — caza la puntuación que queda colgando cuando una
   interpolación resuelve a vacío (`\s+,`, `de\s+\.`, `\(\s*\)`, sangrías triples…). Deliberadamente
   **no** incluye `:` al final de párrafo: `cl_precio` termina así de forma legítima al introducir
   sus incisos, y con esa regla los 32 renders daban falso positivo.
2. **Guarda en el motor** (`ensamblador.js`): un `notario_seleccion` que no está en el catálogo
   ahora inyecta `⟦Pendiente⟧` en lugar de vaciarse. El hueco ya no puede viajar en silencio.

## 10.2 · Concordancia inglesa — la corrección que destapó otras cuatro

Agy señaló tres defectos gramaticales. Corregirlos tuvo efecto dominó:

| Defecto | Corrección |
|---|---|
| *"adquirió"* con dos vendedores | `cl_antecedente` concuerda con `clave` (`adquirieron`) |
| Nombres unidos con *"y"* en inglés | `formatearNombresEn()` + `nombres_en` en el contexto; `cl_propietario` y `buildComparecenciaEn` lo usan |
| *"Once THE OWNER have accepted"* | `sustEn` pasa a usar `claveReal`: el singular colectivo (*"EL PROPIETARIO"* para dos personas) es convención notarial mexicana y **no existe en inglés** |

⚠️ **La tercera corrección introdujo una regresión propia.** Al pluralizar el sustantivo quedaron
al descubierto **seis verbos fijos en singular** repartidos por la plantilla: *"THE OWNERS **has**
timely delivered"*, *"**is** forbidden to remove"*, *"**is** obligated to block/fulfill/inform"*.
Se agregaron helpers `en.has` / `en.is` / `en.s` al contexto de la parte y se aplicaron en los seis
puntos.

**Lección de método:** un cambio de concordancia nunca es local. El sustantivo y sus verbos viven
en archivos distintos, y la suite pasó en verde **entre** la primera corrección y las seis
siguientes — el documento generado era el único lugar donde el desacuerdo se veía. Un invariante
de concordancia sujeto-verbo en inglés sería el siguiente candidato natural.

## 10.3 · Campo `tipo_superficie`

El molde afirmaba *"superficie de construcción"* siempre. En Nitta 504 el antecedente dice
*"extensión superficial aproximada"* e incluye terrazas y **alberca**: llamarle construcción a ese
número afirma algo que la escritura no dice. Campo nuevo `inmueble.tipo_superficie`
(`construccion` | `extension`), default = comportamiento anterior. Propagado a ES, EN y FR.

## 10.4 · Plazo de subsanación acotado

`doc_fideicomiso` daba al vendedor N días hábiles *"—o hasta la FECHA DE FORMALIZACIÓN, si ésta
fuera posterior—"* para subsanar observaciones materiales. Esa frase mantiene viva una observación
hasta el cierre. Ahora: *"N días hábiles **improrrogables**, plazo que en ningún caso se extenderá
hasta la FECHA DE FORMALIZACIÓN"*.

## 10.5 · Doctrina de orden: condiciones antes del depósito

Hallazgo de proceso, no de código: **el motor ya soportaba `escrow.ancla_deposito: 'condiciones'`**
y no se estaba usando. Emite *"dentro de los N días hábiles siguientes **al cumplimiento de las
condiciones indispensables**"* en vez de anclar a la aceptación.

Importa porque invierte quién soporta el riesgo: con el dinero depositado antes de cumplirse las
condiciones, liberarlo del escrow exige **firma de ambas partes** y el comprador queda de rehén.
Debería ser el **default** del bloque `escrow`, no una opción que hay que recordar.

## 10.6 · Tercer defecto de la divergencia ES/EN: las negritas

Detectado por Rolo al revisar la oferta final: en la columna inglesa, **el primer nombre de cada
parte salía sin negrita** (", ALAN BRAATZ and **NICOLE BRAATZ**"). El segundo se salvaba.

Causa: `parseTextoConNegritas` (generador.js) reconoce nombres propios en mayúsculas mediante un
lookahead que lista los conectores que pueden seguirlos — `quien|who|manifiesta|states|por|de|
herein|y\s|en\s|a\s`. Incluía `y` pero **no `and`**. Al cambiar el conector inglés en §10.2, el
primer nombre dejó de calificar; el segundo seguía calificando por la coma que lo sigue.

Corregido agregando `and\s` al lookahead.

**Es el tercer defecto de la misma familia en dos días**, después de los verbos en singular y de
los nombres unidos con "y". El patrón vale más que los tres arreglos juntos:

> Cada vez que el inglés deja de ser una copia estructural del español, algo que dependía de esa
> simetría se rompe **en silencio**. Ninguno de los tres lo cazó la suite; los tres los cazó
> alguien leyendo el documento generado.

Los tres invariantes que faltan y que cerrarían la familia:
1. **concordancia sujeto-verbo en inglés** (pendiente desde §10.2);
2. **paridad de negritas ES/EN** — un nombre en negrita en una columna debe estarlo en la otra;
3. **paridad de conectores** — la lista de la columna española y la inglesa deben tener el mismo
   número de nombres propios.

El (2) habría cazado este defecto de inmediato y es el más barato de los tres: comparar el
conjunto de fragmentos en negrita de `es` contra el de `en` por bloque.

## 10.7 · Cierre de la familia: lo que es DATO lo declara quien lo tiene

Detectado por Rolo: la razón social del escrow salía **partida en tres** —
`ARMOUR SECURE ESCROW` en negrita, `, S ` en texto normal, `DE RL DE CV` en negrita otra vez— y
en inglés sólo la primera parte.

Causa: el detector engancha por lo que **sigue** al nombre. En español seguía *"por la cantidad"*
(y `por` está en el lookahead); en inglés seguía *"to constitute"*, que no está. Mismo mecanismo
que §10.6, distinta manifestación.

**No se parchó la regex por tercera vez.** Ese camino ya produjo un defecto. `generarDocx` ahora
acepta `opciones.terminosNegrita`: literales que el llamador declara y que se anteponen en la
alternancia, ganando sobre el detector genérico. La razón social es **dato**, no patrón — ningún
lookahead iba a reconocerla, y agregarle conectores sólo movía el problema de lugar.

```js
generarDocx(bloques, meta, { terminosNegrita: [datos.campos.escrow.empresa_escrow] })
```

`TERMINOS_NEGRITA` es módulo-global y se limpia tras empacar: el render es síncrono de principio a
fin, no hay dos documentos armándose a la vez.

**Regla que cierra la familia de §10.2 / §10.6 / §10.7:**

> El detector por patrón sirve para lo que es **estructura** (referencias contractuales, términos
> definidos). Lo que es **dato** —nombres de personas, razones sociales, denominaciones— lo debe
> declarar quien lo tiene. Cada vez que se intentó que el patrón adivinara un dato, el resultado
> fue un defecto silencioso distinto en cada idioma.

## 10.8 · ANEXO B sin ANEXO A

También detectado por Rolo. El molde emitía una sola referencia a anexo en todo el documento —
`ANEXO B (Escrow Agreement)`— y **nunca un Anexo A**. Herencia del machote original: las tres
versiones del expediente Braatz (la manual del 24-mar, la de Ofertagen del 30-mar y la de hoy) lo
traían igual.

No es cosmético: un contrato que llama "Anexo B" a su único anexo le dice al lector que existe un
Anexo A que no recibió. Renombrado a `ANEXO A` / `ADDENDUM A` en ES y EN.

Si algún día se agrega un segundo anexo, la numeración debería generarse sola — mismo patrón que
la renumeración de incisos de §15.

# 11. Mecánica de condiciones-primero: cerrar los cabos (6-sep-2026)

Segunda ronda de CX y Agy sobre la v6. Confirmaron que el ancla del depósito quedó bien puesta,
pero encontraron que **el resto del clausulado seguía escrito para el orden anterior**.

## 11.1 · Siete vestigios de reembolso, no tres

Agy detectó que varios incisos de §15 seguían prometiendo *"reembolsar el depósito"* si una
condición fallaba — cuando bajo el nuevo orden **no hay depósito todavía**. Yo había corregido el
inciso de avalúo y no barrí el resto: una corrección a medias, que es peor que ninguna porque
parece completa. Eran **siete** ocurrencias entre ES y EN.

**Diverge de la corrección propuesta:** Agy sugería borrar la mención. Se optó por **condicionarla**
(*"de haberse constituido el depósito en garantía, éste será reembolsado…"*), igual que el inciso
de avalúo. Borrarla quita una protección al comprador que no cuesta nada conservar, y si algún día
se invierte la secuencia el derecho sobrevive.

## 11.2 · El gatillo del depósito era un evento difuso

*"Dentro de los 3 días hábiles siguientes al cumplimiento de las condiciones"* no dice **qué día**
se cumplió la última condición. Con plazos escalonados —inspección, título, avalúo— el vencimiento
quedaba indeterminado, y de eso se cuelga cualquier controversia.

Ahora el plazo corre desde la **suscripción por ambas partes de la CARTA DE CUMPLIMIENTO Y REMOCIÓN
DE CONDICIONES INDISPENSABLES**, documento que la cláusula de anexos ya mencionaba. Un evento
documental y fechado, no un estado de hecho.

## 11.3 · Circularidad de arrendamientos

La decisión sobre continuidad de rentas debía comunicarse *"al momento de constituir el depósito"*,
pero el depósito depende de que las condiciones estén cumplidas — y ésta es una de ellas. Se mordía
la cola. Ahora se comunica dentro de los 5 días de recibidos los contratos y **antes** de la carta
de remoción; el bloqueo del calendario de reservaciones se activa al acreditarse el depósito.

## 11.4 · El inventario mezclaba condición con obligación de cierre

Dentro de las condiciones indispensables convivían *entregar y elegir el inventario* (condición) y
*retirar los muebles 3 días antes del cierre* (obligación de cierre). Lectura literal: la condición
no se cumple hasta el cierre, luego el depósito nunca vence.

Se agregó la separación expresa: la condición **se satisface al quedar definido el inventario
final**; retiro, conservación y entrega subsisten como obligaciones exigibles a la FECHA DE
FORMALIZACIÓN y **no difieren el vencimiento del depósito**.

## 11.5 · Lección de diseño

Cambiar `ancla_deposito` es una línea. Hacer que el documento **sea coherente** con ese cambio tocó
cuatro bloques y once fragmentos de texto. La opción existía en el motor desde antes y nadie la
había usado — probablemente porque activarla a secas produce un documento contradictorio.

> Una opción de configuración que exige cambios coordinados en otros bloques no es una opción: es
> una trampa. `ancla_deposito: 'condiciones'` debería arrastrar automáticamente la redacción
> dependiente, o el molde debería declarar esa dependencia en `grafo.js` para que QA la verifique.

Candidato concreto: invariante que, con `ancla_deposito === 'condiciones'`, prohíba la frase
*"al momento de constituir el depósito"* como gatillo de cualquier condición.

## 11.6 · La salida sin depósito: excepción, no contradicción

Único punto en que CX y Agy discreparon. Agy: dejar tal cual la terminación automática sin
responsabilidad del 4.A, porque favorece al comprador. CX: choca con la cláusula de PENALIDAD y
hay que resolverlo.

Ambos tenían razón en su mitad — conviene al comprador, y dos cláusulas del mismo documento decían
cosas opuestas. Se conserva el beneficio y se elimina la contradicción declarándolo **excepción
expresa en los dos lugares**: el 4.A dice que constituye una EXCEPCIÓN a la cláusula de PENALIDAD,
y la de PENALIDAD reconoce el supuesto (condicionado a que el bloque escrow esté activo).

Las referencias van **por nombre de cláusula, no por número** — el invariante
 lo exige, y con incisos que se renumeran solos una
referencia numérica se rompe en cuanto se apaga un bloque.

## 11.7 · AS-IS sin reserva de inspección

La cláusula AD CORPUS declaraba, en pasado, que el comprador adquiere el inmueble en su estado
actual *"habiendo tenido la oportunidad de inspeccionarlo"* y que *"acepta las condiciones en que
se encuentra"*. Pero se firma el día de la oferta, **antes** de la inspección, que es una condición
indispensable posterior a la aceptación.

El mismo documento decía que ya inspeccionaron y aceptaron, y cuatro cláusulas más abajo les
concedía días para inspeccionar y rechazar. En el caso Braatz había además un agravante de hecho:
los compradores están en Canadá y firmar que tuvieron oportunidad de inspección física podía
simplemente no ser cierto.

Se agregó reserva expresa: *"Lo anterior queda expresamente sujeto al resultado de las CONDICIONES
INDISPENSABLES … y no limita las obligaciones de EL PROPIETARIO de conservar y entregar EL INMUEBLE
en los términos aquí pactados."* El AS-IS sigue cubriendo antigüedad y desgaste normal, que es lo
que debe cubrir; deja de ser renuncia anticipada de lo que aún no se ha visto.

## 11.8 · Celda bilingüe en la columna española

Detectado por Rolo: la columna ES emitía  — los dos
idiomas dentro de la misma celda. La variante inglesa sí estaba limpia.

Vestigio de cuando el bloque se escribió como blob bilingüe, antes de que el documento fuera a
doble columna. Barrido del resto del molde: las otras cuatro coincidencias de ese patrón son
comentarios del código fuente, no texto emitido.

**Candidato a invariante:** ninguna celda española debe contener una etiqueta en inglés en
VERSALES, y viceversa. Es de la misma familia que los tres defectos ES/EN de §10 — divergencias
entre columnas que nadie ve hasta que alguien lee el documento impreso.
