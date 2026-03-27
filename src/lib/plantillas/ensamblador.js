/**
 * OfertaGen — Ensamblador de Contexto
 * 
 * Toma los datos crudos del formulario + la plantilla
 * y produce el contexto completo listo para renderizar.
 * 
 * Este módulo es el pegamento entre:
 *   - Motor core (concordancia, num2words, fechas)
 *   - Plantilla (bloques, campos)
 *   - Datos del usuario (formulario)
 */

import {
  generarContextoParte,
  bloquePrecio,
  montoALetras,
  montoFormateado,
  fechaEs,
  fechaEn,
  fechaBilingue,
  plazo,
  vencimiento,
} from '../core/index';

/**
 * Números pequeños a letras (para días de plazos).
 */
function diasALetras(n) {
  const tabla = {
    1: 'un', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco',
    6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
    15: 'quince', 20: 'veinte', 30: 'treinta',
  };
  return tabla[n] || String(n);
}

function diasALetrasEn(n) {
  const tabla = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
    15: 'fifteen', 20: 'twenty', 30: 'thirty',
  };
  return tabla[n] || String(n);
}

/**
 * Ensambla el contexto completo para renderizar un contrato.
 * 
 * @param {Object} plantilla - La plantilla del contrato (ej: PLANTILLA_OFERTA_COMPRA)
 * @param {Object} datos - Los datos crudos del formulario
 * @returns {Object} Contexto completo listo para pasar a los bloques
 */
export function ensamblarContexto(plantilla, datos) {
  const ctx = {
    meta: plantilla.meta,
    bloques: {}, // Estado activo/inactivo de bloques condicionales
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

    // Agregar campos extra de la parte
    ctxParte.celular = datoParte.celular || '';
    ctxParte.email = datoParte.email || '';
    ctxParte.nacionalidad_en = datoParte.nacionalidad_en || datoParte.nacionalidad || '';

    // Versiones con negrita (para el renderizador DOCX/HTML)
    ctxParte.referencia_negrita = ctxParte.referencia; // El renderizador aplicará el formato
    ctxParte.referenciaConComillas_negrita = ctxParte.referenciaConComillas;
    ctxParte.en.referencia_negrita = ctxParte.en.referencia;
    ctxParte.en.referenciaConComillas_negrita = ctxParte.en.referenciaConComillas;

    // Comparecencia en inglés (simplificada)
    ctxParte.comparecencia_en = buildComparecenciaEn(ctxParte, datoParte);
    ctxParte.quien_en = 'who';

    ctx[parteDef.id] = ctxParte;
  }

  // ============================================================
  // 2. RESOLVER BLOQUES CONDICIONALES
  // ============================================================

  for (const bloque of plantilla.bloques) {
    if (bloque.condicional) {
      // Checa si el usuario lo activó, o usa el default
      const activo = datos.bloques?.[bloque.id] ?? bloque.default ?? false;
      ctx.bloques[bloque.id] = activo;
    }
  }

  // ============================================================
  // 3. RESOLVER PRECIO Y MONTOS
  // ============================================================

  const moneda = datos.campos?.precio?.moneda || 'USD';
  const precioTotal = datos.campos?.precio?.precio_total || 0;
  const depositoEscrow = datos.campos?.precio?.deposito_escrow || 0;
  const saldo = precioTotal - depositoEscrow;
  const diasDeposito = datos.campos?.precio?.dias_deposito || 3;

  ctx.precio = {
    ...bloquePrecio(precioTotal, moneda),
    plazo_deposito_es: plazo(diasDeposito, 'habiles').esFrase,
    plazo_deposito_en: plazo(diasDeposito, 'habiles').enFrase,
  };

  ctx.deposito = bloquePrecio(depositoEscrow, moneda);
  ctx.saldo = bloquePrecio(saldo, moneda);

  // ============================================================
  // 4. RESOLVER PENALIDAD
  // ============================================================

  const porcentajePenalidad = datos.campos?.penalidad?.porcentaje_penalidad || '10%';
  const montoPenalidad = datos.campos?.penalidad?.monto_penalidad || (precioTotal * 0.10);

  ctx.penalidad = {
    porcentaje_penalidad: porcentajePenalidad,
    ...bloquePrecio(montoPenalidad, moneda),
  };

  // ============================================================
  // 5. RESOLVER FECHAS
  // ============================================================

  const fechasDatos = datos.campos?.fechas || {};

  ctx.fechas = {
    fecha_presentacion_es: fechasDatos.fecha_presentacion ? fechaEs(fechasDatos.fecha_presentacion) : '',
    fecha_presentacion_en: fechasDatos.fecha_presentacion ? fechaEn(fechasDatos.fecha_presentacion) : '',
    ciudad_presentacion: fechasDatos.ciudad_presentacion || '',
    fecha_formalizacion: fechasDatos.fecha_formalizacion || '',
    fecha_formalizacion_en: fechasDatos.fecha_formalizacion_en || fechasDatos.fecha_formalizacion || '',
    fecha_extension: fechasDatos.fecha_extension || '',
    fecha_extension_en: fechasDatos.fecha_extension_en || fechasDatos.fecha_extension || '',
    vencimiento_es: '',
    vencimiento_en: '',
  };

  if (fechasDatos.fecha_vigencia) {
    const venc = vencimiento(
      fechasDatos.fecha_vigencia,
      'medianoche',
      fechasDatos.ciudad_presentacion || 'Bucerias, Nayarit'
    );
    ctx.fechas.vencimiento_es = venc.es;
    ctx.fechas.vencimiento_en = venc.en;
  }

  // ============================================================
  // 6. RESOLVER INMUEBLE Y ANTECEDENTE
  // ============================================================

  ctx.inmueble = datos.campos?.inmueble || {};
  ctx.antecedente = datos.campos?.antecedente || {};

  // Agregar fechas formateadas al antecedente
  if (ctx.antecedente.fecha_escritura) {
    const fb = fechaBilingue(ctx.antecedente.fecha_escritura);
    ctx.antecedente.fecha_escritura_es = fb.es;
    ctx.antecedente.fecha_escritura_en = fb.en;
  }

  // ============================================================
  // 7. RESOLVER NOTARIO, ESCROW, COMISIÓN, JURISDICCIÓN, INSPECCIÓN
  // ============================================================

  ctx.notario = datos.campos?.notario || {};
  ctx.escrow = datos.campos?.escrow || {};
  ctx.comision = datos.campos?.comision || {};
  ctx.jurisdiccion = datos.campos?.jurisdiccion || {};
  ctx.coordinador = datos.campos?.coordinador || {};

  // Inspección con letras
  const insData = datos.campos?.inspeccion || {};
  ctx.inspeccion = {
    ...insData,
    dias_inspeccion: insData.dias_inspeccion || 4,
    dias_revision: insData.dias_revision || 5,
    dias_inspeccion_letras: diasALetras(insData.dias_inspeccion || 4),
    dias_revision_letras: diasALetras(insData.dias_revision || 5),
    dias_inspeccion_letras_en: diasALetrasEn(insData.dias_inspeccion || 4),
    dias_revision_letras_en: diasALetrasEn(insData.dias_revision || 5),
  };

  // Comisión con letras
  if (ctx.comision.porcentaje_total) {
    const pctNum = parseInt(ctx.comision.porcentaje_total);
    const pctLetras = { 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho' };
    ctx.comision.porcentaje_total_letras = `${pctLetras[pctNum] || pctNum} por ciento`;
    ctx.comision.porcentaje_total_letras_en = `${diasALetrasEn(pctNum) || pctNum} percent`;
  }

  return ctx;
}

/**
 * Renderiza todos los bloques activos de la plantilla.
 * 
 * @param {Object} plantilla
 * @param {Object} ctx - Contexto ensamblado
 * @returns {Array} Bloques renderizados [{ id, numero, titulo, es, en, tipo }]
 */
export function renderizarBloques(plantilla, ctx) {
  const resultado = [];

  for (const bloque of plantilla.bloques) {
    // Verificar si el bloque está activo
    if (bloque.condicional && !ctx.bloques[bloque.id]) {
      continue; // Bloque desactivado, lo saltamos limpiamente
    }

    try {
      const contenido = bloque.render(ctx);

      resultado.push({
        id: bloque.id,
        numero: bloque.numero || null,
        sub_clausula: bloque.sub_clausula || null,
        titulo: bloque.tituloFn
          ? { es: contenido.titulo_es || '', en: contenido.titulo_en || '' }
          : (bloque.titulo || null),
        tipo: bloque.tipo || 'clausula',
        es: contenido.es || '',
        en: contenido.en || '',
        firmas: contenido.firmas || null,
      });
    } catch (err) {
      console.error(`Error renderizando bloque "${bloque.id}":`, err.message);
      resultado.push({
        id: bloque.id,
        numero: bloque.numero || null,
        titulo: bloque.titulo || null,
        tipo: 'error',
        es: `[ERROR: ${err.message}]`,
        en: `[ERROR: ${err.message}]`,
      });
    }
  }

  return resultado;
}

/**
 * Genera comparecencia en inglés.
 */
function buildComparecenciaEn(ctxParte, datoParte) {
  if (ctxParte.tipoPersona === 'moral') {
    return `${ctxParte.nombres}, represented in this act by ${datoParte.representante?.nombre || '[REPRESENTATIVE]'}, who certifies their legal capacity by means of the corresponding notarial instrument`;
  }

  const verbHas = ctxParte.clave === 'mp' || ctxParte.clave === 'fp' ? 'have' : 'has';
  const verbStates = ctxParte.clave === 'mp' || ctxParte.clave === 'fp' ? 'state' : 'states';

  return `${ctxParte.nombres}, who ${verbStates} that ${ctxParte.clave === 'ms' ? 'he' : ctxParte.clave === 'fs' ? 'she' : 'they'} ${verbHas} the legal and economic capacity that are necessary to enter into the present contract and, whom hereinafter will be solely referred to as ${ctxParte.en.referenciaConComillas}`;
}
