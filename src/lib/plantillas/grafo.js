/**
 * OfertaGen — Grafo de interruptores
 *
 * Declara EXPLÍCITAMENTE el acoplamiento entre bloques que hoy vive implícito
 * dentro de los ternarios de cada render(). Existe por una razón concreta:
 *
 *   Las dependencias entre bloques son reales (35 referencias cruzadas) pero
 *   NO son enumerables. Nadie puede listarlas, así que nadie puede verificarlas.
 *   Una revisión —humana o de tres IAs— cubre un caso a la vez; el espacio de
 *   combinaciones crece exponencialmente. Esa carrera no se gana leyendo.
 *
 * Este archivo es la fuente de verdad de QUÉ combinaciones son legales.
 * `qa/test_invariantes.mjs` verifica dos cosas contra él:
 *   1. que la declaración no se quede atrás del código (anti-deriva), y
 *   2. que ninguna combinación legal viole los invariantes del documento.
 *
 * Mantener este archivo al adicionar un bloque NO es opcional: el test falla.
 */

/**
 * INTERRUPTORES — el espacio de estado completo.
 *
 *   tipo 'bloque'  → tiene entrada en PLANTILLA.bloques con condicional:true
 *   tipo 'bandera' → se lee desde ctx.bloques.* pero NO es un bloque
 *
 * Las 6 banderas son deuda estructural heredada: viven en el mismo namespace
 * que los bloques, ramifican texto, y no aparecían en ningún catálogo.
 * Documentarlas aquí es el primer paso; moverlas a `campos` sería el segundo.
 */
export const INTERRUPTORES = {
  // ---- partes y precio ----
  adjudicacion_conyuge:     { tipo: 'bloque',  default: false },
  ad_corpus:                { tipo: 'bloque',  default: true  },
  as_is:                    { tipo: 'bandera', default: true  },
  precio_compuesto:         { tipo: 'bandera', default: false },
  mobiliario_separado:      { tipo: 'bandera', default: false },
  pacto_no_incluir_muebles: { tipo: 'bandera', default: false },

  // ---- dinero ----
  escrow:                   { tipo: 'bloque',  default: true  },
  holdback_escrow:          { tipo: 'bloque',  default: false },
  financiamiento:           { tipo: 'bloque',  default: false },
  comision:                 { tipo: 'bloque',  default: true  },

  // ---- inmueble / título ----
  doc_fideicomiso:          { tipo: 'bloque',  default: true  },
  opcion_fideicomiso:       { tipo: 'bandera', default: false },
  gravamen_por_cancelar:    { tipo: 'bloque',  default: false },
  zona_federal:             { tipo: 'bloque',  default: false },

  // ---- condiciones indispensables ----
  inspeccion:               { tipo: 'bloque',  default: true  },
  inventario:               { tipo: 'bloque',  default: false },
  arrendamientos:           { tipo: 'bloque',  default: false },
  litigios_pendientes:      { tipo: 'bloque',  default: false },
  empleados_condicion:      { tipo: 'bloque',  default: false },
  condicion_libre:          { tipo: 'bloque',  default: false },
  condiciones_remocion:     { tipo: 'bandera', default: false },

  // ---- obligaciones del vendedor ----
  obligaciones_vendedor:      { tipo: 'bloque',  default: true  },
  obligaciones_vendedor_agua: { tipo: 'bandera', default: false },
  derecho_deduccion:          { tipo: 'bloque',  default: true  },
  auditoria_hacienda:         { tipo: 'bloque',  default: false },
  factura_complementaria:     { tipo: 'bloque',  default: false },

  // ---- misceláneos de cierre ----
  condicion_uso:            { tipo: 'bloque',  default: true  },
  rescision_pleno_derecho:  { tipo: 'bloque',  default: false },
  fuerza_mayor:             { tipo: 'bloque',  default: true  },
  disclosure:               { tipo: 'bloque',  default: false },
  divulgacion_agencia:      { tipo: 'bloque',  default: false },
  renuncia_nulidad:         { tipo: 'bloque',  default: false },
  contrato_totalidad:       { tipo: 'bloque',  default: false },
  aviso_fraude:             { tipo: 'bloque',  default: false },
  docusign_disclaimer:      { tipo: 'bloque',  default: false },
  clausula_adicional:       { tipo: 'bloque',  default: false },
  documentos_integrales:    { tipo: 'bloque',  default: true  },
  proteccion_datos:         { tipo: 'bloque',  default: false },
  confidencialidad:         { tipo: 'bloque',  default: false },
  duplicados:               { tipo: 'bloque',  default: true  },
};

/**
 * RELACIONES — qué combinaciones son ilegales y por qué.
 *
 *   requiere         → si A está encendido, B debe estarlo (A sin B es incoherente)
 *   incompatible_con → A y B no pueden coexistir (el documento se contradiría)
 *
 * El campo `porque` NO es decorativo: es lo que permite que Agy o CX discutan la
 * regla sin releer el motor. Una relación sin motivo escrito es una relación que
 * nadie va a poder cuestionar después.
 */
export const RELACIONES = [
  {
    interruptor: 'as_is', requiere: ['ad_corpus'],
    porque: 'El AS-IS es el segundo párrafo del bloque ad_corpus; sin el bloque no hay dónde emitirlo.',
  },
  {
    interruptor: 'holdback_escrow', requiere: ['escrow'],
    porque: 'La retención se practica SOBRE la cuenta escrow. Sin escrow no hay de dónde retener.',
  },
  {
    interruptor: 'condiciones_remocion', requiere: ['inspeccion'],
    porque: 'La remoción por escrito opera sobre las condiciones indispensables; sin al menos una condición viva el párrafo queda huérfano.',
  },
  {
    interruptor: 'mobiliario_separado', requiere: ['precio_compuesto'],
    porque: 'Separar el mobiliario sólo tiene sentido si el precio se descompone en §4. Encendido a solas, el documento dice "equipos fijos" sin haber separado nada.',
  },
  {
    interruptor: 'pacto_no_incluir_muebles', requiere: ['precio_compuesto'],
    porque: 'El pacto se refiere al valor de los muebles, que sólo existe con precio compuesto.',
  },
  {
    interruptor: 'opcion_fideicomiso', requiere: ['doc_fideicomiso'],
    porque: 'Ofrecer la opción de asumir el fideicomiso existente presupone que hay fideicomiso en el título.',
  },
  {
    interruptor: 'precio_compuesto', incompatible_con: ['ad_corpus'],
    porque: 'AD CORPUS pacta un precio único por el inmueble como unidad; el precio compuesto lo descompone. Afirmar ambos se contradice dentro del mismo documento.',
  },
  {
    interruptor: 'mobiliario_separado', incompatible_con: ['inventario'],
    porque: 'El bloque inventario declara que los bienes se transmiten "sin contraprestación separada, formando parte del precio único ad corpus". Con mobiliario separado eso es falso: sí hay contraprestación separada.',
  },
];

/**
 * LECTURAS — qué interruptores consulta el render() de cada bloque.
 *
 * Se verifica contra el código fuente en cada corrida de QA. Si alguien agrega
 * un `ctx.bloques.X` dentro de un render y no lo declara aquí, el test falla.
 * Es lo que impide que el grafo se vuelva documentación muerta.
 */
export const LECTURAS = {
  ad_corpus:             ['as_is'],
  cl_precio:             ['precio_compuesto', 'mobiliario_separado', 'pacto_no_incluir_muebles', 'opcion_fideicomiso'],
  cl_saldo:              ['escrow'],
  cl_gastos:             ['escrow'],
  cl_documentacion:      ['doc_fideicomiso'],
  obligaciones_vendedor: ['mobiliario_separado', 'obligaciones_vendedor_agua'],
  condicion_uso:         ['mobiliario_separado'],
  cl_condiciones:        ['inspeccion', 'doc_fideicomiso', 'financiamiento', 'inventario', 'arrendamientos',
                          'zona_federal', 'litigios_pendientes', 'empleados_condicion', 'condicion_libre',
                          'condiciones_remocion'],
  cl_penalidad:          ['escrow'],
};

/** Toda combinación que viole RELACIONES es ilegal: no debe generarse ni probarse. */
export function esLegal(estado) {
  for (const r of RELACIONES) {
    if (!estado[r.interruptor]) continue;
    for (const dep of r.requiere || []) if (!estado[dep]) return false;
    for (const inc of r.incompatible_con || []) if (estado[inc]) return false;
  }
  return true;
}

/** Explica por qué una combinación es ilegal (para QA y, más adelante, para la UI). */
export function motivosIlegalidad(estado) {
  const out = [];
  for (const r of RELACIONES) {
    if (!estado[r.interruptor]) continue;
    for (const dep of r.requiere || []) {
      if (!estado[dep]) out.push(`${r.interruptor} requiere ${dep} — ${r.porque}`);
    }
    for (const inc of r.incompatible_con || []) {
      if (estado[inc]) out.push(`${r.interruptor} incompatible con ${inc} — ${r.porque}`);
    }
  }
  return out;
}

export const IDS = Object.keys(INTERRUPTORES);
