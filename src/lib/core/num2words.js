/**
 * OfertaGen — Números a Letras (Español Jurídico)
 * 
 * Convierte montos numéricos a texto en español con formato contractual.
 * Soporta USD y MXN con centavos.
 * 
 * Ejemplo: 220000 → "doscientos veinte mil dólares estadounidenses"
 * Ejemplo: 1250000.50 → "un millón doscientos cincuenta mil pesos 50/100 M.N."
 */

// ============================================================
// TABLAS DE CONVERSIÓN
// ============================================================

const UNIDADES = [
  '', 'un', 'dos', 'tres', 'cuatro', 'cinco',
  'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince',
  'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
  'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco',
  'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];

const DECENAS = [
  '', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta',
  'sesenta', 'setenta', 'ochenta', 'noventa',
];

const CENTENAS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

// ============================================================
// MONEDAS
// ============================================================

const MONEDAS = {
  USD: {
    singular: 'dólar estadounidense',
    plural: 'dólares estadounidenses',
    simbolo: '$',
    centavos: 'centavos de dólar',
    sufijo: 'USD',
  },
  MXN: {
    singular: 'peso',
    plural: 'pesos',
    simbolo: '$',
    centavos: 'centavos',
    sufijo: 'M.N.',
  },
  EUR: {
    singular: 'euro',
    plural: 'euros',
    simbolo: '€',
    centavos: 'céntimos',
    sufijo: 'EUR',
  },
};

// ============================================================
// FUNCIONES DE CONVERSIÓN
// ============================================================

/**
 * Convierte un número del 0 al 999 a letras.
 * @param {number} n
 * @returns {string}
 */
function centenaALetras(n) {
  if (n === 0) return '';
  if (n === 100) return 'cien';

  const c = Math.floor(n / 100);
  const resto = n % 100;

  let resultado = CENTENAS[c];

  if (resto === 0) return resultado;

  if (c > 0) resultado += ' ';

  if (resto <= 29) {
    resultado += UNIDADES[resto];
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    resultado += DECENAS[d];
    if (u > 0) resultado += ` y ${UNIDADES[u]}`;
  }

  return resultado;
}

/**
 * Convierte un entero a letras en español.
 * Soporta hasta 999,999,999,999 (billones no necesarios en RE).
 * 
 * @param {number} n - Número entero positivo
 * @returns {string}
 */
function enteroALetras(n) {
  if (n === 0) return 'cero';
  if (n === 1) return 'un';

  let resultado = '';

  // Millones
  const millones = Math.floor(n / 1000000);
  if (millones > 0) {
    if (millones === 1) {
      resultado += 'un millón';
    } else {
      resultado += `${centenaALetras(millones)} millones`;
    }
    const resto = n % 1000000;
    if (resto > 0) resultado += ' ';
    n = resto;
  }

  // Miles
  const miles = Math.floor(n / 1000);
  if (miles > 0) {
    if (miles === 1) {
      resultado += 'mil';
    } else {
      resultado += `${centenaALetras(miles)} mil`;
    }
    const resto = n % 1000;
    if (resto > 0) resultado += ' ';
    n = resto;
  }

  // Centenas
  if (n > 0) {
    resultado += centenaALetras(n);
  }

  return resultado;
}

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Convierte un monto a texto en español con formato contractual.
 * 
 * @param {number} monto - El monto numérico
 * @param {string} moneda - "USD" | "MXN" | "EUR"
 * @returns {string} Texto en español (ej: "doscientos veinte mil dólares estadounidenses")
 */
export function montoALetras(monto, moneda = 'USD') {
  const config = MONEDAS[moneda];
  if (!config) {
    throw new Error(`Moneda no soportada: "${moneda}". Disponibles: ${Object.keys(MONEDAS).join(', ')}`);
  }

  const parteEntera = Math.floor(Math.abs(monto));
  const centavos = Math.round((Math.abs(monto) - parteEntera) * 100);

  const letras = enteroALetras(parteEntera);
  const nombreMoneda = parteEntera === 1 ? config.singular : config.plural;

  let resultado = `${letras} ${nombreMoneda}`;

  if (centavos > 0) {
    resultado += ` ${centavos}/100`;
  } else {
    resultado += ' 00/100';
  }

  if (config.sufijo) {
    resultado += ` ${config.sufijo}`;
  }

  return resultado;
}

/**
 * Formatea un monto numérico con separadores de miles y símbolo.
 * 
 * @param {number} monto
 * @param {string} moneda - "USD" | "MXN" | "EUR"
 * @returns {string} Ej: "$220,000.00 USD"
 */
export function montoFormateado(monto, moneda = 'USD') {
  const config = MONEDAS[moneda];
  if (!config) {
    throw new Error(`Moneda no soportada: "${moneda}"`);
  }

  const formateado = Math.abs(monto).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${config.simbolo}${formateado} ${config.sufijo || moneda}`;
}

/**
 * Genera el bloque completo de precio para contratos.
 * Incluye monto formateado + letras entre paréntesis.
 * 
 * @param {number} monto
 * @param {string} moneda
 * @returns {Object} { formateado, letras, completo, completo_en }
 */
export function bloquePrecio(monto, moneda = 'USD') {
  const formateado = montoFormateado(monto, moneda);
  const letras = montoALetras(monto, moneda);

  return {
    formateado,                                    // "$220,000.00 USD"
    letras,                                        // "doscientos veinte mil dólares estadounidenses 00/100 USD"
    completo: `${formateado} (${letras})`,         // "$220,000.00 USD (doscientos veinte mil...)"
    monto,
    moneda,
  };
}

/**
 * Registrar una moneda personalizada.
 * 
 * @param {string} codigo - Código ISO (ej: "CAD")
 * @param {Object} config - { singular, plural, simbolo, centavos, sufijo }
 */
export function registrarMoneda(codigo, config) {
  MONEDAS[codigo] = config;
}

// ============================================================
// SUPERFICIE EN INGLÉS
// ============================================================

const UNITS_EN = [
  '', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen',
];

const TENS_EN = [
  '', 'ten', 'twenty', 'thirty', 'forty', 'fifty',
  'sixty', 'seventy', 'eighty', 'ninety',
];

function numberToWordsEn(n) {
  if (n === 0) return 'zero';
  if (n < 20) return UNITS_EN[n];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const units = n % 10;
    return TENS_EN[tens] + (units ? '-' + UNITS_EN[units] : '');
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    return UNITS_EN[hundreds] + ' hundred' + (rest ? ' ' + numberToWordsEn(rest) : '');
  }
  return String(n); // Para números muy grandes, usar dígitos
}

/**
 * Convierte metros cuadrados a texto en inglés.
 * Ej: 129.85 → "one hundred twenty-nine point eighty-five"
 * 
 * @param {number} m2 - Metros cuadrados
 * @returns {string}
 */
export function superficieALetrasEn(m2) {
  const parteEntera = Math.floor(m2);
  const decimal = Math.round((m2 - parteEntera) * 100);
  
  let resultado = numberToWordsEn(parteEntera);
  
  if (decimal > 0) {
    resultado += ' point ' + numberToWordsEn(decimal);
  }
  
  return resultado;
}
