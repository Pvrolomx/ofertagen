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

    // Para la parte vendedora, permitir título dinámico (propietario/fideicomisario_vendedor/vendedor)
    const rolEfectivo = parteDef.id === 'propietario' && datoParte.titulo_vendedor
      ? datoParte.titulo_vendedor
      : parteDef.rol;

    const ctxParte = generarContextoParte({
      rol: rolEfectivo,
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
    
    // Helper: ¿es mexicano? (para lógica de fideicomiso)
    const nacLower = (datoParte.nacionalidad || '').toLowerCase().trim();
    ctxParte.esMexicano = nacLower === 'mexicano' || nacLower === 'mexicana' || nacLower === 'mexican';

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
  // Resolver empresa manual si aplica
  if (ctx.escrow.empresa_escrow === 'otro_escrow') {
    ctx.escrow.empresa_escrow = ctx.escrow.empresa_escrow_manual || 'EMPRESA ESCROW';
  }
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

  if (seleccion === 'por_designar') {
    ctx.notario = {
      nombre_notario: '',
      numero_notaria: '',
      ciudad_notaria: '',
      por_designar: true,
    };
  } else if (notarioCat && seleccion !== 'otro') {
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
  
  // Jurisdicción: manejar caso "otro"
  const jurisdiccionData = datos.campos?.jurisdiccion || {};
  ctx.jurisdiccion = {
    ...jurisdiccionData,
    ciudad_jurisdiccion: jurisdiccionData.ciudad_jurisdiccion === 'otro' 
      ? (jurisdiccionData.ciudad_jurisdiccion_custom || 'Bucerías, Nayarit, México')
      : (jurisdiccionData.ciudad_jurisdiccion || 'Bucerías, Nayarit, México'),
  };
  
  ctx.coordinador = datos.campos?.coordinador || {};

  // Plazos de condiciones indispensables
  const plazos = datos.campos?.condiciones_plazos || {};
  
  // Helper para tipo de días
  const tipoDias = (tipo) => ({
    es: tipo === 'habiles' ? 'hábiles' : 'naturales',
    en: tipo === 'habiles' ? 'business' : 'calendar',
    fr: tipo === 'habiles' ? 'ouvrables' : 'calendaires',
  });

  // Inspección con plazos configurables
  const insInspDias = plazos.inspeccion_inspeccionar_dias || 4;
  const insInspTipo = plazos.inspeccion_inspeccionar_tipo || 'naturales';
  const insRevDias = plazos.inspeccion_revisar_dias || 5;
  const insRevTipo = plazos.inspeccion_revisar_tipo || 'naturales';
  ctx.inspeccion = {
    dias_inspeccion: insInspDias,
    dias_revision: insRevDias,
    dias_inspeccion_letras: diasALetras(insInspDias),
    dias_revision_letras: diasALetras(insRevDias),
    dias_inspeccion_letras_en: diasALetrasEn(insInspDias),
    dias_revision_letras_en: diasALetrasEn(insRevDias),
    dias_inspeccion_letras_fr: diasALetrasFr(insInspDias),
    dias_revision_letras_fr: diasALetrasFr(insRevDias),
    tipo_inspeccion: tipoDias(insInspTipo),
    tipo_revision: tipoDias(insRevTipo),
  };

  // Doc fideicomiso con plazos configurables
  const docEntDias = plazos.doc_fideicomiso_entregar_dias || 5;
  const docEntTipo = plazos.doc_fideicomiso_entregar_tipo || 'habiles';
  const docRevDias = plazos.doc_fideicomiso_revisar_dias || 10;
  const docRevTipo = plazos.doc_fideicomiso_revisar_tipo || 'naturales';
  ctx.doc_fideicomiso = {
    dias_entregar: docEntDias,
    dias_revisar: docRevDias,
    dias_entregar_letras: diasALetras(docEntDias),
    dias_revisar_letras: diasALetras(docRevDias),
    dias_entregar_letras_en: diasALetrasEn(docEntDias),
    dias_revisar_letras_en: diasALetrasEn(docRevDias),
    tipo_entregar: tipoDias(docEntTipo),
    tipo_revisar: tipoDias(docRevTipo),
  };

  // Financiamiento con plazo configurable
  const finData = datos.campos?.financiamiento || {};
  const finAprobDias = plazos.financiamiento_aprobacion_dias || finData.dias_due_diligence || 30;
  const finAprobTipo = plazos.financiamiento_aprobacion_tipo || 'naturales';
  ctx.financiamiento = {
    ...finData,
    dias_due_diligence: finAprobDias,
    dias_due_diligence_letras: diasALetras(finAprobDias),
    dias_due_diligence_letras_en: diasALetrasEn(finAprobDias),
    dias_due_diligence_letras_fr: diasALetrasFr(finAprobDias),
    tipo_due_diligence: tipoDias(finAprobTipo),
  };

  // Inventario con plazos configurables
  const invEntDias = plazos.inventario_entregar_dias || 5;
  const invEntTipo = plazos.inventario_entregar_tipo || 'habiles';
  const invRevDias = plazos.inventario_revisar_dias || 5;
  const invRevTipo = plazos.inventario_revisar_tipo || 'naturales';
  ctx.inventario = {
    ...(datos.campos?.inventario || {}),
    dias_entregar: invEntDias,
    dias_revisar: invRevDias,
    dias_entregar_letras: diasALetras(invEntDias),
    dias_revisar_letras: diasALetras(invRevDias),
    tipo_entregar: tipoDias(invEntTipo),
    tipo_revisar: tipoDias(invRevTipo),
  };

  // Arrendamientos con plazos configurables
  const arrInfDias = plazos.arrendamientos_informar_dias || 5;
  const arrInfTipo = plazos.arrendamientos_informar_tipo || 'habiles';
  const arrRevDias = plazos.arrendamientos_revisar_dias || 5;
  const arrRevTipo = plazos.arrendamientos_revisar_tipo || 'naturales';
  ctx.arrendamientos = {
    ...(datos.campos?.arrendamientos || {}),
    dias_informar: arrInfDias,
    dias_revisar: arrRevDias,
    dias_informar_letras: diasALetras(arrInfDias),
    dias_revisar_letras: diasALetras(arrRevDias),
    tipo_informar: tipoDias(arrInfTipo),
    tipo_revisar: tipoDias(arrRevTipo),
  };

  // Zona Federal con plazos configurables
  const zfEntDias = plazos.zona_federal_entregar_dias || 5;
  const zfEntTipo = plazos.zona_federal_entregar_tipo || 'habiles';
  const zfRevDias = plazos.zona_federal_revisar_dias || 5;
  const zfRevTipo = plazos.zona_federal_revisar_tipo || 'naturales';
  ctx.zona_federal = {
    dias_entregar: zfEntDias,
    dias_revisar: zfRevDias,
    dias_entregar_letras: diasALetras(zfEntDias),
    dias_revisar_letras: diasALetras(zfRevDias),
    tipo_entregar: tipoDias(zfEntTipo),
    tipo_revisar: tipoDias(zfRevTipo),
  };

  // Litigios pendientes con plazos configurables
  const litInfDias = plazos.litigios_informar_dias || 3;
  const litInfTipo = plazos.litigios_informar_tipo || 'habiles';
  const litEvDias = plazos.litigios_evaluar_dias || 5;
  const litEvTipo = plazos.litigios_evaluar_tipo || 'naturales';
  ctx.litigios = {
    dias_informar: litInfDias,
    dias_evaluar: litEvDias,
    dias_informar_letras: diasALetras(litInfDias),
    dias_evaluar_letras: diasALetras(litEvDias),
    tipo_informar: tipoDias(litInfTipo),
    tipo_evaluar: tipoDias(litEvTipo),
  };

  // Empleados/laborales con plazos configurables
  const empInfDias = plazos.empleados_informar_dias || 3;
  const empInfTipo = plazos.empleados_informar_tipo || 'habiles';
  const empEvDias = plazos.empleados_evaluar_dias || 5;
  const empEvTipo = plazos.empleados_evaluar_tipo || 'naturales';
  ctx.empleados = {
    dias_informar: empInfDias,
    dias_evaluar: empEvDias,
    dias_informar_letras: diasALetras(empInfDias),
    dias_evaluar_letras: diasALetras(empEvDias),
    tipo_informar: tipoDias(empInfTipo),
    tipo_evaluar: tipoDias(empEvTipo),
  };

  // Condición libre (texto personalizado)
  ctx.condicion_libre = datos.campos?.condicion_libre || {};

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
          (bloque.despues_de && ['inspeccion', 'doc_fideicomiso', 'financiamiento', 'inventario', 'arrendamientos', 'zona_federal', 'litigios_pendientes', 'empleados_condicion'].includes(bloque.despues_de))) {
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
