/**
 * ContraOfertaGen — Ensamblador de Contexto
 * 
 * Toma los datos del formulario de contraoferta + la plantilla
 * y produce el contexto completo listo para renderizar.
 * 
 * Más ligero que el ensamblador de oferta — se enfoca en:
 *   - Referencia a oferta original
 *   - 7 modificaciones opcionales
 *   - Fechas/horas de vigencia
 * 
 * Sprint CA-1 — Abril 2026
 */

import {
  generarContextoParte,
  bloquePrecio,
  fechaEs,
  fechaEn,
  fechaFr,
} from '../core/index';

/**
 * Genera fecha en francés (formato largo).
 * Si fechaFr no está en core, usamos fallback.
 */
function fechaFrFallback(isoDate) {
  if (!isoDate) return '';
  const meses = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const d = new Date(isoDate + 'T12:00:00');
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Traduce hora de vigencia a los 3 idiomas.
 */
function traducirHora(horaEs) {
  const traducciones = {
    'medianoche': { es: 'medianoche', en: 'midnight', fr: 'minuit' },
    'mediodía': { es: 'mediodía', en: 'noon', fr: 'midi' },
    '17:00 horas': { es: '17:00 horas', en: '5:00 PM', fr: '17h00' },
    '18:00 horas': { es: '18:00 horas', en: '6:00 PM', fr: '18h00' },
  };
  return traducciones[horaEs] || { es: horaEs, en: horaEs, fr: horaEs };
}

/**
 * Calcula fecha/hora límite sumando horas a la fecha de contraoferta.
 */
function calcularLimite(fechaBase, horas) {
  if (!fechaBase) return null;
  const d = new Date(fechaBase + 'T12:00:00');
  d.setHours(d.getHours() + horas);
  return d;
}

/**
 * Ensambla el contexto completo para renderizar una contraoferta.
 * 
 * @param {Object} plantilla - PLANTILLA_CONTRAOFERTA
 * @param {Object} datos - Los datos crudos del formulario
 * @returns {Object} Contexto completo listo para pasar a los bloques
 */
export function ensamblarContextoContraoferta(plantilla, datos) {
  const ctx = {
    meta: plantilla.meta,
    bloques: {},
  };

  // ============================================================
  // 1. RESOLVER PARTES (concordancia lingüística)
  // ============================================================

  for (const parteDef of plantilla.partes) {
    const datoParte = datos.partes?.[parteDef.id];
    if (!datoParte) continue;

    const ctxParte = generarContextoParte({
      rol: parteDef.rol,
      personas: datoParte.personas,
      tipoPersona: datoParte.tipoPersona || 'fisica',
      razonSocial: datoParte.razonSocial,
      representante: datoParte.representante,
      domicilio: datoParte.domicilio || '',
      nacionalidad: datoParte.nacionalidad,
      usarSingularColectivo: true,
    });

    // Versiones FR (si el core las tiene, úsalas; si no, fallback)
    ctxParte.fr = ctxParte.fr || {
      referencia: ctxParte.en.referencia,
      referenciaConComillas: ctxParte.en.referenciaConComillas,
    };

    ctx[parteDef.id] = ctxParte;
  }

  // ============================================================
  // 2. RESOLVER BLOQUES CONDICIONALES
  // ============================================================

  for (const bloque of plantilla.bloques) {
    if (bloque.condicional) {
      const activo = datos.bloques?.[bloque.id] ?? bloque.default ?? false;
      ctx.bloques[bloque.id] = activo;
    }
  }

  // ============================================================
  // 3. RESOLVER OFERTA ORIGINAL
  // ============================================================

  const ofertaOrig = datos.campos?.oferta_original || {};
  const precioOrig = ofertaOrig.precio_original || 0;

  ctx.oferta_original = {
    fecha_es: fechaEs(ofertaOrig.fecha_oferta) || '[FECHA]',
    fecha_en: fechaEn(ofertaOrig.fecha_oferta) || '[DATE]',
    fecha_fr: (typeof fechaFr === 'function' ? fechaFr : fechaFrFallback)(ofertaOrig.fecha_oferta) || '[DATE]',
    descripcion_inmueble: ofertaOrig.descripcion_inmueble || '[INMUEBLE]',
    precio_completo: bloquePrecio(precioOrig, 'USD').completo,
  };

  // ============================================================
  // 4. RESOLVER MODIFICACIONES
  // ============================================================

  const mods = datos.campos?.modificaciones || {};
  const nuevoPrecio = mods.nuevo_precio || 0;
  const nuevoDeposito = mods.nuevo_deposito || 0;
  const horaVig = traducirHora(mods.nueva_hora_vigencia || 'medianoche');

  ctx.modificaciones = {
    // Precio
    nuevo_precio_completo: nuevoPrecio > 0 ? bloquePrecio(nuevoPrecio, 'USD').completo : '',
    
    // Fecha de formalización
    nueva_fecha_formalizacion_es: fechaEs(mods.nueva_fecha_formalizacion) || '',
    nueva_fecha_formalizacion_en: fechaEn(mods.nueva_fecha_formalizacion) || '',
    nueva_fecha_formalizacion_fr: (typeof fechaFr === 'function' ? fechaFr : fechaFrFallback)(mods.nueva_fecha_formalizacion) || '',
    
    // Notario
    nuevo_notario_nombre: mods.nuevo_notario_nombre || '',
    nuevo_notario_numero: mods.nuevo_notario_numero || '',
    nuevo_notario_ciudad: mods.nuevo_notario_ciudad || '',
    
    // Coordinador
    nuevo_coordinador_nombre: mods.nuevo_coordinador_nombre || '',
    nuevo_coordinador_empresa: mods.nuevo_coordinador_empresa || '',
    
    // Vigencia
    nueva_fecha_vigencia_es: fechaEs(mods.nueva_fecha_vigencia) || '',
    nueva_fecha_vigencia_en: fechaEn(mods.nueva_fecha_vigencia) || '',
    nueva_fecha_vigencia_fr: (typeof fechaFr === 'function' ? fechaFr : fechaFrFallback)(mods.nueva_fecha_vigencia) || '',
    nueva_hora_vigencia: horaVig.es,
    nueva_hora_vigencia_en: horaVig.en,
    nueva_hora_vigencia_fr: horaVig.fr,
    
    // Depósito
    nuevo_deposito_completo: nuevoDeposito > 0 ? bloquePrecio(nuevoDeposito, 'USD').completo : '',
    
    // Cláusula libre
    clausula_libre_es: mods.clausula_libre_es || '',
    clausula_libre_en: mods.clausula_libre_en || '',
    clausula_libre_fr: mods.clausula_libre_fr || '',
  };

  // ============================================================
  // 5. RESOLVER ACEPTACIÓN Y VIGENCIA
  // ============================================================

  const acep = datos.campos?.aceptacion || {};
  const vigenciaHoras = acep.vigencia_horas || 48;
  const fechaLimite = calcularLimite(acep.fecha_contraoferta, vigenciaHoras);

  ctx.aceptacion = {
    fecha_contraoferta_es: fechaEs(acep.fecha_contraoferta) || '[FECHA]',
    fecha_contraoferta_en: fechaEn(acep.fecha_contraoferta) || '[DATE]',
    fecha_contraoferta_fr: (typeof fechaFr === 'function' ? fechaFr : fechaFrFallback)(acep.fecha_contraoferta) || '[DATE]',
    ciudad_contraoferta: acep.ciudad_contraoferta || 'Bucerías, Nayarit',
    vigencia_horas: vigenciaHoras,
    fecha_limite_es: fechaLimite ? fechaEs(fechaLimite.toISOString().split('T')[0]) : '',
    fecha_limite_en: fechaLimite ? fechaEn(fechaLimite.toISOString().split('T')[0]) : '',
    fecha_limite_fr: fechaLimite ? (typeof fechaFr === 'function' ? fechaFr : fechaFrFallback)(fechaLimite.toISOString().split('T')[0]) : '',
    hora_limite_es: fechaLimite ? `${fechaLimite.getHours()}:${String(fechaLimite.getMinutes()).padStart(2, '0')} horas` : '',
    hora_limite_en: fechaLimite ? fechaLimite.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
    hora_limite_fr: fechaLimite ? `${fechaLimite.getHours()}h${String(fechaLimite.getMinutes()).padStart(2, '0')}` : '',
  };

  // ============================================================
  // 6. QUIÉN PRESENTA LA CONTRAOFERTA
  // ============================================================

  // Por default el vendedor presenta la contraoferta
  // (puede ser configurable en UI)
  ctx.quien_presenta = datos.quien_presenta || 'vendedor';

  return ctx;
}

/**
 * Renderiza todos los bloques activos de la contraoferta.
 * 
 * @param {Object} plantilla - PLANTILLA_CONTRAOFERTA
 * @param {Object} ctx - Contexto ensamblado
 * @returns {Array} Bloques renderizados [{ id, es, en, fr, tipo, firmas }]
 */
export function renderizarBloquesContraoferta(plantilla, ctx) {
  const resultado = [];
  
  // Numerar cláusulas dinámicamente según cuántas modificaciones están activas
  let numeroClausula = 0;
  const ordinalesEs = ['', 'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SÉPTIMA', 'OCTAVA', 'NOVENA', 'DÉCIMA'];
  const ordinalesEn = ['', 'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH'];
  const ordinalesFr = ['', 'PREMIÈRE', 'DEUXIÈME', 'TROISIÈME', 'QUATRIÈME', 'CINQUIÈME', 'SIXIÈME', 'SEPTIÈME', 'HUITIÈME', 'NEUVIÈME', 'DIXIÈME'];

  for (const bloque of plantilla.bloques) {
    // Verificar si el bloque está activo
    if (bloque.condicional && !ctx.bloques[bloque.id]) {
      continue;
    }

    try {
      // Si es un bloque de modificación, incrementar contador
      if (bloque.id.startsWith('mod_')) {
        numeroClausula++;
        ctx._ordinal_es = ordinalesEs[numeroClausula] || `CLÁUSULA ${numeroClausula}`;
        ctx._ordinal_en = ordinalesEn[numeroClausula] || `CLAUSE ${numeroClausula}`;
        ctx._ordinal_fr = ordinalesFr[numeroClausula] || `CLAUSE ${numeroClausula}`;
      }

      const contenido = bloque.render(ctx);

      // Si es modificación, reemplazar ordinal hardcodeado por el dinámico
      let esText = contenido.es || '';
      let enText = contenido.en || '';
      let frText = contenido.fr || '';

      if (bloque.id.startsWith('mod_')) {
        // Reemplazar ordinales hardcodeados
        esText = esText.replace(/\*\*(PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|SÉPTIMA)\./, `**${ctx._ordinal_es}.`);
        enText = enText.replace(/\*\*(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH)\./, `**${ctx._ordinal_en}.`);
        frText = frText.replace(/\*\*(PREMIÈRE|DEUXIÈME|TROISIÈME|QUATRIÈME|CINQUIÈME|SIXIÈME|SEPTIÈME)\./, `**${ctx._ordinal_fr}.`);
      }

      resultado.push({
        id: bloque.id,
        tipo: bloque.tipo || 'clausula',
        es: esText,
        en: enText,
        fr: frText,
        firmas: contenido.firmas || null,
      });

    } catch (err) {
      console.error(`Error renderizando bloque "${bloque.id}":`, err.message);
      resultado.push({
        id: bloque.id,
        tipo: 'error',
        es: `[ERROR: ${err.message}]`,
        en: `[ERROR: ${err.message}]`,
        fr: `[ERREUR: ${err.message}]`,
      });
    }
  }

  return resultado;
}

export default {
  ensamblarContextoContraoferta,
  renderizarBloquesContraoferta,
};
