/**
 * OfertaGen — Plantilla: Oferta de Intención de Compra
 * 
 * Estructura 100% declarativa. El motor la lee y:
 *   1. Genera el formulario dinámicamente (campos)
 *   2. Resuelve concordancia (partes)  
 *   3. Ensambla el contrato (bloques)
 *   4. Renderiza a DOCX/HTML (salida bilingüe)
 * 
 * Extraída de: OFERTA_DENNIS_3.docx (caso Doty → Palutke)
 */

const PLANTILLA_OFERTA_COMPRA = {

  // ============================================================
  // META
  // ============================================================

  meta: {
    id: 'oferta_compra',
    version: '1.0.0',
    nombre: 'Oferta de Intención de Compra',
    nombre_en: 'Purchase Intent Offer',
    idiomas: ['es', 'en'],
    formato: 'bilingue_tabla', // tabla lado a lado ES | EN
    nota_idioma: {
      es: 'La versión en idioma inglés es solamente una traducción de cortesía. Para todos los efectos legales prevalecerá la versión en idioma español.',
      en: 'The English version is only a courtesy translation. For all legal effects the Spanish version will prevail.',
    },
  },

  // ============================================================
  // PARTES
  // ============================================================

  partes: [
    {
      id: 'ofertante',
      rol: 'ofertante',
      etiqueta: 'Ofertante / Comprador',
      etiqueta_en: 'Offerer / Buyer',
      min: 1,
      max: 4,
      tiposPermitidos: ['fisica', 'moral'],
      campos: [
        { id: 'nombre', tipo: 'texto', requerido: true, etiqueta: 'Nombre completo', etiqueta_en: 'Full name' },
        { id: 'genero', tipo: 'select', requerido: true, etiqueta: 'Género', opciones: [{ valor: 'M', texto: 'Masculino' }, { valor: 'F', texto: 'Femenino' }] },
        { id: 'nacionalidad', tipo: 'texto', requerido: false, etiqueta: 'Nacionalidad', etiqueta_en: 'Nationality' },
        { id: 'domicilio', tipo: 'textarea', requerido: true, etiqueta: 'Domicilio convencional', etiqueta_en: 'Conventional address' },
        { id: 'celular', tipo: 'tel', requerido: true, etiqueta: 'Celular/WhatsApp' },
        { id: 'email', tipo: 'email', requerido: true, etiqueta: 'Correo electrónico' },
      ],
    },
    {
      id: 'propietario',
      rol: 'propietario',
      etiqueta: 'Propietario / Vendedor',
      etiqueta_en: 'Owner / Seller',
      min: 1,
      max: 4,
      tiposPermitidos: ['fisica', 'moral'],
      campos: [
        { id: 'nombre', tipo: 'texto', requerido: true, etiqueta: 'Nombre completo', etiqueta_en: 'Full name' },
        { id: 'genero', tipo: 'select', requerido: true, etiqueta: 'Género', opciones: [{ valor: 'M', texto: 'Masculino' }, { valor: 'F', texto: 'Femenino' }] },
        { id: 'nacionalidad', tipo: 'texto', requerido: false, etiqueta: 'Nacionalidad', etiqueta_en: 'Nationality' },
        { id: 'domicilio', tipo: 'textarea', requerido: false, etiqueta: 'Domicilio (o inmueble objeto)', etiqueta_en: 'Address (or subject property)' },
        { id: 'celular', tipo: 'tel', requerido: true, etiqueta: 'Celular/WhatsApp' },
        { id: 'email', tipo: 'email', requerido: true, etiqueta: 'Correo electrónico' },
      ],
    },
  ],

  // ============================================================
  // CAMPOS GENERALES (no ligados a partes)
  // ============================================================

  campos: {
    inmueble: {
      etiqueta: 'Datos del inmueble',
      etiqueta_en: 'Property data',
      campos: [
        { id: 'descripcion_corta', tipo: 'texto', requerido: true, etiqueta: 'Descripción corta', placeholder: 'Ej: Departamento número 43 del Condominio Orquídeas' },
        { id: 'ubicacion_completa', tipo: 'textarea', requerido: true, etiqueta: 'Ubicación completa (cadena de condominios)', placeholder: 'Lote, coto, condominio maestro, dirección, municipio, estado' },
        { id: 'nivel_torre', tipo: 'texto', requerido: false, etiqueta: 'Nivel/Torre', placeholder: 'Ej: tercer nivel de la Torre A' },
        { id: 'descripcion_interior', tipo: 'textarea', requerido: false, etiqueta: 'Descripción interior', placeholder: 'sala, comedor, cocina, recámaras, baños...' },
        { id: 'superficie_m2', tipo: 'numero', requerido: true, etiqueta: 'Superficie de construcción (m²)' },
        { id: 'superficie_letras', tipo: 'texto', requerido: true, etiqueta: 'Superficie en letras', placeholder: 'ciento veintinueve metros ochenta y cinco centímetros cuadrados' },
        { id: 'indiviso', tipo: 'texto', requerido: false, etiqueta: 'Indiviso (% áreas comunes)', placeholder: '1.6790%' },
        { id: 'tiene_uso_exclusivo', tipo: 'boolean', requerido: false, etiqueta: 'Incluir notas de uso exclusivo', default: false },
        { id: 'notas_uso_exclusivo', tipo: 'textarea', requerido: false, etiqueta: 'Notas (uso exclusivo, estacionamiento, bodega, servidumbre...)', placeholder: 'Ej: un estacionamiento con superficie descubierta de 14.40 m² y una bodega con superficie de construcción cubierta de 2.80 m²' },
        { id: 'notas_uso_exclusivo_en', tipo: 'textarea', requerido: false, etiqueta: 'Notas uso exclusivo (inglés)', placeholder: 'a parking space with an uncovered surface area of 14.40 sq m and a storage room with a covered area of 2.80 sq m' },
        { id: 'clave_catastral', tipo: 'texto', requerido: false, etiqueta: 'Clave catastral', placeholder: '020-024-01-039-258-000' },
      ],
    },

    antecedente: {
      etiqueta: 'Antecedente registral',
      etiqueta_en: 'Property background',
      campos: [
        { id: 'fecha_escritura', tipo: 'fecha', requerido: true, etiqueta: 'Fecha de escritura anterior' },
        { id: 'numero_escritura', tipo: 'texto', requerido: true, etiqueta: 'Número de escritura' },
        { id: 'notario_anterior', tipo: 'texto', requerido: true, etiqueta: 'Nombre del notario', placeholder: 'Lic. Teodoro Ramírez Valenzuela' },
        { id: 'numero_notaria_anterior', tipo: 'texto', requerido: true, etiqueta: 'Número de notaría' },
        { id: 'ciudad_notaria_anterior', tipo: 'texto', requerido: true, etiqueta: 'Ciudad de la notaría', placeholder: 'Bucerias, Nayarit' },
        { id: 'estado_registro', tipo: 'select', requerido: false, etiqueta: 'Estado del RPP', opciones: [
          { valor: 'nayarit', texto: 'Nayarit (Bahía de Banderas, Bucerías)' },
          { valor: 'jalisco', texto: 'Jalisco (Puerto Vallarta)' },
        ], default: 'nayarit' },
        { id: 'tipo_registro', tipo: 'select', requerido: false, etiqueta: 'Tipo de inscripción', opciones: [
          { valor: 'folio_real', texto: 'Folio Real / Folio Real Electrónico' },
          { valor: 'legacy', texto: 'Inscripción tradicional (legacy)' },
        ], default: 'folio_real' },
        // Folio Real (ambos estados)
        { id: 'folio_real', tipo: 'texto', requerido: false, etiqueta: 'Folio Real / Folio Real Electrónico', placeholder: 'Ej: 54832' },
        // Legacy Nayarit: Libro, Sección, Serie, Partida
        { id: 'libro_rpp', tipo: 'texto', requerido: false, etiqueta: 'Libro' },
        { id: 'seccion_rpp', tipo: 'texto', requerido: false, etiqueta: 'Sección' },
        { id: 'serie_rpp', tipo: 'texto', requerido: false, etiqueta: 'Serie' },
        { id: 'partida_rpp', tipo: 'texto', requerido: false, etiqueta: 'Partida' },
        // Legacy Jalisco: Documento, Folios, Libro, Sección
        { id: 'documento_rpp', tipo: 'texto', requerido: false, etiqueta: 'Documento' },
        { id: 'folios_rpp', tipo: 'texto', requerido: false, etiqueta: 'Folios' },
        { id: 'libro_jal', tipo: 'texto', requerido: false, etiqueta: 'Libro' },
        { id: 'seccion_jal', tipo: 'texto', requerido: false, etiqueta: 'Sección' },
        // Predial (ambos)
        { id: 'cuenta_predial', tipo: 'texto', requerido: false, etiqueta: 'Cuenta predial' },
      ],
    },

    precio: {
      etiqueta: 'Precio y pagos',
      etiqueta_en: 'Price and payments',
      campos: [
        { id: 'precio_total', tipo: 'moneda', requerido: true, etiqueta: 'Precio total', moneda_default: 'USD' },
        { id: 'moneda', tipo: 'select', requerido: true, etiqueta: 'Moneda', opciones: [{ valor: 'USD', texto: 'Dólares (USD)' }, { valor: 'MXN', texto: 'Pesos (MXN)' }], default: 'USD' },
        { id: 'deposito_escrow', tipo: 'moneda', requerido_si: 'bloques.escrow', etiqueta: 'Monto depósito escrow' },
        { id: 'saldo', tipo: 'moneda', requerido: false, etiqueta: 'Saldo restante', calculado: 'precio_total - deposito_escrow' },
        { id: 'dias_deposito', tipo: 'numero', requerido_si: 'bloques.escrow', etiqueta: 'Días hábiles para depositar escrow', default: 3 },
        { id: 'dias_saldo', tipo: 'numero', requerido: false, etiqueta: 'Días hábiles para saldo (antes del cierre)', default: 5 },
        { id: 'anticipo_gastos', tipo: 'select', requerido: false, etiqueta: 'Anticipo de gastos de escrituración', opciones: [
          { valor: '0', texto: 'Sin anticipo' },
          { valor: '1000', texto: '$1,000 USD' },
          { valor: '2000', texto: '$2,000 USD' },
          { valor: '3000', texto: '$3,000 USD' },
          { valor: '5000', texto: '$5,000 USD' },
          { valor: '7500', texto: '$7,500 USD' },
          { valor: '10000', texto: '$10,000 USD' },
        ], default: '0' },
      ],
    },

    escrow: {
      etiqueta: 'Cuenta Escrow',
      etiqueta_en: 'Escrow account',
      visible_si: 'bloques.escrow',
      campos: [
        { id: 'empresa_escrow', tipo: 'select', requerido: true, etiqueta: 'Empresa escrow', opciones: [
          { valor: 'STEWART TITLE LATIN AMERICA', texto: 'Stewart Title Latin America (STLA)' },
          { valor: 'ARMOUR SETTLEMENT SERVICES', texto: 'Armour Settlement Services' },
          { valor: 'TITLE LATIN AMERICA (TLA)', texto: 'Title Latin America (TLA)' },
        ], default: 'STEWART TITLE LATIN AMERICA' },
        { id: 'honorarios_escrow', tipo: 'moneda', requerido: false, etiqueta: 'Honorarios escrow (USD)', default: 750 },
      ],
    },

    fechas: {
      etiqueta: 'Fechas y plazos',
      etiqueta_en: 'Dates and terms',
      campos: [
        { id: 'fecha_presentacion', tipo: 'fecha', requerido: true, etiqueta: 'Fecha de presentación de oferta' },
        { id: 'ciudad_presentacion', tipo: 'texto', requerido: true, etiqueta: 'Ciudad de presentación', default: 'Bucerias, Nayarit' },
        { id: 'fecha_vigencia', tipo: 'fecha', requerido: true, etiqueta: 'Fecha de vencimiento de oferta' },
        { id: 'hora_vigencia', tipo: 'texto', requerido: false, etiqueta: 'Hora de vencimiento', placeholder: 'Ej: 17:00 horas, medianoche', default: 'medianoche' },
        { id: 'fecha_formalizacion', tipo: 'texto', requerido: true, etiqueta: 'Fecha/rango de formalización', placeholder: 'cualquier día hábil dentro de las primeras dos semanas del mes de Mayo de 2023' },
        { id: 'fecha_formalizacion_en', tipo: 'texto', requerido: false, etiqueta: 'Formalización (inglés)', placeholder: 'any business day within the first two weeks of the month of May 2023' },
        { id: 'fecha_extension', tipo: 'texto', requerido: false, etiqueta: 'Extensión automática', placeholder: 'las primeras dos semanas del mes de Junio 2023' },
        { id: 'fecha_extension_en', tipo: 'texto', requerido: false, etiqueta: 'Extensión (inglés)' },
      ],
    },

    notario: {
      etiqueta: 'Notario designado',
      etiqueta_en: 'Designated notary',
      catalogo: [
        { id: 'careaga_12', nombre: 'Lic. Jorge Careaga Jiménez', numero: '12', ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'meza_29', nombre: 'Lic. Adán Meza Barajas', numero: '29', ciudad: 'Bucerías, Nayarit' },
        { id: 'ramirez_2', nombre: 'Lic. Teodoro Ramírez Valenzuela', numero: '2', ciudad: 'Bucerías, Nayarit' },
        { id: 'agraz_3', nombre: 'Lic. José Agraz Cabrales', numero: '3', ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'navarrete_1', nombre: 'Lic. Rafael Navarrete Castellanos', numero: '1', ciudad: 'Bucerías, Nayarit' },
        { id: 'leon_5', nombre: 'Lic. Ricardo León Gutiérrez', numero: '5', ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'otro', nombre: '', numero: '', ciudad: '' },
      ],
      campos: [
        { id: 'notario_seleccion', tipo: 'select', requerido: true, etiqueta: 'Notario', opciones: [
          { valor: 'careaga_12', texto: 'Notaría 12 — Lic. Jorge Careaga (PV, Jalisco)' },
          { valor: 'meza_29', texto: 'Notaría 29 — Lic. Adán Meza Barajas (Bucerías, Nay.)' },
          { valor: 'ramirez_2', texto: 'Notaría 2 — Lic. Teodoro Ramírez Valenzuela (Bucerías, Nay.)' },
          { valor: 'agraz_3', texto: 'Notaría 3 — Lic. José Agraz Cabrales (PV, Jalisco)' },
          { valor: 'navarrete_1', texto: 'Notaría 1 — Lic. Rafael Navarrete (Bucerías, Nay.)' },
          { valor: 'leon_5', texto: 'Notaría 5 — Lic. Ricardo León Gutiérrez (PV, Jalisco)' },
          { valor: 'otro', texto: 'Otro notario (captura manual)' },
        ] },
        { id: 'nombre_notario', tipo: 'texto', requerido: false, etiqueta: 'Nombre del notario (manual)', placeholder: 'Solo si seleccionaste "Otro"' },
        { id: 'numero_notaria', tipo: 'texto', requerido: false, etiqueta: 'Número de notaría (manual)' },
        { id: 'ciudad_notaria', tipo: 'texto', requerido: false, etiqueta: 'Ciudad (manual)' },
      ],
    },

    comision: {
      etiqueta: 'Comisión inmobiliaria',
      etiqueta_en: 'Real estate commission',
      visible_si: 'bloques.comision',
      campos: [
        { id: 'porcentaje_total', tipo: 'texto', requerido: true, etiqueta: 'Porcentaje total', default: '6%' },
        { id: 'incluye_iva', tipo: 'boolean', requerido: false, etiqueta: 'Más IVA (16%)', default: true },
        { id: 'agencia1_nombre', tipo: 'texto', requerido: true, etiqueta: 'Agencia 1 (nombre)' },
        { id: 'agencia1_porcentaje', tipo: 'texto', requerido: true, etiqueta: 'Agencia 1 (%)' },
        { id: 'agencia2_nombre', tipo: 'texto', requerido: false, etiqueta: 'Agencia 2 (nombre)' },
        { id: 'agencia2_porcentaje', tipo: 'texto', requerido: false, etiqueta: 'Agencia 2 (%)' },
      ],
    },

    penalidad: {
      etiqueta: 'Penalidad',
      etiqueta_en: 'Penalty clause',
      campos: [
        { id: 'porcentaje_penalidad', tipo: 'texto', requerido: true, etiqueta: 'Porcentaje de pena convencional', default: '10%' },
        { id: 'monto_penalidad', tipo: 'moneda', requerido: false, etiqueta: 'Monto penalidad', calculado: 'precio_total * 0.10' },
      ],
    },

    jurisdiccion: {
      etiqueta: 'Jurisdicción',
      etiqueta_en: 'Jurisdiction',
      campos: [
        { id: 'ciudad_jurisdiccion', tipo: 'texto', requerido: true, etiqueta: 'Ciudad de jurisdicción', default: 'Bucerias, Nayarit, México' },
      ],
    },

    coordinador: {
      etiqueta: 'Coordinador de cierre',
      etiqueta_en: 'Closing coordinator',
      campos: [
        { id: 'nombre_coordinador', tipo: 'texto', requerido: false, etiqueta: 'Nombre del coordinador', placeholder: 'Lic. Rolando Romero García' },
        { id: 'empresa_coordinador', tipo: 'texto', requerido: false, etiqueta: 'Empresa', placeholder: 'Expat Advisor MX' },
        { id: 'celular_coordinador', tipo: 'tel', requerido: false, etiqueta: 'Celular/WhatsApp' },
        { id: 'email_coordinador', tipo: 'email', requerido: false, etiqueta: 'Email' },
      ],
    },

    inspeccion: {
      etiqueta: 'Inspección del inmueble',
      etiqueta_en: 'Property inspection',
      visible_si: 'bloques.inspeccion',
      campos: [
        { id: 'dias_inspeccion', tipo: 'numero', requerido: true, etiqueta: 'Días naturales para inspección', default: 4 },
        { id: 'dias_revision', tipo: 'numero', requerido: true, etiqueta: 'Días naturales para revisión del reporte', default: 5 },
      ],
    },
  },

  // ============================================================
  // BLOQUES DEL CONTRATO
  // Cada bloque es una cláusula o grupo de cláusulas.
  // condicional: true → se puede activar/desactivar
  // siempre: true → no se puede quitar
  // ============================================================

  bloques: [

    // ---- CLÁUSULA 1: EL OFERTANTE ----
    {
      id: 'cl_ofertante',
      numero: 1,
      siempre: true,
      titulo: { es: 'EL OFERTANTE', en: 'THE OFFERER' },
      render: (ctx) => ({
        es: `${ctx.ofertante.referencia_negrita}, ${ctx.ofertante.comparecencia}, señalando como domicilio convencional para oir y recibir todo tipo de notificaciones el ubicado en ${ctx.ofertante.domicilio}.`,
        en: `${ctx.ofertante.en.referencia_negrita}, ${ctx.ofertante.comparecencia_en}, providing as conventional address to receive all kinds of notifications the one located at ${ctx.ofertante.domicilio}.`,
      }),
    },

    // ---- CLÁUSULA 2: LA PROPIETARIA ----
    {
      id: 'cl_propietario',
      numero: 2,
      siempre: true,
      tituloFn: true,
      render: (ctx) => ({
        titulo_es: `${ctx.propietario.referencia}`,
        titulo_en: `${ctx.propietario.en.referencia}`,
        es: `${ctx.propietario.referencia_negrita}, de nacionalidad ${ctx.propietario.nacionalidad}, en adelante ${ctx.propietario.referenciaConComillas_negrita}, ${ctx.propietario.quien} ${ctx.propietario.manifiesta} tener la capacidad jurídica necesaria para contratar en los términos del presente acuerdo, señalando como domicilio convencional el inmueble materia de la presente oferta.`,
        en: `${ctx.propietario.en.referencia_negrita}, of ${ctx.propietario.nacionalidad_en} nationality, hereinafter ${ctx.propietario.en.referenciaConComillas_negrita}, ${ctx.propietario.quien_en} state${ctx.propietario.clave === 'ms' || ctx.propietario.clave === 'fs' ? 's' : ''} that ${ctx.propietario.quien_en === 'who' ? 'she has' : 'they have'} the necessary legal capacity to contract under the terms of this agreement, indicating as conventional address the property object of the present offer.`,
      }),
    },

    // ---- BLOQUE CONDICIONAL: ADJUDICACIÓN DE CÓNYUGE ----
    {
      id: 'adjudicacion_conyuge',
      condicional: true,
      default: false,
      despues_de: 'cl_propietario',
      etiqueta: 'Adjudicación de derechos de cónyuge fallecido',
      etiqueta_en: 'Deceased spouse rights adjudication',
      campos_requeridos: [],
      render: (ctx) => ({
        es: `Así mismo manifiesta ${ctx.propietario.referencia_negrita} que simultáneamente a la venta actual, será adjudicataria del 50% de los derechos fideicomisarios que le correspondían a su difunto esposo, consolidándose el 100% de los derechos fideicomisarios en ella.`,
        en: `Likewise, ${ctx.propietario.en.referencia_negrita} states that simultaneously with the current sale, she will be adjudicated 50% of the trust rights that corresponded to her deceased husband, consolidating 100% of the trust rights in her.`,
      }),
    },

    // ---- CLÁUSULA 3: ANTECEDENTE DEL INMUEBLE ----
    {
      id: 'cl_antecedente',
      numero: 3,
      siempre: true,
      titulo: { es: 'ANTECEDENTE DEL INMUEBLE', en: 'THE PROPERTY' },
      render: (ctx) => {
        // Resolver inscripción registral según estado + tipo
        let inscripcionEs = '';
        let inscripcionEn = '';
        const estado = ctx.antecedente.estado_registro || 'nayarit';
        const tipo = ctx.antecedente.tipo_registro || 'folio_real';
        const rpp = `Registro Público de la Propiedad y de comercio de ${ctx.antecedente.ciudad_notaria_anterior}`;
        const rppEn = `Public Registry of Property and Commerce of ${ctx.antecedente.ciudad_notaria_anterior}`;

        if (tipo === 'folio_real' && ctx.antecedente.folio_real) {
          // Folio Real: Nayarit = "Folio Real Electrónico", Jalisco = "Folio Real"
          const frLabel = estado === 'nayarit' ? 'Folio Real Electrónico' : 'Folio Real';
          const frLabelEn = estado === 'nayarit' ? 'Electronic Real Folio' : 'Real Folio';
          inscripcionEs = `, Inscrito ante el ${rpp}, bajo ${frLabel} ${ctx.antecedente.folio_real}`;
          inscripcionEn = `, Registered before the ${rppEn}, under ${frLabelEn} ${ctx.antecedente.folio_real}`;
        } else if (tipo === 'legacy') {
          if (estado === 'nayarit' && ctx.antecedente.libro_rpp) {
            // Nayarit legacy: Libro, Sección, Serie, Partida
            inscripcionEs = `, Inscrito ante el ${rpp}, bajo Libro ${ctx.antecedente.libro_rpp}, Sección ${ctx.antecedente.seccion_rpp || ''}, Serie ${ctx.antecedente.serie_rpp || ''}, Partida ${ctx.antecedente.partida_rpp || ''}`;
            inscripcionEn = `, Registered before the ${rppEn}, under Book ${ctx.antecedente.libro_rpp}, Section ${ctx.antecedente.seccion_rpp || ''}, Series ${ctx.antecedente.serie_rpp || ''}, Entry ${ctx.antecedente.partida_rpp || ''}`;
          } else if (estado === 'jalisco' && ctx.antecedente.documento_rpp) {
            // Jalisco legacy: Documento, Folios, Libro, Sección
            inscripcionEs = `, Inscrito ante el ${rpp}, bajo Documento ${ctx.antecedente.documento_rpp}, Folios ${ctx.antecedente.folios_rpp || ''}, Libro ${ctx.antecedente.libro_jal || ''}, Sección ${ctx.antecedente.seccion_jal || ''}`;
            inscripcionEn = `, Registered before the ${rppEn}, under Document ${ctx.antecedente.documento_rpp}, Folios ${ctx.antecedente.folios_rpp || ''}, Book ${ctx.antecedente.libro_jal || ''}, Section ${ctx.antecedente.seccion_jal || ''}`;
          }
        }

        // Uso exclusivo (estacionamiento, bodega, servidumbre, etc.)
        const usoEs = ctx.inmueble.tiene_uso_exclusivo && ctx.inmueble.notas_uso_exclusivo
          ? `. A esta unidad le pertenece el uso exclusivo de ${ctx.inmueble.notas_uso_exclusivo}` : '';
        const usoEn = ctx.inmueble.tiene_uso_exclusivo && ctx.inmueble.notas_uso_exclusivo_en
          ? `. This unit has the exclusive use of ${ctx.inmueble.notas_uso_exclusivo_en}`
          : (ctx.inmueble.tiene_uso_exclusivo && ctx.inmueble.notas_uso_exclusivo ? `. This unit has the exclusive use of ${ctx.inmueble.notas_uso_exclusivo}` : '');

        // Clave catastral
        const catEs = ctx.inmueble.clave_catastral ? ` y clave catastral ${ctx.inmueble.clave_catastral}` : '';
        const catEn = ctx.inmueble.clave_catastral ? ` and cadastral key ${ctx.inmueble.clave_catastral}` : '';

        return {
          es: `Que en fecha ${ctx.antecedente.fecha_escritura_es}, mediante escritura pública ${ctx.antecedente.numero_escritura} ante ${ctx.antecedente.notario_anterior}, Notario Público ${ctx.antecedente.numero_notaria_anterior} de ${ctx.antecedente.ciudad_notaria_anterior}, adquirió los derechos fideicomisarios sobre el siguiente inmueble:\n\n${ctx.inmueble.descripcion_corta}, que se ubica ${ctx.inmueble.ubicacion_completa}${ctx.inmueble.nivel_torre ? ', ubicado en el ' + ctx.inmueble.nivel_torre : ''}${ctx.inmueble.descripcion_interior ? ' y consta de ' + ctx.inmueble.descripcion_interior : ''}, con una superficie de construcción de ${ctx.inmueble.superficie_m2} ${ctx.inmueble.superficie_letras} cuadrados${ctx.inmueble.indiviso ? ', le corresponde un indiviso del ' + ctx.inmueble.indiviso + ' por ciento de las áreas comunes' : ''}${usoEs}, y tiene las medidas y linderos descritos en la escritura antes mencionada${inscripcionEs}${ctx.antecedente.cuenta_predial ? ', Cuenta Predial ' + ctx.antecedente.cuenta_predial : ''}${catEs} (en lo sucesivo referido como EL INMUEBLE).`,
          en: `That on date ${ctx.antecedente.fecha_escritura_en}, by way of deed ${ctx.antecedente.numero_escritura} before ${ctx.antecedente.notario_anterior}, Notary Public ${ctx.antecedente.numero_notaria_anterior} of ${ctx.antecedente.ciudad_notaria_anterior}, acquired the trust rights over the following property:\n\n${ctx.inmueble.descripcion_corta}, located ${ctx.inmueble.ubicacion_completa}${ctx.inmueble.nivel_torre ? ', on the ' + ctx.inmueble.nivel_torre : ''}${ctx.inmueble.descripcion_interior ? ' consisting of ' + ctx.inmueble.descripcion_interior : ''}, with a construction area of ${ctx.inmueble.superficie_m2} ${ctx.inmueble.superficie_letras} square meters${ctx.inmueble.indiviso ? ', corresponding to an undivided ' + ctx.inmueble.indiviso + ' percent of the common areas' : ''}${usoEn}, with the measurements and boundaries described in the aforementioned deed${inscripcionEn}${ctx.antecedente.cuenta_predial ? ', Property Tax Account ' + ctx.antecedente.cuenta_predial : ''}${catEn} (hereinafter referred to as THE PROPERTY).`,
        };
      },
    },

    // ---- CLÁUSULA 4: PRECIO Y CONDICIONES DE PAGO ----
    {
      id: 'cl_precio',
      numero: 4,
      siempre: true,
      titulo: { es: 'PRECIO Y CONDICIONES DE PAGO', en: 'PRICE AND PAYMENT TERMS' },
      render: (ctx) => ({
        es: `${ctx.ofertante.referencia_negrita} por medio de la presente ofrece a ${ctx.propietario.referencia_negrita} celebrar Contrato Traslativo de Dominio Irrevocable en relación a los derechos de propiedad sobre el INMUEBLE arriba descrito en la cantidad total de ${ctx.precio.completo}. Precio este que será liquidado de la siguiente manera:`,
        en: `${ctx.ofertante.en.referencia_negrita} herein offers to ${ctx.propietario.en.referencia_negrita} to celebrate an Irrevocable Transfer of Domain Contract with regard to the ownership rights entailed to THE PROPERTY above described in the total amount of ${ctx.precio.completo}. Said price will be paid in the following manner:`,
      }),
    },

    // ---- SUB-BLOQUE 4A: ESCROW ----
    {
      id: 'escrow',
      condicional: true,
      default: true,
      despues_de: 'cl_precio',
      sub_clausula: 'A',
      etiqueta: 'Depósito en cuenta Escrow',
      etiqueta_en: 'Escrow account deposit',
      campos_requeridos: ['deposito_escrow', 'empresa_escrow', 'dias_deposito'],
      render: (ctx) => ({
        es: `A) a fin de garantizar el cumplimiento de las obligaciones que se deriven del presente contrato, ${ctx.ofertante.referenciaConComillas} realizará, una transferencia bancaria a la cuenta escrow aperturada para tal efecto con ${ctx.escrow.empresa_escrow} por la cantidad de ${ctx.deposito.completo}, ${ctx.precio.plazo_deposito_es}, con el propósito de constituir un Depósito Condicional Irrevocable (Cuenta Escrow), en el cual ${ctx.propietario.referenciaConComillas} fungirá como BENEFICIARIA y que se sujetará a las condiciones que para el efecto se establecen en el contrato correspondiente, cuya copia se adjuntará a la presente oferta como ANEXO B (Escrow Agreement).`,
        en: `A) in order to guarantee the fulfillment of the obligations derived from the present contract, ${ctx.ofertante.en.referenciaConComillas} will wire the amount of ${ctx.deposito.completo}, ${ctx.precio.plazo_deposito_en}, to the escrow account opened for said effect with ${ctx.escrow.empresa_escrow} to constitute an Irrevocable Conditional Deposit (Escrow Account), in which ${ctx.propietario.en.referenciaConComillas} will be designated as BENEFICIARY and which will be subject to the conditions that for the purpose are specified in the corresponding contract, a copy of which will be attached to the present offer as ADDENDUM B (Escrow Agreement).`,
      }),
    },

    // ---- SUB-BLOQUE 4B: SALDO ----
    {
      id: 'cl_saldo',
      siempre: true,
      despues_de: 'escrow',
      sub_clausula: 'B',
      render: (ctx) => ({
        es: `B) La cantidad restante, o sea ${ctx.saldo.completo}, deberá ser pagada ${ctx.bloques.escrow ? 'mediante transferencia a la cuenta asignada por la empresa depositaria, ' : ''}al menos ${ctx.precio.dias_saldo_letras} (${ctx.precio.dias_saldo}) días hábiles anteriores a la FECHA DE FORMALIZACIÓN, la cual se estipula más adelante.`,
        en: `B) The balance, that is ${ctx.saldo.completo}, shall be paid ${ctx.bloques.escrow ? 'by wire transfer to the account assigned by the escrow company, ' : ''}at least ${ctx.precio.dias_saldo_letras_en} (${ctx.precio.dias_saldo}) business days prior to THE FORMALIZING DATE which is stipulated below.`,
      }),
    },

    // ---- CLÁUSULA 5: VIGENCIA ----
    {
      id: 'cl_vigencia',
      numero: 5,
      siempre: true,
      titulo: { es: 'TÉRMINO DE VIGENCIA', en: 'TERM OF EFFECT' },
      render: (ctx) => ({
        es: `La presente oferta estará vigente hasta la ${ctx.fechas.vencimiento_es}.`,
        en: `This Offer is in effect until ${ctx.fechas.vencimiento_en}.`,
      }),
    },

    // ---- CLÁUSULA 6: FECHA DE FORMALIZACIÓN ----
    {
      id: 'cl_formalizacion',
      numero: 6,
      siempre: true,
      titulo: { es: 'FECHA DE FORMALIZACIÓN', en: 'THE FORMALIZING DATE' },
      render: (ctx) => ({
        es: `Habiendo aceptado ${ctx.propietario.referencia_negrita} la presente oferta dentro del TÉRMINO DE VIGENCIA, las partes señalan como fecha de formalización del contrato definitivo en escritura pública en favor de ${ctx.ofertante.referencia_negrita}, o de la persona física o moral que éste designe, ${ctx.fechas.fecha_formalizacion}.`,
        en: `Once ${ctx.propietario.en.referencia_negrita} have accepted the present offer within the TERM OF EFFECT, the parties agree the formalizing date of the definitive contract in a public deed in favor of ${ctx.ofertante.en.referencia_negrita}, or of the natural person or corporation that he designates, ${ctx.fechas.fecha_formalizacion_en}.`,
      }),
    },

    // ---- CLÁUSULA 7: DEMORA ----
    {
      id: 'cl_demora',
      numero: 7,
      siempre: true,
      titulo: { es: 'DEMORA EN LA FECHA DE FORMALIZACIÓN', en: 'DELAY ON THE FORMALIZING DATE' },
      render: (ctx) => ({
        es: `En caso de que por causas no imputables a las partes se produjera un retraso en los procedimientos burocráticos necesarios para la formalización de la escritura pública correspondiente, o demora por parte del fiduciario, que impidiera que esta se llevara a cabo en FECHA DE FORMALIZACIÓN, dicha fecha quedaría automáticamente extendida hasta un mes después, es decir, hasta ${ctx.fechas.fecha_extension || 'dentro de las primeras dos semanas del mes siguiente'}.`,
        en: `In the event that for reasons not attributable to the parties occur a delay at the bureaucratic procedures, or delay by the bank, necessary for the formalization of the corresponding public deed, preventing that this will take place on THE FORMALIZING DATE, that date would be automatically extended one more month, that is to say, within ${ctx.fechas.fecha_extension_en || 'the first two weeks of the following month'}.`,
      }),
    },

    // ---- CLÁUSULA 8: NOTARIO ----
    {
      id: 'cl_notario',
      numero: 8,
      siempre: true,
      titulo: { es: 'NOTARIO PÚBLICO DESIGNADO', en: 'DESIGNATION OF PUBLIC NOTARY' },
      render: (ctx) => ({
        es: `Dicha escritura pública se celebrará ante la fe del ${ctx.notario.nombre_notario}, Notario Público ${ctx.notario.numero_notaria} de ${ctx.notario.ciudad_notaria}.`,
        en: `Said public deed will be conveyed before the faith of ${ctx.notario.nombre_notario}, Notary Public ${ctx.notario.numero_notaria} of ${ctx.notario.ciudad_notaria}.`,
      }),
    },

    // ---- CLÁUSULA 9: GASTOS DE ESCRITURACIÓN ----
    {
      id: 'cl_gastos',
      numero: 9,
      siempre: true,
      titulo: { es: 'GASTOS DE ESCRITURACIÓN', en: 'CLOSING COSTS' },
      render: (ctx) => {
        const escrowFee = ctx.bloques.escrow && ctx.escrow.honorarios_completo
          ? `, así como los honorarios por concepto de la CUENTA ESCROW por la cantidad de ${ctx.escrow.honorarios_completo.completo}`
          : (ctx.bloques.escrow ? ', así como los honorarios por concepto de la CUENTA ESCROW' : '');
        const escrowFeeEn = ctx.bloques.escrow && ctx.escrow.honorarios_completo
          ? `, including the ESCROW ACCOUNT fees in the amount of ${ctx.escrow.honorarios_completo.completo}`
          : (ctx.bloques.escrow ? ', including the ESCROW ACCOUNT fees' : '');
        const anticipo = ctx.precio.anticipo_gastos > 0
          ? `\n\n${ctx.ofertante.referencia_negrita} deberá establecer de inmediato con el Notario Público designado un anticipo de gastos de escrituración por la cantidad de ${ctx.precio.anticipo_completo.completo}, a fin de poder llevar a cabo dentro del término establecido los trámites correspondientes, abonando el saldo pendiente en la FECHA DE FORMALIZACIÓN.`
          : '';
        const anticipoEn = ctx.precio.anticipo_gastos > 0
          ? `\n\n${ctx.ofertante.en.referencia_negrita} shall immediately provide the designated Notary Public with a deposit for closing costs in the amount of ${ctx.precio.anticipo_completo.completo}, in order to convey within the term established the corresponding legal procedures, the balance shall be paid on THE FORMALIZING DATE.`
          : '';
        return {
          es: `Los gastos, impuestos y honorarios notariales de formalización del contrato definitivo, los cuales comúnmente se conocen como GASTOS DE ESCRITURACIÓN serán por cuenta de ${ctx.ofertante.referencia_negrita}${escrowFee}.${anticipo}`,
          en: `The expenses, taxes and Notary's fee for formalizing of the definitive contract, which are customarily known as CLOSING COSTS, will be at the expense of ${ctx.ofertante.en.referencia_negrita}${escrowFeeEn}.${anticipoEn}`,
        };
      },
    },

    // ---- CLÁUSULA 10: ISR ----
    {
      id: 'cl_isr',
      numero: 10,
      siempre: true,
      titulo: { es: 'IMPUESTO SOBRE LA RENTA', en: 'CAPITAL GAINS TAX' },
      render: (ctx) => ({
        es: `Será a cargo de ${ctx.propietario.referencia_negrita} el Impuesto Sobre la Renta a que hubiere lugar.\n\nAsí mismo, será a cargo de ${ctx.propietario.referencia_negrita}, los honorarios fiduciarios por firma de cesión de derechos y adjudicación, y deberá estar al corriente de honorarios fiduciarios por anualidad.`,
        en: `${ctx.propietario.en.referencia_negrita} will be responsible for the payment of the corresponding Capital Gains Tax.\n\nLikewise, the fiduciary fees for the transfer of rights agreement and adjudication, will be the responsibility of THE SELLERS, and they must be current with the fiduciary fees for the annual period.`,
      }),
    },

    // ---- CLÁUSULA 11: DOCUMENTACIÓN ----
    {
      id: 'cl_documentacion',
      numero: 11,
      siempre: true,
      titulo: { es: 'DOCUMENTACIÓN E INFORMACIÓN', en: 'DOCUMENTATION AND INFORMATION' },
      render: (ctx) => ({
        es: `Ambas partes deberán entregar al Notario Público designado con toda diligencia toda la documentación e información que él mismo les solicite para el buen cumplimiento de su encargo.`,
        en: `Both parties, shall diligently provide the designated Public Notary with all the data and documents that he would directly require for the fulfillment of their duty.`,
      }),
    },

    // ---- CLÁUSULA 12: LIBERTAD DE GRAVÁMENES ----
    {
      id: 'cl_gravamenes',
      numero: 12,
      siempre: true,
      titulo: { es: 'LIBERTAD DE CARGAS, GRAVÁMENES Y DEMÁS OBLIGACIONES', en: 'FREE OF ANY LIENS, ENCUMBRANCES AND OTHER LIABILITIES' },
      render: (ctx) => ({
        es: `La trasmisión de dominio operará libre de toda carga, gravamen, obligación fiscal, laboral o sindical, al corriente en el pago de: toda clase de contribuciones, cooperaciones, o plusvalías, pago de todos tipos de servicios (electricidad, agua, drenaje...). Así mismo ${ctx.propietario.referencia_negrita} será responsable de cualquier relación laboral con los empleados, en su caso, que de manera privada presten o hayan prestado sus servicios en EL INMUEBLE con anterioridad a la FECHA DE FORMALIZACIÓN, y será también responsable del despido y pago de la indemnización que corresponda a los mismos ante la Junta de Conciliación y Arbitraje, debiendo acreditar fehacientemente dicho pago, en su caso.`,
        en: `The transfer of domain shall be conveyed free of any liens, encumbrances, fiscal obligations, labor or union liabilities; current in the payment of all kinds of contributions, cooperations or plus values; current as well in the payment of all kinds of services (power, water, sewage...). ${ctx.propietario.en.referencia_negrita} shall also be responsible of any labor relationship with the employees that in a privately manner render or have rendered their services at THE PROPERTY before the FORMALIZING DATE and will also be responsible for the dismissal and payment of the corresponding compensation to them before the Board of Conciliation and Arbitration, and must prove irrefutably such payment, in its case.`,
      }),
    },

    // ---- CLÁUSULA 13: POSESIÓN ----
    {
      id: 'cl_posesion',
      numero: 13,
      siempre: true,
      titulo: { es: 'POSESIÓN', en: 'POSSESSION' },
      render: (ctx) => ({
        es: `La posesión material y jurídica de EL INMUEBLE será a la FECHA DE FORMALIZACIÓN.`,
        en: `The legal and material possession of THE PROPERTY shall be at FORMALIZING DATE.`,
      }),
    },

    // ---- CLÁUSULA: CONDICIÓN GENERAL Y ESTADO DE USO ----
    {
      id: 'condicion_uso',
      condicional: true,
      default: true,
      etiqueta: 'Condición general y estado de uso del inmueble',
      etiqueta_en: 'Property condition and state of use',
      render: (ctx) => ({
        es: `La posesión material de EL INMUEBLE se entregará en LA FECHA DE FORMALIZACIÓN en el mismo estado y condición general en que se encuentre en la fecha de la inspección realizada por ${ctx.ofertante.referencia}. ${ctx.ofertante.referencia} entiende que, debido a la edad de EL INMUEBLE y sus equipos, las garantías anteriormente aplicables han caducado y que tienen evidencia de un uso y desgaste normal; sin embargo, deberán entregarse en buen funcionamiento.`,
        en: `The physical possession of THE PROPERTY will be delivered on THE FORMALIZING DATE, in the same state and general maintenance condition as of the date of inspection conveyed by ${ctx.ofertante.en.referencia}. ${ctx.ofertante.en.referencia} understand that, due to the age of THE PROPERTY and appliances, the installations carry no warranties and that have evidence of normal wear and use; however, everything must be in good working conditions.`,
      }),
    },

    // ---- CLÁUSULA 14: CONTRATO BILATERAL ----
    {
      id: 'cl_bilateral',
      numero: 14,
      siempre: true,
      titulo: { es: 'CONTRATO BILATERAL OBLIGATORIO', en: 'BINDING BILATERAL CONTRACT' },
      render: (ctx) => ({
        es: `A la aceptación de la presente oferta por ${ctx.propietario.referencia} mediante su firma al calce y dentro del TÉRMINO DE VIGENCIA establecido en el punto número 6, la presente propuesta unilateral se convertirá en contrato bilateral obligatorio para ambas partes, las cuales se regirán por los términos y condiciones aquí estipulados, quedando ambas partes obligadas a concurrir en la fecha establecida a la firma de la escritura pública correspondiente ante el Notario Público designado.`,
        en: `Upon acceptance of the present offer by ${ctx.propietario.en.referencia} and by means of her signature below and within the TERM OF EFFECT established in point number 6, this unilateral proposal will become a legally binding contract compulsory for both parties, which will be governed by the terms and conditions herein stipulated, and both parties will be then obliged to attend on the established date, to sign the corresponding public deed before the designated Public Notary.`,
      }),
    },

    // ---- CLÁUSULA 15: CONDICIONES INDISPENSABLES ----
    {
      id: 'cl_condiciones',
      numero: 15,
      siempre: true,
      titulo: { es: 'CONDICIONES INDISPENSABLES PARA LA VALIDEZ DE LA PRESENTE OFERTA', en: 'INDISPENSABLE CONDITIONS FOR THE VALIDITY OF THE PRESENT OFFER' },
      render: (ctx) => ({
        es: `Esta oferta, para su validez, está sujeta a la siguiente condición:`,
        en: `This offer, for its validity, is subject to the following condition:`,
      }),
    },

    // ---- SUB-BLOQUE 15A: INSPECCIÓN ----
    {
      id: 'inspeccion',
      condicional: true,
      default: true,
      despues_de: 'cl_condiciones',
      sub_clausula: 'A',
      etiqueta: 'Inspección física del inmueble',
      etiqueta_en: 'Physical property inspection',
      campos_requeridos: ['dias_inspeccion', 'dias_revision'],
      render: (ctx) => ({
        es: `A) Que ${ctx.ofertante.referenciaConComillas} obtenga, pagado por él, dentro de los siguientes ${ctx.inspeccion.dias_inspeccion_letras} (${ctx.inspeccion.dias_inspeccion}) días naturales después de aceptada la presente oferta, cualquier inspección que ${ctx.ofertante.referenciaConComillas} estime ser necesario y razonable con la finalidad de que verifique la condición general de la propiedad, incluyendo, sin límite, la integridad estructural del inmueble; así como instalaciones eléctricas, sanitarias de plomería, gas y electrodomésticos, en su caso. ${ctx.ofertante.referenciaConComillas} tendrá ${ctx.inspeccion.dias_revision_letras} (${ctx.inspeccion.dias_revision}) días naturales más a partir de recibido el reporte para su revisión y aprobación. En caso de rechazarlo, avisará a ${ctx.propietario.referencia}, y ésta oferta será considerada cancelada y las partes quedarán, por lo tanto, liberadas de cualquier obligación derivada del presente contrato. Si dicho aviso no lo recibe ${ctx.propietario.referenciaConComillas} por parte de ${ctx.ofertante.referencia} dentro de dicha fecha, la condición aquí especificada se tendrá por totalmente satisfecha.`,
        en: `A) That ${ctx.ofertante.en.referenciaConComillas} obtain, paid by her, within the following ${ctx.inspeccion.dias_inspeccion_letras_en} (${ctx.inspeccion.dias_inspeccion}) calendar days after acceptance of this offer, any inspection that ${ctx.ofertante.en.referenciaConComillas} deems to be necessary and reasonable in order to verify the general condition of the property, including, without limitation, the structural integrity of the property; as well as electrical installations, sanitary plumbing, gas and electrical appliances, if applicable. ${ctx.ofertante.en.referenciaConComillas} will have ${ctx.inspeccion.dias_revision_letras_en} (${ctx.inspeccion.dias_revision}) more calendar days from receipt of the report for review and approval. In case of rejection, it will notify ${ctx.propietario.en.referencia}, and this offer will be considered canceled and the parties will be, therefore, released from any obligation derived from this contract. If said notice is not received by ${ctx.propietario.en.referenciaConComillas} from ${ctx.ofertante.en.referencia} within said date, the condition specified herein shall be deemed fully satisfied.`,
      }),
    },

    // ---- SUB-BLOQUE 15B: DOCUMENTACIÓN DE FIDEICOMISO ----
    {
      id: 'doc_fideicomiso',
      condicional: true,
      default: true,
      despues_de: 'inspeccion',
      sub_clausula: 'B',
      etiqueta: 'Entrega de documentación del fideicomiso',
      etiqueta_en: 'Trust documentation delivery',
      render: (ctx) => ({
        es: `B) Que ${ctx.propietario.referencia} envíe a ${ctx.ofertante.referencia_negrita} copia completa de EL FIDEICOMISO original a que hace referencia el punto 3 de la presente oferta, así como copia simple de las dos últimas actas de asambleas del condominio y sus estados financieros.`,
        en: `B) That ${ctx.propietario.en.referencia} send ${ctx.ofertante.en.referencia_negrita} a complete copy of THE ORIGINAL TRUST referred to in point 3 of this offer, as well as a simple copy of the last two condominium assembly minutes and their financial statements.`,
      }),
    },

    // ---- CLÁUSULA 16: COMISIÓN ----
    {
      id: 'comision',
      numero: 16,
      condicional: true,
      default: true,
      etiqueta: 'Comisión inmobiliaria',
      titulo: { es: 'COMISIÓN INMOBILIARIA', en: 'REAL ESTATE COMMISSION' },
      campos_requeridos: ['porcentaje_total', 'agencia1_nombre', 'agencia1_porcentaje'],
      render: (ctx) => {
        const iva = ctx.comision.incluye_iva ? ' más IVA (16%)' : '';
        const ivaEn = ctx.comision.incluye_iva ? ' plus VAT (16%)' : '';
        const division = ctx.comision.agencia2_nombre
          ? `, que se dividirá entre ${ctx.comision.agencia1_nombre} (${ctx.comision.agencia1_porcentaje}) y ${ctx.comision.agencia2_nombre} (${ctx.comision.agencia2_porcentaje})`
          : `, que será pagada a ${ctx.comision.agencia1_nombre}`;
        const divisionEn = ctx.comision.agencia2_nombre
          ? `, which will be divided between ${ctx.comision.agencia1_nombre} (${ctx.comision.agencia1_porcentaje}) and ${ctx.comision.agencia2_nombre} (${ctx.comision.agencia2_porcentaje})`
          : `, which will be paid to ${ctx.comision.agencia1_nombre}`;

        return {
          es: `${ctx.propietario.referencia_negrita} deberá pagar, por concepto de comisión inmobiliaria la cantidad del ${ctx.comision.porcentaje_total} (${ctx.comision.porcentaje_total_letras})${iva}, sobre el precio de operación${division}.`,
          en: `${ctx.propietario.en.referencia_negrita} shall pay a real estate commission of ${ctx.comision.porcentaje_total} (${ctx.comision.porcentaje_total_letras_en})${ivaEn}, based on the transaction price${divisionEn}.`,
        };
      },
    },

    // ---- CLÁUSULA 17: EMAIL ----
    {
      id: 'cl_email',
      numero: 17,
      siempre: true,
      titulo: { es: 'COMUNICACIONES POR CORREO ELECTRÓNICO (EMAIL)', en: 'ELECTRONIC MAIL COMMUNICATION (EMAIL)' },
      render: (ctx) => {
        const coord = ctx.coordinador?.nombre_coordinador
          ? `\n\nCOORDINADOR DE CIERRE / CLOSING COORDINATOR: ${ctx.coordinador.nombre_coordinador}${ctx.coordinador.empresa_coordinador ? ' — ' + ctx.coordinador.empresa_coordinador : ''}; Celular/Whatsapp: ${ctx.coordinador.celular_coordinador || ''}; Email: ${ctx.coordinador.email_coordinador || ''}`
          : '';
        const coordEn = ctx.coordinador?.nombre_coordinador
          ? `\n\nCLOSING COORDINATOR: ${ctx.coordinador.nombre_coordinador}${ctx.coordinador.empresa_coordinador ? ' — ' + ctx.coordinador.empresa_coordinador : ''}; Phone/Whatsapp: ${ctx.coordinador.celular_coordinador || ''}; Email: ${ctx.coordinador.email_coordinador || ''}`
          : '';
        return {
          es: `Las comunicaciones entre las partes relacionadas con la presente oferta por email y whatsapp serán consideradas como documental privada siempre y cuando éstas indiquen la fecha y la hora que fueron enviadas y contengan el nombre y firma del remitente.\n\nPara este efecto, las partes señalan las siguientes direcciones electrónicas:\n\n${ctx.ofertante.referencia_negrita}: Celular/Whatsapp: ${ctx.ofertante.celular}; Email: ${ctx.ofertante.email}\n\n${ctx.propietario.referencia_negrita}: Celular/Whatsapp: ${ctx.propietario.celular}; Email: ${ctx.propietario.email}${coord}\n\nNo obstante, los contratos deberán ser remitidos a las partes con firma original en el plazo no mayor a 15 días naturales siguientes a la fecha en que se suscriban vía correo electrónico.`,
          en: `Communications by email or whatsapp among the parties related to the present offer will be considered as valid evidence provided that those indicate the date and time when they were sent as well as the name and signature of the sender.\n\nTo this effect, the parties point out the following email addresses:\n\n${ctx.ofertante.en.referencia_negrita}: Phone/Whatsapp: ${ctx.ofertante.celular}; Email: ${ctx.ofertante.email}\n\n${ctx.propietario.en.referencia_negrita}: Phone/Whatsapp: ${ctx.propietario.celular}; Email: ${ctx.propietario.email}${coordEn}\n\nHowever, contracts must be sent to the parties with original signature in the term no later than 15 calendar days following the date they are subscribed via email.`,
        };
      },
    },

    // ---- CLÁUSULA 18: PENALIDAD ----
    {
      id: 'cl_penalidad',
      numero: 18,
      siempre: true,
      titulo: { es: 'PENALIDAD', en: 'PENALTY CLAUSE' },
      render: (ctx) => ({
        es: `Si la presente oferta es aceptada por ${ctx.propietario.referenciaConComillas}, la condición indispensable a la cuál se supedita su validez fuera satisfecha; y no obstante, una de las partes incumpliera las condiciones o términos de la presente oferta o bien decidiera o se viera impedida de formalizar el contrato definitivo, la parte responsable abonará a la otra la cantidad equivalente al ${ctx.penalidad.porcentaje_penalidad} de la oferta ${ctx.penalidad.completo} por concepto de pena convencional.\n\nEn caso de que ${ctx.ofertante.referencia_negrita} hubiera depositado a la cuenta escrow e incumpliere, ambas partes firmarán la instrucción al escrow para liberar los fondos y de ahí pagarse a ${ctx.propietario.referencia_negrita} dicha pena convencional.\n\nAsí mismo, de ser ${ctx.propietario.referencia_negrita} quien incumpla, y de haberse depositado a la cuenta escrow fondos, estos deberán ser liberados por ambas partes a ${ctx.ofertante.referencia_negrita} y añadírseles por parte de ${ctx.propietario.referencia_negrita}, por concepto de pena convencional la cantidad aquí pactada.\n\nEl pago de dicha pena convencional liberará automáticamente a las partes de cualquier otra obligación o responsabilidad derivada de la presente oferta.`,
        en: `If the present Offer is accepted by ${ctx.propietario.en.referenciaConComillas}; the indispensable condition for its validity set forth is satisfied; and, notwithstanding, one of the parties fails to comply with the terms and conditions herein established, or shall decide, or shall be impeded to formalize the definitive contract, the responsible party will be obligated to pay the other the total amount of ${ctx.penalidad.completo}.\n\nIn case ${ctx.ofertante.en.referencia_negrita} had deposited into the escrow account and failed to comply, both parties will sign the instruction to release the funds to pay ${ctx.propietario.en.referencia_negrita} the agreed penalty.\n\nLikewise, if ${ctx.propietario.en.referencia_negrita} fail to comply and funds have been deposited into the escrow account, both parties must release the funds to ${ctx.ofertante.en.referencia_negrita} and add, by ${ctx.propietario.en.referencia_negrita}, to them the amount agreed upon as a penalty.\n\nThe payment of said penalty will liberate the parties of any further obligation or responsibility, and the present offer will be automatically canceled and null in all its effects.`,
      }),
    },

    // ---- CLÁUSULA: FACTURA COMPLEMENTARIA (solo persona moral mexicana) ----
    {
      id: 'factura_complementaria',
      condicional: true,
      default: false,
      despues_de: 'cl_penalidad',
      etiqueta: 'Factura complementaria (vendedor persona moral mexicana)',
      etiqueta_en: 'Complementary invoice (Mexican corporate seller)',
      render: (ctx) => ({
        es: `${ctx.propietario.referencia_negrita}, en su carácter de persona moral mexicana, se obliga a emitir y entregar a ${ctx.ofertante.referencia} la Factura Complementaria correspondiente (archivos PDF y XML) dentro de los 30 (treinta) días naturales posteriores a LA FECHA DE FORMALIZACIÓN, en la cual se describa EL INMUEBLE y el precio de venta del mismo. Dicha Factura Complementaria es actualmente un requerimiento como prueba del costo de adquisición para la deducción en Impuesto Sobre la Renta (ISR) en caso de que ${ctx.ofertante.referencia} quisiere vender la propiedad en el futuro. Si ${ctx.ofertante.referencia} no recibiera dicha Factura Complementaria dentro del plazo señalado, será responsabilidad de ${ctx.propietario.referencia} proporcionarla a la brevedad posible.`,
        en: `${ctx.propietario.en.referencia_negrita}, as a Mexican legal entity, is obligated to issue and deliver to ${ctx.ofertante.en.referencia} the corresponding Complementary Invoice (PDF and XML files) within 30 (thirty) calendar days after THE FORMALIZING DATE, describing THE PROPERTY and its sale price. Said Complementary Invoice is currently required as proof of acquisition cost for Capital Gains Tax deduction in the event ${ctx.ofertante.en.referencia} wishes to sell the property in the future. If ${ctx.ofertante.en.referencia} does not receive said Complementary Invoice within the specified period, it shall be ${ctx.propietario.en.referencia}'s responsibility to provide it as soon as possible.`,
      }),
    },

    // ---- CLÁUSULA: CASO FORTUITO Y FUERZA MAYOR ----
    {
      id: 'fuerza_mayor',
      condicional: true,
      default: true,
      etiqueta: 'Caso fortuito y fuerza mayor',
      etiqueta_en: 'Acts of God and force majeure',
      render: (ctx) => ({
        es: `En caso de fallecimiento de alguna de las partes, la presente oferta prevalecerá en todos sus términos, continuándose con el(los) beneficiario(s) sustituto(s) de las partes: para el caso de ${ctx.propietario.referencia} se continuará con los beneficiarios designados en su escritura de fideicomiso y para el caso de ${ctx.ofertante.referencia} la que éste en su momento designe.\n\nNo obstante, en caso de desastres naturales, la presente oferta se cancelará sin aplicar penalidad alguna a cargo de las partes, las cuales quedarán liberadas de cualquier obligación contractual derivada de la presente oferta. En dicho caso, cualquier cantidad que haya sido pagada antes de la FECHA DE FORMALIZACIÓN le será reembolsada a los beneficiarios de ${ctx.ofertante.referencia}.`,
        en: `In the event of death of any of the parties herein, the present offer shall prevail in all its terms, continuing with their substitute beneficiary(ies): for ${ctx.propietario.en.referencia}, with the substitute beneficiaries designated in their bank trust deed, and for ${ctx.ofertante.en.referencia}, with the beneficiary designated for this purpose.\n\nNotwithstanding, in the event of a natural disaster, the present offer will be cancelled without applying any penalty to any of the parties, which will be released from any contractual obligation derived from the present offer. In this event, any funds paid prior to THE FORMALIZING DATE will be refunded to the beneficiaries of ${ctx.ofertante.en.referencia}.`,
      }),
    },

    // ---- CLÁUSULA: DECLARACIÓN / DISCLOSURE ----
    {
      id: 'disclosure',
      condicional: true,
      default: false,
      etiqueta: 'Declaración / Disclosure (deslinde de agencia y notario)',
      etiqueta_en: 'Disclosure statement (agency and notary hold harmless)',
      render: (ctx) => ({
        es: `${ctx.ofertante.referencia} y ${ctx.propietario.referencia} reconocen que el Notario Público Designado es neutro y no actuará como representante legal de las partes. Así mismo, la(s) Agencia(s) de Bienes Raíces que participa(n) en esta operación dará(n) asesoría en materia de bienes raíces e inmobiliaria y no pretende(n) dar asesoría ni representación de naturaleza jurídica, fiscal o de contaduría. La(s) Agencia(s) de Bienes Raíces recomienda(n) que ambas partes contraten profesionales independientes, tales como abogados, fiscalistas y/o contadores, para revisar esta operación, y ambas partes liberan a la(s) Agencia(s) de Bienes Raíces de cualquier responsabilidad en el caso de daños o perjuicios sufridos como resultado de no haber consultado dichos profesionales independientes.`,
        en: `${ctx.ofertante.en.referencia} and ${ctx.propietario.en.referencia} recognize that the Designated Public Notary is a neutral third party and shall not act as legal representative of either party. At the same time, the Real Estate Agency(ies) participating in this transaction shall provide real estate brokerage and consultation services and shall not purport to give advice or representation of a legal, fiscal or accounting nature. The Real Estate Agency(ies) recommend that both parties contract independent professionals such as attorneys, tax planners and/or accountants in connection with the present transaction, and both parties shall hold the Real Estate Agency(ies) harmless in the event of damages that may be caused by the failure to seek such independent professional service.`,
      }),
    },

    // ---- CLÁUSULA 19: JURISDICCIÓN ----
    {
      id: 'cl_jurisdiccion',
      numero: 19,
      siempre: true,
      titulo: { es: 'JURISDICCIÓN', en: 'JURISDICTION' },
      render: (ctx) => ({
        es: `Para la interpretación y cumplimiento de la presente Oferta, las partes acuerdan someterse a la Jurisdicción de los juzgados de la Ciudad de ${ctx.jurisdiccion.ciudad_jurisdiccion}, renunciando al fuero que pudiera corresponderles en virtud de sus domicilios presentes o futuros.`,
        en: `For the interpretation and execution of the present offer, the parties herein will be submitted to the jurisdiction of the courts of the City of ${ctx.jurisdiccion.ciudad_jurisdiccion}, waiving their rights that may correspond to them by virtue of their present or future domiciles.`,
      }),
    },

    // ---- CIERRE: LUGAR Y FECHA ----
    {
      id: 'cl_cierre',
      siempre: true,
      render: (ctx) => ({
        es: `La presente oferta se presenta en la población de ${ctx.fechas.ciudad_presentacion}, el día ${ctx.fechas.fecha_presentacion_es}.`,
        en: `The present offer is presented in ${ctx.fechas.ciudad_presentacion}, on ${ctx.fechas.fecha_presentacion_en}.`,
      }),
    },

    // ---- NOTA DE IDIOMA ----
    {
      id: 'cl_nota_idioma',
      siempre: true,
      render: (ctx) => ({
        es: ctx.meta.nota_idioma.es,
        en: ctx.meta.nota_idioma.en,
      }),
    },

    // ---- FIRMAS ----
    {
      id: 'cl_firmas',
      siempre: true,
      tipo: 'firmas',
      render: (ctx) => ({
        firmas: [
          {
            nombre: ctx.ofertante.nombres,
            rol_es: `${ctx.ofertante.referencia} / ${ctx.ofertante.en.referencia}`,
          },
          {
            nombre: ctx.propietario.nombres,
            rol_es: `${ctx.propietario.referencia} / ${ctx.propietario.en.referencia}`,
          },
        ],
      }),
    },
  ],
};

export default PLANTILLA_OFERTA_COMPRA;
