/**
 * ConvenioGen — Ensamblador de contexto
 *
 * Toma los datos del formulario y produce el contexto para la plantilla del
 * Convenio Privado de Enajenación de Bienes Muebles.
 *
 * Particularidad frente al ensamblador de la oferta: las cláusulas se numeran
 * con ORDINALES EN LETRA (PRIMERA, SEGUNDA…) y esa numeración depende de qué
 * bloques estén activos, así que se calcula al renderizar, no en la plantilla.
 */

import {
  generarContextoParte,
  bloquePrecio,
  fechaEs,
  fechaEn,
} from '../core/index.js';

export const PENDIENTE_MARK = '⟦Pendiente⟧';

const ORDINALES_ES = [
  'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SÉPTIMA',
  'OCTAVA', 'NOVENA', 'DÉCIMA', 'DÉCIMA PRIMERA', 'DÉCIMA SEGUNDA',
  'DÉCIMA TERCERA', 'DÉCIMA CUARTA', 'DÉCIMA QUINTA',
];

const ORDINALES_EN = [
  'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH',
  'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELFTH',
  'THIRTEENTH', 'FOURTEENTH', 'FIFTEENTH',
];

function diasALetras(n) {
  const t = { 1:'un', 2:'dos', 3:'tres', 4:'cuatro', 5:'cinco', 6:'seis', 7:'siete',
              8:'ocho', 9:'nueve', 10:'diez', 15:'quince', 20:'veinte', 30:'treinta' };
  return t[n] || String(n);
}
function diasALetrasEn(n) {
  const t = { 1:'one', 2:'two', 3:'three', 4:'four', 5:'five', 6:'six', 7:'seven',
              8:'eight', 9:'nine', 10:'ten', 15:'fifteen', 20:'twenty', 30:'thirty' };
  return t[n] || String(n);
}

/**
 * Ensambla el contexto del convenio.
 *
 * @param {Object} plantilla
 * @param {Object} datos - { partes, bloques, campos }
 */
export function ensamblarContextoConvenio(plantilla, datos) {
  const ctx = { meta: plantilla.meta, bloques: {} };

  // ---- 1. PARTES ----
  for (const parteDef of plantilla.partes) {
    const dp = datos.partes?.[parteDef.id];
    if (!dp) continue;

    const ctxParte = generarContextoParte({
      rol: parteDef.rol,
      personas: dp.personas,
      tipoPersona: dp.tipoPersona || 'fisica',
      razonSocial: dp.razonSocial,
      representante: dp.representante,
      domicilio: dp.domicilio || '',
      nacionalidad: dp.nacionalidad,
      usarSingularColectivo: true,
    });

    ctxParte.referencia_negrita = ctxParte.referencia;
    ctxParte.referenciaConComillas_negrita = ctxParte.referenciaConComillas;
    ctxParte.en.referencia_negrita = ctxParte.en.referencia;

    // Comparecencia en inglés (simplificada, sin flexión).
    const nombresEn = (dp.personas || []).map(p => p.nombre).filter(Boolean).join(' and ') || '[NOMBRE]';
    const nacEn = dp.nacionalidad_en || dp.nacionalidad || '';
    ctxParte.comparecencia_en = nacEn
      ? `${nombresEn}, of ${nacEn} nationality`
      : nombresEn;

    ctx[parteDef.id] = ctxParte;
  }

  // ---- 2. BLOQUES CONDICIONALES ----
  for (const b of plantilla.bloques) {
    if (b.condicional) {
      ctx.bloques[b.id] = datos.bloques?.[b.id] ?? b.default ?? false;
    }
  }
  // Flag de UI: si hay vehículo, se activan el anexo B y su cláusula.
  ctx.bloques.vehiculo = datos.bloques?.vehiculo ?? false;
  ctx.bloques.cl_vehiculo = ctx.bloques.vehiculo;

  // ---- 3. PRECIOS ----
  const moneda = datos.campos?.precio?.moneda || 'USD';
  const pMuebles = Number(datos.campos?.precio?.precio_muebles) || 0;
  const pVehiculo = ctx.bloques.vehiculo ? (Number(datos.campos?.precio?.precio_vehiculo) || 0) : 0;
  const total = pMuebles + pVehiculo;
  const deposito = Number(datos.campos?.precio?.deposito) || 0;

  ctx.precio = {
    moneda,
    total: bloquePrecio(total, moneda),
    muebles: pMuebles ? bloquePrecio(pMuebles, moneda) : null,
    vehiculo: pVehiculo ? bloquePrecio(pVehiculo, moneda) : null,
    deposito: deposito ? bloquePrecio(deposito, moneda) : null,
    saldo: bloquePrecio(Math.max(total - deposito, 0), moneda),
  };

  // Pena convencional: porcentaje sobre el total del convenio.
  const pctPenal = parseFloat(String(datos.campos?.penalidad?.porcentaje || '10').replace('%', '')) || 10;
  ctx.penalidad = bloquePrecio(Math.round(total * pctPenal / 100), moneda);
  ctx.penalidad.porcentaje = `${pctPenal}%`;

  // ---- 4. IVA ----
  ctx.iva = {
    incluido: datos.campos?.iva?.incluido !== false,
    tasa: datos.campos?.iva?.tasa || '16%',
  };

  // ---- 5. PLAZOS ----
  const dDep = Number(datos.campos?.plazos?.dias_deposito) || 5;
  const dSal = Number(datos.campos?.plazos?.dias_saldo) || 5;
  ctx.plazos = {
    deposito: dDep, deposito_letras: diasALetras(dDep), deposito_letras_en: diasALetrasEn(dDep),
    saldo: dSal, saldo_letras: diasALetras(dSal), saldo_letras_en: diasALetrasEn(dSal),
  };

  // ---- 6. INMUEBLE (sólo para ubicar los muebles) ----
  const ident = (datos.campos?.inmueble?.identificacion || '').trim();
  ctx.inmueble = {
    identificacion: ident || PENDIENTE_MARK,
    identificacion_en: (datos.campos?.inmueble?.identificacion_en || '').trim() || ident || PENDIENTE_MARK,
  };

  // ---- 7. ESCROW, LUGAR, JURISDICCIÓN ----
  ctx.escrow = { empresa: (datos.campos?.escrow?.empresa_escrow || '').trim() || PENDIENTE_MARK };

  const f = datos.campos?.fechas?.fecha_firma;
  ctx.lugar = {
    ciudad: (datos.campos?.fechas?.ciudad || '').trim() || PENDIENTE_MARK,
    fecha_es: (f && fechaEs(f)) || PENDIENTE_MARK,
    fecha_en: (f && fechaEn(f)) || PENDIENTE_MARK,
  };

  ctx.jurisdiccion = {
    ciudad: (datos.campos?.jurisdiccion?.ciudad || datos.campos?.fechas?.ciudad || '').trim() || PENDIENTE_MARK,
  };

  return ctx;
}

/**
 * Renderiza los bloques activos, numerando las cláusulas con ordinales.
 */
export function renderizarBloquesConvenio(plantilla, ctx) {
  const out = [];
  let ordinal = 0;

  for (const bloque of plantilla.bloques) {
    if (bloque.condicional && !ctx.bloques[bloque.id]) continue;
    // La cláusula del vehículo sólo aplica si hay vehículo.
    if (bloque.requiere && !ctx.bloques[bloque.requiere]) continue;

    let contenido;
    try {
      contenido = bloque.render(ctx);
    } catch (e) {
      contenido = { es: `[error en bloque ${bloque.id}: ${e.message}]`, en: '' };
    }

    let tituloEs = contenido.titulo_es || bloque.titulo?.es || '';
    let tituloEn = contenido.titulo_en || bloque.titulo?.en || '';

    // Numeración ordinal dinámica: depende de qué bloques quedaron activos.
    if (bloque.ordinal) {
      const oEs = ORDINALES_ES[ordinal] || `CLÁUSULA ${ordinal + 1}`;
      const oEn = ORDINALES_EN[ordinal] || `CLAUSE ${ordinal + 1}`;
      tituloEs = `${oEs}. ${tituloEs}`;
      tituloEn = `${oEn}. ${tituloEn}`;
      ordinal++;
    }

    out.push({
      id: bloque.id,
      tipo: bloque.tipo || 'texto',
      titulo: (tituloEs || tituloEn) ? { es: tituloEs, en: tituloEn } : null,
      etiqueta: bloque.etiqueta || bloque.id,
      es: contenido.es || '',
      en: contenido.en || '',
      firmas: contenido.firmas,
      aceptacion: contenido.aceptacion,
    });
  }

  return out;
}
