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
  superficieALetrasEn,
} from '../core/index';

import { obtenerTraduccionFr, obtenerTituloFr } from './traducciones_fr';

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

function diasALetrasFr(n) {
  const tabla = {
    1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq',
    6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix',
    15: 'quinze', 20: 'vingt', 30: 'trente',
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
    distribuir_agencia: datos.campos?.penalidad?.distribuir_agencia || false,
    pct_parte_afectada: datos.campos?.penalidad?.pct_parte_afectada || '60%',
    pct_agencia: datos.campos?.penalidad?.pct_agencia || '40%',
    ...bloquePrecio(montoPenalidad, moneda),
  };

  // Testigos y aceptación
  ctx.testigos = datos.campos?.testigos || { incluir_testigos: false, incluir_aceptacion: true };

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
    const horaVig = fechasDatos.hora_vigencia || 'medianoche';
    const horasEn = {
      'medianoche': 'midnight',
      'mediodía': 'noon',
    };
    const horaEn = horasEn[horaVig] || horaVig.replace('horas', 'hours');
    const venc = vencimiento(
      fechasDatos.fecha_vigencia,
      horaVig,
      fechasDatos.ciudad_presentacion || 'Bucerias, Nayarit'
    );
    ctx.fechas.vencimiento_es = venc.es;
    ctx.fechas.vencimiento_en = venc.en;
  }

  // Días para saldo y anticipo de gastos
  const diasSaldo = datos.campos?.precio?.dias_saldo || 5;
  ctx.precio.dias_saldo = diasSaldo;
  ctx.precio.dias_saldo_letras = diasALetras(diasSaldo);
  ctx.precio.dias_saldo_letras_en = diasALetrasEn(diasSaldo);

  const anticipoGastos = parseInt(datos.campos?.precio?.anticipo_gastos) || 0;
  ctx.precio.anticipo_gastos = anticipoGastos;
  if (anticipoGastos > 0) {
    ctx.precio.anticipo_completo = bloquePrecio(anticipoGastos, moneda);
  }

  // Honorarios escrow
  ctx.escrow = datos.campos?.escrow || {};
  const honEscrow = datos.campos?.escrow?.honorarios_escrow || 750;
  ctx.escrow.honorarios_escrow = honEscrow;
  if (honEscrow > 0) {
    ctx.escrow.honorarios_completo = bloquePrecio(honEscrow, moneda);
  }

  // ============================================================
  // 6. RESOLVER INMUEBLE Y ANTECEDENTE
  // ============================================================

  ctx.inmueble = datos.campos?.inmueble || {};
  
  // Generar superficie en letras en inglés automáticamente
  if (ctx.inmueble.superficie_m2) {
    ctx.inmueble.superficie_letras_en = superficieALetrasEn(parseFloat(ctx.inmueble.superficie_m2));
  }
  
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

  // Notario: resolver desde catálogo o manual
  const notarioRaw = datos.campos?.notario || {};
  const catalogo = plantilla.campos?.notario?.catalogo || [];
  const seleccion = notarioRaw.notario_seleccion || '';
  const notarioCat = catalogo.find(n => n.id === seleccion);

  if (notarioCat && seleccion !== 'otro') {
    ctx.notario = {
      nombre_notario: notarioCat.nombre,
      numero_notaria: notarioCat.numero,
      ciudad_notaria: notarioCat.ciudad,
    };
  } else {
    ctx.notario = {
      nombre_notario: notarioRaw.nombre_notario || '',
      numero_notaria: notarioRaw.numero_notaria || '',
      ciudad_notaria: notarioRaw.ciudad_notaria || '',
    };
  }

  ctx.escrow = { ...ctx.escrow, ...(datos.campos?.escrow || {}) };
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

  // Financiamiento
  const finData = datos.campos?.financiamiento || {};
  ctx.financiamiento = {
    ...finData,
    dias_due_diligence: finData.dias_due_diligence || 30,
    dias_due_diligence_letras: diasALetras(finData.dias_due_diligence || 30),
    dias_due_diligence_letras_en: diasALetrasEn(finData.dias_due_diligence || 30),
  };

  // Inventario
  ctx.inventario = datos.campos?.inventario || {};

  // Arrendamientos
  ctx.arrendamientos = datos.campos?.arrendamientos || {};

  // Confidencialidad
  ctx.confidencialidad = datos.campos?.confidencialidad || { meses: 6 };

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
 * @returns {Array} Bloques renderizados [{ id, numero, titulo, es, en, fr, tipo }]
 */
export function renderizarBloques(plantilla, ctx) {
  const resultado = [];
  
  // Contador de incisos para sub-cláusulas (A, B, C, D...)
  let incisoCounter = 0;
  const incisos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (const bloque of plantilla.bloques) {
    // Verificar si el bloque está activo
    if (bloque.condicional && !ctx.bloques[bloque.id]) {
      continue; // Bloque desactivado, lo saltamos limpiamente
    }

    try {
      // Si el bloque tiene sub_clausula, calcular el inciso dinámico
      if (bloque.sub_clausula || bloque.despues_de === 'cl_condiciones' || 
          (bloque.despues_de && ['inspeccion', 'doc_fideicomiso', 'financiamiento', 'inventario', 'arrendamientos', 'zona_federal', 'litigios_pendientes'].includes(bloque.despues_de))) {
        ctx._inciso = incisos[incisoCounter];
        incisoCounter++;
      } else if (bloque.id === 'cl_condiciones') {
        // Reset del contador al entrar a cláusula 15
        incisoCounter = 0;
        ctx._inciso = null;
      } else {
        ctx._inciso = null;
      }
      
      const contenido = bloque.render(ctx);
      
      // Obtener traducción francesa (si existe)
      const textoFr = obtenerTraduccionFr(bloque.id, ctx) || contenido.en || '';
      const tituloFr = obtenerTituloFr(bloque.id, ctx);

      resultado.push({
        id: bloque.id,
        numero: bloque.numero || null,
        sub_clausula: bloque.sub_clausula || null,
        titulo: bloque.tituloFn
          ? { 
              es: contenido.titulo_es || '', 
              en: contenido.titulo_en || '',
              fr: tituloFr || contenido.titulo_en || '',
            }
          : (bloque.titulo 
              ? { 
                  es: bloque.titulo.es || '', 
                  en: bloque.titulo.en || '',
                  fr: tituloFr || bloque.titulo.en || '',
                }
              : null),
        subtitulo: bloque.subtitulo || null,
        tipo: bloque.tipo || 'clausula',
        es: contenido.es || '',
        en: contenido.en || '',
        fr: textoFr,
        firmas: contenido.firmas || null,
        testigos: contenido.testigos,
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
        fr: `[ERREUR: ${err.message}]`,
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
