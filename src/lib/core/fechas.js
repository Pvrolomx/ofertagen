/**
 * OfertaGen — Motor de Fechas Jurídicas
 * 
 * Convierte fechas ISO a formato de prosa jurídica en español e inglés.
 * 
 * Ejemplo: "2023-03-20" → "20 de Marzo de 2023" / "March 20, 2023"
 */

// ============================================================
// TABLAS
// ============================================================

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MESES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DIAS_ORDINAL_EN = (d) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = d % 100;
  return d + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Parsea una fecha desde string ISO o Date object.
 * @param {string|Date} fecha
 * @returns {{ dia: number, mes: number, anio: number }}
 */
function parsearFecha(fecha) {
  if (fecha instanceof Date) {
    return {
      dia: fecha.getDate(),
      mes: fecha.getMonth(), // 0-indexed
      anio: fecha.getFullYear(),
    };
  }

  // ISO string: "2023-03-20" o "2023-03-20T00:00:00"
  const parts = fecha.split('T')[0].split('-');
  return {
    dia: parseInt(parts[2], 10),
    mes: parseInt(parts[1], 10) - 1, // convertir a 0-indexed
    anio: parseInt(parts[0], 10),
  };
}

/**
 * Convierte fecha a formato jurídico español.
 * 
 * @param {string|Date} fecha - Fecha ISO o Date object
 * @param {Object} [opciones]
 * @param {boolean} [opciones.conDia=true] - Incluir número de día
 * @param {boolean} [opciones.soloMesAnio=false] - Solo "Marzo de 2023"
 * @returns {string} Ej: "20 de Marzo de 2023"
 */
export function fechaEs(fecha, opciones = {}) {
  const { conDia = true, soloMesAnio = false } = opciones;
  const { dia, mes, anio } = parsearFecha(fecha);

  if (soloMesAnio) {
    return `${MESES_ES[mes]} de ${anio}`;
  }

  if (!conDia) {
    return `${MESES_ES[mes]} de ${anio}`;
  }

  return `${dia} de ${MESES_ES[mes]} de ${anio}`;
}

/**
 * Convierte fecha a formato jurídico inglés.
 * 
 * @param {string|Date} fecha
 * @param {Object} [opciones]
 * @param {boolean} [opciones.conDia=true]
 * @param {boolean} [opciones.soloMesAnio=false]
 * @returns {string} Ej: "March 20, 2023"
 */
export function fechaEn(fecha, opciones = {}) {
  const { conDia = true, soloMesAnio = false } = opciones;
  const { dia, mes, anio } = parsearFecha(fecha);

  if (soloMesAnio) {
    return `${MESES_EN[mes]}, ${anio}`;
  }

  if (!conDia) {
    return `${MESES_EN[mes]}, ${anio}`;
  }

  return `${MESES_EN[mes]} ${dia}, ${anio}`;
}

/**
 * Genera ambas versiones de fecha (ES/EN) en un objeto.
 * 
 * @param {string|Date} fecha
 * @returns {{ es: string, en: string }}
 */
export function fechaBilingue(fecha) {
  return {
    es: fechaEs(fecha),
    en: fechaEn(fecha),
  };
}

/**
 * Genera texto de plazo relativo para contratos.
 * Ej: "dentro de los 3 días hábiles siguientes" / "within 3 business days"
 * 
 * @param {number} cantidad
 * @param {string} tipo - "habiles" | "naturales" | "calendario"
 * @returns {{ es: string, en: string }}
 */
export function plazo(cantidad, tipo = 'habiles') {
  const tipos = {
    habiles: { es: 'días hábiles', en: 'business days' },
    naturales: { es: 'días naturales', en: 'calendar days' },
    calendario: { es: 'días calendario', en: 'calendar days' },
  };

  const t = tipos[tipo] || tipos.habiles;

  return {
    es: `${cantidad} ${t.es}`,
    en: `${cantidad} ${t.en}`,
    esFrase: `dentro de los ${cantidad} ${t.es} siguientes`,
    enFrase: `within the next ${cantidad} ${t.en}`,
  };
}

/**
 * Genera texto de rango de fechas para contratos.
 * Ej: "las primeras dos semanas del mes de Mayo de 2023"
 * 
 * @param {Object} config
 * @param {string} config.descripcion - "primeras dos semanas" | texto libre
 * @param {string|Date} config.mes - Fecha del mes referido
 * @returns {{ es: string, en: string }}
 */
export function rangoDescriptivo(config) {
  const { descripcion, mes } = config;
  const { mes: m, anio } = parsearFecha(mes);

  return {
    es: `${descripcion} del mes de ${MESES_ES[m]} de ${anio}`,
    en: `the ${descripcion} of ${MESES_EN[m]} ${anio}`,
  };
}

/**
 * Genera hora con lugar para vigencia de ofertas.
 * Ej: "medianoche del día 22 de Marzo de 2023, tiempo local de Bucerias, Nayarit"
 * 
 * @param {string|Date} fecha
 * @param {string} hora - "medianoche" | "mediodía" | hora específica
 * @param {string} lugar - Ciudad y estado
 * @returns {{ es: string, en: string }}
 */
export function vencimiento(fecha, hora, lugar) {
  const fechaFormateada = fechaEs(fecha);
  const fechaEng = fechaEn(fecha);

  const horasEn = {
    medianoche: 'midnight',
    'mediodía': 'noon',
  };

  const horaEng = horasEn[hora] || hora;

  return {
    es: `${hora} del día ${fechaFormateada}, tiempo local de ${lugar}`,
    en: `${horaEng} of ${fechaEng}, local time of ${lugar}`,
  };
}
