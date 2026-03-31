/**
 * OfertaGen — Motor de Concordancia Lingüística
 * 
 * Resuelve género y número para roles jurídicos en contratos mexicanos.
 * Convención: singular colectivo (práctica notarial mexicana).
 * 
 * Entrada: array de personas con { nombre, genero: "M"|"F" }
 * Salida: objeto con todas las formas gramaticales pre-calculadas
 */

// ============================================================
// DICCIONARIO DE ROLES JURÍDICOS
// Cada rol tiene sus 4 formas: ms, fs, mp, fp
// ============================================================

const ROLES = {
  ofertante: {
    sustantivo: { ms: 'OFERTANTE', fs: 'OFERTANTE', mp: 'OFERTANTES', fp: 'OFERTANTES' },
    sustantivo_en: { ms: 'OFFERER', fs: 'OFFERER', mp: 'OFFERERS', fp: 'OFFERERS' },
    sustantivo_fr: { ms: 'OFFRANT', fs: 'OFFRANTE', mp: 'OFFRANTS', fp: 'OFFRANTES' },
  },
  propietario: {
    sustantivo: { ms: 'PROPIETARIO', fs: 'PROPIETARIA', mp: 'PROPIETARIOS', fp: 'PROPIETARIAS' },
    sustantivo_en: { ms: 'OWNER', fs: 'OWNER', mp: 'OWNERS', fp: 'OWNERS' },
    sustantivo_fr: { ms: 'PROPRIÉTAIRE', fs: 'PROPRIÉTAIRE', mp: 'PROPRIÉTAIRES', fp: 'PROPRIÉTAIRES' },
  },
  vendedor: {
    sustantivo: { ms: 'VENDEDOR', fs: 'VENDEDORA', mp: 'VENDEDORES', fp: 'VENDEDORAS' },
    sustantivo_en: { ms: 'SELLER', fs: 'SELLER', mp: 'SELLERS', fp: 'SELLERS' },
    sustantivo_fr: { ms: 'VENDEUR', fs: 'VENDEUSE', mp: 'VENDEURS', fp: 'VENDEUSES' },
  },
  comprador: {
    sustantivo: { ms: 'COMPRADOR', fs: 'COMPRADORA', mp: 'COMPRADORES', fp: 'COMPRADORAS' },
    sustantivo_en: { ms: 'BUYER', fs: 'BUYER', mp: 'BUYERS', fp: 'BUYERS' },
    sustantivo_fr: { ms: 'ACHETEUR', fs: 'ACHETEUSE', mp: 'ACHETEURS', fp: 'ACHETEUSES' },
  },
  arrendador: {
    sustantivo: { ms: 'ARRENDADOR', fs: 'ARRENDADORA', mp: 'ARRENDADORES', fp: 'ARRENDADORAS' },
    sustantivo_en: { ms: 'LANDLORD', fs: 'LANDLORD', mp: 'LANDLORDS', fp: 'LANDLORDS' },
    sustantivo_fr: { ms: 'BAILLEUR', fs: 'BAILLERESSE', mp: 'BAILLEURS', fp: 'BAILLERESSES' },
  },
  arrendatario: {
    sustantivo: { ms: 'ARRENDATARIO', fs: 'ARRENDATARIA', mp: 'ARRENDATARIOS', fp: 'ARRENDATARIAS' },
    sustantivo_en: { ms: 'TENANT', fs: 'TENANT', mp: 'TENANTS', fp: 'TENANTS' },
    sustantivo_fr: { ms: 'LOCATAIRE', fs: 'LOCATAIRE', mp: 'LOCATAIRES', fp: 'LOCATAIRES' },
  },
  promitente_vendedor: {
    sustantivo: { ms: 'PROMITENTE VENDEDOR', fs: 'PROMITENTE VENDEDORA', mp: 'PROMITENTES VENDEDORES', fp: 'PROMITENTES VENDEDORAS' },
    sustantivo_en: { ms: 'PROMISING SELLER', fs: 'PROMISING SELLER', mp: 'PROMISING SELLERS', fp: 'PROMISING SELLERS' },
    sustantivo_fr: { ms: 'PROMETTANT VENDEUR', fs: 'PROMETTANTE VENDEUSE', mp: 'PROMETTANTS VENDEURS', fp: 'PROMETTANTES VENDEUSES' },
  },
  promitente_comprador: {
    sustantivo: { ms: 'PROMITENTE COMPRADOR', fs: 'PROMITENTE COMPRADORA', mp: 'PROMITENTES COMPRADORES', fp: 'PROMITENTES COMPRADORAS' },
    sustantivo_en: { ms: 'PROMISING BUYER', fs: 'PROMISING BUYER', mp: 'PROMISING BUYERS', fp: 'PROMISING BUYERS' },
    sustantivo_fr: { ms: 'PROMETTANT ACHETEUR', fs: 'PROMETTANTE ACHETEUSE', mp: 'PROMETTANTS ACHETEURS', fp: 'PROMETTANTES ACHETEUSES' },
  },
  fideicomisario: {
    sustantivo: { ms: 'FIDEICOMISARIO', fs: 'FIDEICOMISARIA', mp: 'FIDEICOMISARIOS', fp: 'FIDEICOMISARIAS' },
    sustantivo_en: { ms: 'BENEFICIARY', fs: 'BENEFICIARY', mp: 'BENEFICIARIES', fp: 'BENEFICIARIES' },
    sustantivo_fr: { ms: 'BÉNÉFICIAIRE', fs: 'BÉNÉFICIAIRE', mp: 'BÉNÉFICIAIRES', fp: 'BÉNÉFICIAIRES' },
  },
  administrador: {
    sustantivo: { ms: 'ADMINISTRADOR', fs: 'ADMINISTRADORA', mp: 'ADMINISTRADORES', fp: 'ADMINISTRADORAS' },
    sustantivo_en: { ms: 'ADMINISTRATOR', fs: 'ADMINISTRATOR', mp: 'ADMINISTRATORS', fp: 'ADMINISTRATORS' },
    sustantivo_fr: { ms: 'ADMINISTRATEUR', fs: 'ADMINISTRATRICE', mp: 'ADMINISTRATEURS', fp: 'ADMINISTRATRICES' },
  },
};

// ============================================================
// DICCIONARIO GRAMATICAL COMÚN
// Artículos, pronombres, verbos, adjetivos frecuentes
// ============================================================

const GRAMATICA = {
  articulo: { ms: 'EL', fs: 'LA', mp: 'LOS', fp: 'LAS' },
  articulo_min: { ms: 'el', fs: 'la', mp: 'los', fp: 'las' },
  articulo_en: { ms: 'THE', fs: 'THE', mp: 'THE', fp: 'THE' },
  articulo_fr: { ms: 'LE', fs: 'LA', mp: 'LES', fp: 'LES' },

  // Pronombres relativos
  quien: { ms: 'quien', fs: 'quien', mp: 'quienes', fp: 'quienes' },
  quien_en: { ms: 'who', fs: 'who', mp: 'who', fp: 'who' },
  quien_fr: { ms: 'qui', fs: 'qui', mp: 'qui', fp: 'qui' },

  // Pronombre objeto indirecto
  le: { ms: 'le', fs: 'le', mp: 'les', fp: 'les' },

  // Verbos frecuentes en contratos (3a persona)
  manifestar: { ms: 'manifiesta', fs: 'manifiesta', mp: 'manifiestan', fp: 'manifiestan' },
  tener: { ms: 'tiene', fs: 'tiene', mp: 'tienen', fp: 'tienen' },
  ser: { ms: 'es', fs: 'es', mp: 'son', fp: 'son' },
  comparecer: { ms: 'comparece', fs: 'comparece', mp: 'comparecen', fp: 'comparecen' },
  declarar: { ms: 'declara', fs: 'declara', mp: 'declaran', fp: 'declaran' },
  obligar: { ms: 'se obliga', fs: 'se obliga', mp: 'se obligan', fp: 'se obligan' },
  denominar: {
    ms: 'se le denominará',
    fs: 'se le denominará',
    mp: 'se les denominará',
    fp: 'se les denominará',
  },
  ofrecer: { ms: 'ofrece', fs: 'ofrece', mp: 'ofrecen', fp: 'ofrecen' },

  // Adjetivos frecuentes (terminación variable)
  necesario: { ms: 'necesaria', fs: 'necesaria', mp: 'necesarias', fp: 'necesarias' },
  // Nota: "necesaria" es invariable en este contexto (capacidad jurídica necesaria)

  // Nacionalidades comunes
  mexicano: { ms: 'mexicano', fs: 'mexicana', mp: 'mexicanos', fp: 'mexicanas' },
  estadounidense: { ms: 'estadounidense', fs: 'estadounidense', mp: 'estadounidenses', fp: 'estadounidenses' },
  canadiense: { ms: 'canadiense', fs: 'canadiense', mp: 'canadienses', fp: 'canadienses' },

  // Estado civil
  soltero: { ms: 'soltero', fs: 'soltera', mp: 'solteros', fp: 'solteras' },
  casado: { ms: 'casado', fs: 'casada', mp: 'casados', fp: 'casadas' },
  divorciado: { ms: 'divorciado', fs: 'divorciada', mp: 'divorciados', fp: 'divorciadas' },
  viudo: { ms: 'viudo', fs: 'viuda', mp: 'viudos', fp: 'viudas' },
};

// ============================================================
// FUNCIONES CORE
// ============================================================

/**
 * Calcula la clave de concordancia a partir de un array de personas.
 * Reglas:
 *   - 1 persona M → "ms"
 *   - 1 persona F → "fs"  
 *   - 2+ personas, todas F → "fp"
 *   - 2+ personas, cualquier otro caso → "mp" (masculino genérico RAE)
 *   - Persona moral → "fs" (las sociedades son gramaticalmente femeninas)
 * 
 * @param {Array} personas - [{ nombre: string, genero: "M"|"F" }]
 * @param {string} tipoPersona - "fisica" | "moral"
 * @returns {string} "ms" | "fs" | "mp" | "fp"
 */
export function calcularClave(personas, tipoPersona = 'fisica') {
  if (tipoPersona === 'moral') return 'fs';

  if (!personas || personas.length === 0) {
    throw new Error('Se requiere al menos una persona');
  }

  if (personas.length === 1) {
    return personas[0].genero === 'F' ? 'fs' : 'ms';
  }

  // Plural: si TODAS son F → fp, cualquier otro caso → mp
  const todasFemeninas = personas.every(p => p.genero === 'F');
  return todasFemeninas ? 'fp' : 'mp';
}

/**
 * Genera la lista de nombres formateada para comparecencia.
 * 1 persona: "JUAN PÉREZ GÓMEZ"
 * 2 personas: "JUAN PÉREZ GÓMEZ y MARÍA LÓPEZ RAMÍREZ"
 * 3+ personas: "JUAN PÉREZ, MARÍA LÓPEZ y PEDRO GARCÍA"
 * 
 * @param {Array} personas - [{ nombre: string }]
 * @returns {string}
 */
export function formatearNombres(personas) {
  if (personas.length === 1) return personas[0].nombre;
  if (personas.length === 2) {
    return `${personas[0].nombre} y ${personas[1].nombre}`;
  }
  const ultimos = personas.slice(0, -1).map(p => p.nombre).join(', ');
  return `${ultimos} y ${personas[personas.length - 1].nombre}`;
}

/**
 * Genera el contexto lingüístico completo para una parte.
 * Este es el objeto que alimenta las plantillas.
 * 
 * SINGULAR COLECTIVO: Independientemente de cuántas personas haya,
 * el cuerpo del contrato usa singular. Solo la comparecencia inicial
 * usa la forma real (singular o plural).
 * 
 * @param {Object} config
 * @param {string} config.rol - Clave del rol (ej: "ofertante", "vendedor")
 * @param {Array}  config.personas - [{ nombre, genero }]
 * @param {string} config.tipoPersona - "fisica" | "moral"
 * @param {string} [config.razonSocial] - Razón social (solo para morales)
 * @param {Object} [config.representante] - { nombre, genero } (solo para morales)
 * @param {string} [config.domicilio] - Domicilio convencional
 * @param {string} [config.nacionalidad] - Clave de nacionalidad
 * @param {boolean} [config.usarSingularColectivo=true] - Si usar singular colectivo
 * @returns {Object} Contexto lingüístico completo
 */
export function generarContextoParte(config) {
  const {
    rol,
    personas,
    tipoPersona = 'fisica',
    razonSocial,
    representante,
    domicilio = '',
    nacionalidad,
    usarSingularColectivo = true,
  } = config;

  const rolData = ROLES[rol];
  if (!rolData) {
    throw new Error(`Rol desconocido: "${rol}". Roles disponibles: ${Object.keys(ROLES).join(', ')}`);
  }

  // Clave real (para comparecencia)
  const claveReal = calcularClave(personas, tipoPersona);

  // Clave de contrato: singular colectivo o real
  const claveContrato = usarSingularColectivo
    ? (claveReal.endsWith('s') ? claveReal : claveReal) // singular se mantiene
    : claveReal;

  // Para singular colectivo con múltiples personas, forzamos singular
  // pero respetamos el género dominante
  const claveSingularColectivo = (() => {
    if (!usarSingularColectivo) return claveReal;
    if (personas.length === 1) return claveReal;
    // Múltiples personas → singular colectivo
    // Si todas son F → fs, si no → ms
    const todasF = personas.every(p => p.genero === 'F');
    return todasF ? 'fs' : 'ms';
  })();

  // ---- Contexto para ESPAÑOL ----

  const nombres = tipoPersona === 'moral'
    ? razonSocial
    : formatearNombres(personas);

  // Referencia del contrato (lo que se usa en el cuerpo)
  const art = GRAMATICA.articulo[claveSingularColectivo];
  const sust = rolData.sustantivo[claveSingularColectivo];
  const referencia = `${art} ${sust}`; // "EL OFERTANTE", "LA PROPIETARIA"

  // Referencia de comparecencia (usa la clave real)
  const artReal = GRAMATICA.articulo[claveReal];
  const sustReal = rolData.sustantivo[claveReal];
  const referenciaReal = `${artReal} ${sustReal}`;

  // Texto de comparecencia completo
  let comparecencia;
  if (tipoPersona === 'moral') {
    const repGenero = representante?.genero === 'F' ? 'fs' : 'ms';
    comparecencia = `${razonSocial}, representada en este acto por ${representante?.nombre || '[REPRESENTANTE]'}, ${GRAMATICA.quien[repGenero]} acredita su personalidad en los términos del instrumento notarial correspondiente`;
  } else if (personas.length === 1) {
    comparecencia = `${nombres}, ${GRAMATICA.quien[claveReal]} ${GRAMATICA.manifestar[claveReal]} que ${GRAMATICA.tener[claveReal]} la capacidad jurídica y económica necesaria para contratar en los términos del presente acuerdo y a ${GRAMATICA.quien[claveReal]} en lo sucesivo ${GRAMATICA.denominar[claveReal]} "${referencia}"`;
  } else {
    comparecencia = `${nombres}, ${GRAMATICA.quien[claveReal]} ${GRAMATICA.manifestar[claveReal]} que ${GRAMATICA.tener[claveReal]} la capacidad jurídica y económica necesaria para contratar en los términos del presente acuerdo y a ${GRAMATICA.quien[claveReal]} en lo sucesivo ${GRAMATICA.denominar[claveReal]} conjuntamente "${referencia}"`;
  }

  // ---- Contexto para INGLÉS ----

  const artEn = GRAMATICA.articulo_en[claveSingularColectivo];
  const sustEn = rolData.sustantivo_en[claveSingularColectivo];
  const referenciaEn = `${artEn} ${sustEn}`;

  // ---- Contexto para FRANCÉS ----

  const artFr = GRAMATICA.articulo_fr[claveSingularColectivo];
  const sustFr = rolData.sustantivo_fr[claveSingularColectivo];
  const referenciaFr = `${artFr} ${sustFr}`;

  // ---- Objeto de contexto completo ----

  return {
    // Identificación
    rol,
    tipoPersona,
    clave: claveReal,
    claveSingularColectivo,
    personas,

    // Nombres
    nombres,
    nombresFormateados: nombres,

    // Referencias (lo que se usa en el cuerpo del contrato)
    articulo: art,
    sustantivo: sust,
    referencia,          // "EL OFERTANTE"
    referenciaConComillas: `"${referencia}"`, // '"EL OFERTANTE"'

    // Comparecencia (solo para la sección inicial)
    comparecencia,
    referenciaReal,

    // Gramática contextual (para cláusulas que necesiten conjugar)
    quien: GRAMATICA.quien[claveSingularColectivo],
    le: GRAMATICA.le[claveSingularColectivo],
    manifiesta: GRAMATICA.manifestar[claveSingularColectivo],
    tiene: GRAMATICA.tener[claveSingularColectivo],
    es: GRAMATICA.ser[claveSingularColectivo],
    declara: GRAMATICA.declarar[claveSingularColectivo],
    ofrece: GRAMATICA.ofrecer[claveSingularColectivo],
    seObliga: GRAMATICA.obligar[claveSingularColectivo],
    seDenominara: GRAMATICA.denominar[claveSingularColectivo],

    // Datos adicionales
    domicilio,
    nacionalidad: nacionalidad ? (GRAMATICA[nacionalidad]?.[claveReal] || nacionalidad) : '',

    // Inglés
    en: {
      articulo: artEn,
      sustantivo: sustEn,
      referencia: referenciaEn,
      referenciaConComillas: `"${referenciaEn}"`,
    },

    // Francés
    fr: {
      articulo: artFr,
      sustantivo: sustFr,
      referencia: referenciaFr,
      referenciaConComillas: `"${referenciaFr}"`,
    },
  };
}

/**
 * Registrar un rol personalizado en tiempo de ejecución.
 * Permite agregar roles sin modificar el código fuente.
 * 
 * @param {string} clave - Identificador del rol
 * @param {Object} definicion - { sustantivo: { ms, fs, mp, fp }, sustantivo_en: { ms, fs, mp, fp } }
 */
export function registrarRol(clave, definicion) {
  if (ROLES[clave]) {
    console.warn(`Rol "${clave}" ya existe y será sobreescrito.`);
  }
  ROLES[clave] = definicion;
}

/**
 * Registrar una entrada gramatical personalizada.
 * 
 * @param {string} clave - Identificador (ej: "brasileño" para nacionalidad)
 * @param {Object} formas - { ms, fs, mp, fp }
 */
export function registrarGramatica(clave, formas) {
  GRAMATICA[clave] = formas;
}

/**
 * Obtener la lista de roles disponibles.
 * @returns {string[]}
 */
export function rolesDisponibles() {
  return Object.keys(ROLES);
}

/**
 * Resolver una forma gramatical arbitraria.
 * Útil para adjetivos y palabras no previstas en el diccionario.
 * 
 * @param {string} palabra - Clave en el diccionario gramatical
 * @param {string} clave - "ms"|"fs"|"mp"|"fp"
 * @returns {string}
 */
export function resolver(palabra, clave) {
  if (!GRAMATICA[palabra]) {
    throw new Error(`Palabra "${palabra}" no encontrada en el diccionario gramatical.`);
  }
  return GRAMATICA[palabra][clave];
}
