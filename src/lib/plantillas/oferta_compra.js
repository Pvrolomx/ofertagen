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
    nombre_fr: 'Offre d\'Intention d\'Achat',
    idiomas: ['es', 'en', 'fr'],
    formato: 'bilingue_tabla', // tabla lado a lado ES | EN o ES | FR
    nota_idioma: {
      es: 'La versión en idioma inglés es solamente una traducción de cortesía. Para todos los efectos legales prevalecerá la versión en idioma español.',
      en: 'The English version is only a courtesy translation. For all legal effects the Spanish version will prevail.',
      fr: 'La version en français est uniquement une traduction de courtoisie. Pour tous les effets juridiques, la version en espagnol prévaudra.',
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
          { valor: 'ARMOUR SECURE ESCROW, S DE RL DE CV', texto: 'Armour Secure Escrow, S de RL de CV' },
          { valor: 'SECURE TITLE LATIN AMERICA INC', texto: 'Secure Title Latin America Inc' },
          { valor: 'TLA LLC', texto: 'TLA LLC' },
          { valor: 'otro_escrow', texto: 'Otra empresa (captura manual)' },
        ], default: 'ARMOUR SECURE ESCROW, S DE RL DE CV' },
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
        // ── Puerto Vallarta, Jalisco ──────────────────────────
        { id: 'pv_1',  nombre: 'Lic. Fernando Castro Rubio',                  numero: '1',  ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'pv_2',  nombre: 'Lic. Juan Alberto Romero García Castellanos', numero: '2',  ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'pv_3',  nombre: 'Lic. Francisco José Ruiz Higuera',            numero: '3',  ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'pv_5',  nombre: 'Lic. Karla Lizeth Plascencia Vázquez',        numero: '5',  ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'pv_6',  nombre: 'Lic. Sergio Odilón Ramírez Brambila',         numero: '6',  ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'pv_7',  nombre: 'Lic. Eduardo Sánchez Acosta',                 numero: '7',  ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'pv_8',  nombre: 'Lic. José de Jesús Ruiz Higuera',             numero: '8',  ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'pv_9',  nombre: 'Lic. Enrique Torres Jacobo',                  numero: '9',  ciudad: 'Puerto Vallarta, Jalisco' },
        { id: 'pv_10', nombre: 'Lic. Fabiola Estela Prado Medina',            numero: '10', ciudad: 'Puerto Vallarta, Jalisco' },
        // ── Mascota, Jalisco ─────────────────────────────────
        { id: 'mas_1', nombre: 'Lic. Luis Alberto González Valdés',           numero: '1',  ciudad: 'Mascota, Jalisco' },
        // ── Bucerías, Nayarit ────────────────────────────────
        { id: 'buc_2',  nombre: 'Lic. Teodoro Ramírez Valenzuela',            numero: '2',  ciudad: 'Bucerías, Nayarit' },
        { id: 'buc_19', nombre: 'Lic. Luis Miguel Castro Montero',            numero: '19', ciudad: 'Bucerías, Nayarit' },
        { id: 'buc_29', nombre: 'Lic. Adán Meza Barajas',                    numero: '29', ciudad: 'Bucerías, Nayarit' },
        { id: 'buc_31', nombre: 'Lic. José Luis Reyes Vázquez',              numero: '31', ciudad: 'Bucerías, Nayarit' },
        // ── Nuevo Vallarta, Nayarit ──────────────────────────
        { id: 'nv_4',  nombre: 'Lic. Jorge Rogelio Careaga Pérez',            numero: '4',  ciudad: 'Nuevo Vallarta, Nayarit' },
        { id: 'nv_10', nombre: 'Lic. Guillermo Loza Ramírez',                 numero: '10', ciudad: 'Nuevo Vallarta, Nayarit' },
        { id: 'nv_33', nombre: 'Lic. Jorge Armando Bañuelos Chan',            numero: '33', ciudad: 'Nuevo Vallarta, Nayarit' },
        // ── Tepic, Nayarit ───────────────────────────────────
        { id: 'tep_8',  nombre: 'Lic. Héctor Eduardo Velázquez Gutiérrez',   numero: '8',  ciudad: 'Tepic, Nayarit' },
        { id: 'tep_42', nombre: 'Lic. Héctor Manuel Benítez Pineda',         numero: '42', ciudad: 'Tepic, Nayarit' },
        // ── Otro ─────────────────────────────────────────────
        { id: 'otro', nombre: '', numero: '', ciudad: '' },
      ],
      campos: [
        { id: 'notario_seleccion', tipo: 'select', requerido: true, etiqueta: 'Notario', opciones: [
          { valor: '', texto: '— Puerto Vallarta, Jalisco —', disabled: true },
          { valor: 'pv_1',  texto: 'Notaría 1 — Lic. Fernando Castro Rubio' },
          { valor: 'pv_2',  texto: 'Notaría 2 — Lic. Juan Alberto Romero García Castellanos' },
          { valor: 'pv_3',  texto: 'Notaría 3 — Lic. Francisco José Ruiz Higuera' },
          { valor: 'pv_5',  texto: 'Notaría 5 — Lic. Karla Lizeth Plascencia Vázquez' },
          { valor: 'pv_6',  texto: 'Notaría 6 — Lic. Sergio Odilón Ramírez Brambila' },
          { valor: 'pv_7',  texto: 'Notaría 7 — Lic. Eduardo Sánchez Acosta' },
          { valor: 'pv_8',  texto: 'Notaría 8 — Lic. José de Jesús Ruiz Higuera' },
          { valor: 'pv_9',  texto: 'Notaría 9 — Lic. Enrique Torres Jacobo' },
          { valor: 'pv_10', texto: 'Notaría 10 — Lic. Fabiola Estela Prado Medina' },
          { valor: '', texto: '— Mascota, Jalisco —', disabled: true },
          { valor: 'mas_1', texto: 'Notaría 1 — Lic. Luis Alberto González Valdés' },
          { valor: '', texto: '— Bucerías, Nayarit —', disabled: true },
          { valor: 'buc_2',  texto: 'Notaría 2 — Lic. Teodoro Ramírez Valenzuela' },
          { valor: 'buc_19', texto: 'Notaría 19 — Lic. Luis Miguel Castro Montero' },
          { valor: 'buc_29', texto: 'Notaría 29 — Lic. Adán Meza Barajas' },
          { valor: 'buc_31', texto: 'Notaría 31 — Lic. José Luis Reyes Vázquez' },
          { valor: '', texto: '— Nuevo Vallarta, Nayarit —', disabled: true },
          { valor: 'nv_4',  texto: 'Notaría 4 — Lic. Jorge Rogelio Careaga Pérez' },
          { valor: 'nv_10', texto: 'Notaría 10 — Lic. Guillermo Loza Ramírez' },
          { valor: 'nv_33', texto: 'Notaría 33 — Lic. Jorge Armando Bañuelos Chan' },
          { valor: '', texto: '— Tepic, Nayarit —', disabled: true },
          { valor: 'tep_8',  texto: 'Notaría 8 — Lic. Héctor Eduardo Velázquez Gutiérrez' },
          { valor: 'tep_42', texto: 'Notaría 42 — Lic. Héctor Manuel Benítez Pineda' },
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
        { id: 'distribuir_agencia', tipo: 'boolean', requerido: false, etiqueta: 'Distribuir penalidad con agencia', default: false },
        { id: 'pct_parte_afectada', tipo: 'texto', requerido: false, etiqueta: '% parte afectada', default: '60%' },
        { id: 'pct_agencia', tipo: 'texto', requerido: false, etiqueta: '% agencia', default: '40%' },
      ],
    },

    testigos: {
      etiqueta: 'Testigos y aceptación',
      etiqueta_en: 'Witnesses and acceptance',
      campos: [
        { id: 'incluir_testigos', tipo: 'boolean', requerido: false, etiqueta: 'Incluir líneas de testigos', default: false },
        { id: 'incluir_aceptacion', tipo: 'boolean', requerido: false, etiqueta: 'Incluir línea de lugar/fecha/hora de aceptación', default: true },
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

    financiamiento: {
      etiqueta: 'Sujeto a financiamiento',
      etiqueta_en: 'Subject to financing',
      visible_si: 'bloques.financiamiento',
      campos: [
        { id: 'dias_due_diligence', tipo: 'numero', requerido: true, etiqueta: 'Días naturales para due diligence del lender', default: 30 },
        { id: 'nombre_lender', tipo: 'texto', requerido: false, etiqueta: 'Nombre del prestamista / lender', placeholder: 'Ej: MXMORTGAGE, Intercam, etc.' },
      ],
    },

    inventario: {
      etiqueta: 'Inventario / Inclusion list',
      etiqueta_en: 'Inventory / Inclusion list',
      visible_si: 'bloques.inventario',
      campos: [
        { id: 'exclusiones', tipo: 'textarea', requerido: false, etiqueta: 'Exclusiones (lo que NO se incluye)', placeholder: 'Ej: obras de arte, artículos personales del vendedor' },
        { id: 'exclusiones_en', tipo: 'textarea', requerido: false, etiqueta: 'Exclusiones (inglés)', placeholder: 'artwork, seller personal items' },
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
          en: `That on date ${ctx.antecedente.fecha_escritura_en}, by way of deed ${ctx.antecedente.numero_escritura} before ${ctx.antecedente.notario_anterior}, Notary Public ${ctx.antecedente.numero_notaria_anterior} of ${ctx.antecedente.ciudad_notaria_anterior}, acquired the trust rights over the following property:\n\n${ctx.inmueble.descripcion_corta}, located ${ctx.inmueble.ubicacion_completa}${ctx.inmueble.nivel_torre ? ', on the ' + ctx.inmueble.nivel_torre : ''}${ctx.inmueble.descripcion_interior ? ' consisting of ' + ctx.inmueble.descripcion_interior : ''}, with a construction area of ${ctx.inmueble.superficie_m2} (${ctx.inmueble.superficie_letras_en || ctx.inmueble.superficie_letras}) square meters${ctx.inmueble.indiviso ? ', corresponding to an undivided ' + ctx.inmueble.indiviso + ' percent of the common areas' : ''}${usoEn}, with the measurements and boundaries described in the aforementioned deed${inscripcionEn}${ctx.antecedente.cuenta_predial ? ', Property Tax Account ' + ctx.antecedente.cuenta_predial : ''}${catEn} (hereinafter referred to as THE PROPERTY).`,
        };
      },
    },

    // ---- BLOQUE CONDICIONAL: AD CORPUS / AS-IS ----
    {
      id: 'ad_corpus',
      condicional: true,
      default: true,
      despues_de: 'cl_antecedente',
      etiqueta: 'Compra Ad Corpus / As-Is',
      etiqueta_en: 'Ad Corpus / As-Is Purchase',
      render: (ctx) => ({
        es: `${ctx.ofertante.referencia_negrita} declara conocer y aceptar que la presente compraventa se realiza "AD CORPUS" (por cuerpo cierto), es decir, por el inmueble como unidad y no por medida, por lo que las superficies y medidas indicadas son aproximadas y de carácter enunciativo, sin que cualquier diferencia en más o en menos respecto de las superficies reales dé lugar a ajuste alguno en el precio pactado.\n\nAsí mismo, ${ctx.ofertante.referencia} declara que adquiere EL INMUEBLE en su estado actual ("AS-IS"), habiendo tenido la oportunidad de inspeccionarlo física y documentalmente, y que acepta las condiciones en que se encuentra, incluyendo su antigüedad, desgaste natural, y las características propias del inmueble.`,
        en: `${ctx.ofertante.en.referencia_negrita} declares to know and accept that the present sale is made "AD CORPUS" (by the body certain), that is, for the property as a unit and not by measurement, therefore the surfaces and measurements indicated are approximate and for illustrative purposes only, and any difference in excess or deficit with respect to the actual surfaces shall not give rise to any adjustment in the agreed price.\n\nLikewise, ${ctx.ofertante.en.referencia} declares that THE PROPERTY is being acquired in its current condition ("AS-IS"), having had the opportunity to inspect it physically and documentarily, and accepts the conditions in which it is found, including its age, normal wear and tear, and the property's inherent characteristics.`,
      }),
    },

    // ---- CLÁUSULA 4: PRECIO Y CONDICIONES DE PAGO ----
    {
      id: 'cl_precio',
      numero: 4,
      siempre: true,
      titulo: { es: 'PRECIO Y CONDICIONES DE PAGO', en: 'PRICE AND PAYMENT TERMS' },
      render: (ctx) => {
        // Si el vendedor es mexicano → el comprador extranjero necesita CONSTITUIR fideicomiso
        // Si el vendedor es extranjero → ya tiene fideicomiso, se transfieren derechos fideicomisarios
        const esMexicano = ctx.propietario.esMexicano;
        
        const textoEs = esMexicano
          ? `${ctx.ofertante.referencia_negrita} por medio de la presente ofrece a ${ctx.propietario.referencia_negrita} celebrar Contrato de Constitución de Fideicomiso Traslativo de Dominio Irrevocable en Zona Restringida en relación a los derechos de propiedad sobre el INMUEBLE arriba descrito en la cantidad total de ${ctx.precio.completo}. Precio este que será liquidado de la siguiente manera:`
          : `${ctx.ofertante.referencia_negrita} por medio de la presente ofrece a ${ctx.propietario.referencia_negrita} celebrar Contrato Traslativo de Dominio Irrevocable en relación a los derechos fideicomisarios sobre el INMUEBLE arriba descrito en la cantidad total de ${ctx.precio.completo}. Precio este que será liquidado de la siguiente manera:`;
        
        const textoEn = esMexicano
          ? `${ctx.ofertante.en.referencia_negrita} herein offers to ${ctx.propietario.en.referencia_negrita} to celebrate an Irrevocable Trust Constitution Contract in Restricted Zone with regard to the property rights over THE PROPERTY above described in the total amount of ${ctx.precio.completo}. Said price will be paid in the following manner:`
          : `${ctx.ofertante.en.referencia_negrita} herein offers to ${ctx.propietario.en.referencia_negrita} to celebrate an Irrevocable Transfer of Domain Contract with regard to the trust rights over THE PROPERTY above described in the total amount of ${ctx.precio.completo}. Said price will be paid in the following manner:`;
        
        return { es: textoEs, en: textoEn };
      },
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
        es: `A) a fin de garantizar el cumplimiento de las obligaciones que se deriven del presente contrato, ${ctx.ofertante.referenciaConComillas} realizará, una transferencia bancaria a la cuenta escrow aperturada para tal efecto con ${ctx.escrow.empresa_escrow} por la cantidad de ${ctx.deposito.completo}, ${ctx.precio.plazo_deposito_es}, con el propósito de constituir un Depósito Condicional Irrevocable (Cuenta Escrow), en el cual ${ctx.propietario.referenciaConComillas} fungirá como BENEFICIARIA y que se sujetará a las condiciones que para el efecto se establecen en el contrato correspondiente, cuya copia se adjuntará a la presente oferta como ANEXO B (Escrow Agreement).\n\nLa falta de constitución del Depósito en Garantía por parte de ${ctx.ofertante.referencia} dentro del plazo establecido, resultará en la terminación automática de la presente Oferta, sin responsabilidad alguna para las partes.`,
        en: `A) in order to guarantee the fulfillment of the obligations derived from the present contract, ${ctx.ofertante.en.referenciaConComillas} will wire the amount of ${ctx.deposito.completo}, ${ctx.precio.plazo_deposito_en}, to the escrow account opened for said effect with ${ctx.escrow.empresa_escrow} to constitute an Irrevocable Conditional Deposit (Escrow Account), in which ${ctx.propietario.en.referenciaConComillas} will be designated as BENEFICIARY and which will be subject to the conditions that for the purpose are specified in the corresponding contract, a copy of which will be attached to the present offer as ADDENDUM B (Escrow Agreement).\n\nThe failure to constitute the Guarantee Deposit by ${ctx.ofertante.en.referencia} within the established term will result in the automatic termination of the present Offer, without further responsibility to the Parties.`,
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

    // ---- CLÁUSULA: OBLIGACIONES DEL VENDEDOR PREVIAS A LA FORMALIZACIÓN ----
    {
      id: 'obligaciones_vendedor',
      condicional: true,
      default: true,
      etiqueta: 'Obligaciones del vendedor previas a la formalización',
      etiqueta_en: 'Seller obligations prior to formalizing',
      render: (ctx) => ({
        es: `${ctx.propietario.referencia_negrita} se obliga a cumplir las siguientes obligaciones previas y/o en la FECHA DE FORMALIZACIÓN, según aplique:\n\n- Liquidar a sus empleados, en su caso, ante las autoridades laborales correspondientes, debiendo proporcionar constancia de ello a ${ctx.ofertante.referencia} previo a la FECHA DE FORMALIZACIÓN.\n\n- Proporcionar una carta de no adeudo emitida por la Administración de Condóminos.${ctx.bloques.obligaciones_vendedor_agua ? '\n\n- Solicitar y entregar un certificado de no adeudo de agua del organismo operador correspondiente, por tratarse de un inmueble fuera de régimen de condominio.' : ''}\n\n- Transmitir el dominio de EL INMUEBLE libre de litigios, cuentas por pagar por servicios, así como libre de toda carga y gravamen, tal y como conste en el Certificado de No Gravamen emitido por el Registro Público de la Propiedad dentro de los 30 (treinta) días naturales antes de la FECHA DE FORMALIZACIÓN.\n\n- Realizar la transmisión de EL INMUEBLE en el mismo estado y condiciones en que se encontraba en la fecha de inspección, así como con todas las instalaciones y electrodomésticos funcionando correctamente. En caso de incumplimiento, ${ctx.propietario.referencia} tendrá 3 (tres) días naturales para subsanarlo a entera satisfacción de ${ctx.ofertante.referencia}.\n\n- El pago de las cuotas ordinarias y extraordinarias de condóminos, mantenimiento, consumos por servicios e impuesto predial serán prorrateados en la FECHA DE FORMALIZACIÓN, correspondiendo a ${ctx.propietario.referencia} el pago de los mismos hasta dicha fecha y a ${ctx.ofertante.referencia} a partir de la misma.\n\n- Permitir a ${ctx.ofertante.referencia} una visita de inspección (walk-through) de EL INMUEBLE dentro de los 3 (tres) días naturales previos a la FECHA DE FORMALIZACIÓN para verificar las condiciones del inmueble y que todos los servicios, instalaciones y electrodomésticos estén funcionando.\n\n- ${ctx.propietario.referencia} deberá ceder los contratos de servicios con los que cuenta EL INMUEBLE y que ${ctx.ofertante.referencia} decida mantener, tales como electricidad (CFE), telefonía, televisión por cable, internet y/o cualquier otro servicio, y cancelar aquellos que ${ctx.ofertante.referencia} no elija. ${ctx.propietario.referencia} contará con un plazo máximo de 30 (treinta) días calendario después de la FECHA DE FORMALIZACIÓN para completar la transferencia de dichos servicios a nombre de ${ctx.ofertante.referencia}. En caso de no realizar la transferencia dentro de dicho plazo, ${ctx.propietario.referencia} podrá cancelar los servicios a su nombre, siendo responsabilidad de ${ctx.ofertante.referencia} el pago de reconexión y los trámites de contratación a su nombre.`,
        en: `${ctx.propietario.en.referencia_negrita} is obligated to fulfill the following obligations prior to and/or at THE FORMALIZING DATE, as applicable:\n\n- Liquidate and terminate employees, if any, before the corresponding labor authorities, providing proof of such to ${ctx.ofertante.en.referencia} prior to THE FORMALIZING DATE.\n\n- Provide a no-debt letter issued by the Homeowner's Administration.${ctx.bloques.obligaciones_vendedor_agua ? '\n\n- Obtain and deliver a water utility no-debt certificate from the corresponding water authority, as the property is outside a condominium regime.' : ''}\n\n- Transfer the domain of THE PROPERTY free of all litigations, utility bills, liens and burdens, as established by the Certificate of No Liens issued by the Public Registry of Property within 30 (thirty) calendar days before THE FORMALIZING DATE.\n\n- Transfer THE PROPERTY in the same condition as of the inspection date, with all installations and appliances fully functioning. In case of default, ${ctx.propietario.en.referencia} will have 3 (three) calendar days to correct the default to the satisfaction of ${ctx.ofertante.en.referencia}.\n\n- The payment of ordinary and extraordinary homeowner's dues, maintenance, consumption for services and property tax shall be prorated on THE FORMALIZING DATE, corresponding to ${ctx.propietario.en.referencia} such payments until said date and to ${ctx.ofertante.en.referencia} from said date on.\n\n- Allow ${ctx.ofertante.en.referencia} a walk-through inspection of THE PROPERTY within 3 (three) calendar days prior to THE FORMALIZING DATE to verify the condition of the property and that all services, installations and appliances are properly functioning.\n\n- ${ctx.propietario.en.referencia} shall transfer all service contracts existing in THE PROPERTY that ${ctx.ofertante.en.referencia} decides to keep, such as electricity (CFE), telephone, cable TV, internet, and/or any other, and cancel those not elected by ${ctx.ofertante.en.referencia}. ${ctx.propietario.en.referencia} shall have a maximum period of 30 (thirty) calendar days after THE FORMALIZING DATE to complete the transfer of said services to ${ctx.ofertante.en.referencia}'s name. In the event that the transfer is not completed within said period, ${ctx.propietario.en.referencia} may cancel the services in their name, and ${ctx.ofertante.en.referencia} shall be responsible for reconnection fees and contracting the services in their own name.`,
      }),
    },

    // ---- CLÁUSULA: DERECHO DE DEDUCCIÓN DEL PRECIO ----
    {
      id: 'derecho_deduccion',
      condicional: true,
      default: true,
      etiqueta: 'Derecho de deducción del precio',
      etiqueta_en: 'Right to deduct from purchase price',
      render: (ctx) => ({
        es: `${ctx.ofertante.referencia_negrita} podrá deducir del precio pactado de compra cualquier cantidad que haya sido pagada por éste a cuenta o en satisfacción de reclamos o demandas hechas en contra de EL INMUEBLE, o que pudieran limitar su goce y disfrute, siempre que ${ctx.propietario.referencia} no lo haya resuelto dentro de los 10 (diez) días naturales de recibir el aviso por parte de ${ctx.ofertante.referencia}.\n\n${ctx.propietario.referencia} deberá liberar a ${ctx.ofertante.referencia} de cualquier eventualidad o reclamos futuros que deriven de la falta de revelar información relevante, omisión o desinformación proporcionada.`,
        en: `${ctx.ofertante.en.referencia_negrita} may deduct from the agreed purchase price any amount paid to cover claims or lawsuits against THE PROPERTY, or that could limit its use and enjoyment, as long as ${ctx.propietario.en.referencia} has not already resolved them within the next 10 (ten) calendar days of receiving written notice by ${ctx.ofertante.en.referencia} of such situation.\n\n${ctx.propietario.en.referencia} shall hold ${ctx.ofertante.en.referencia} harmless in the event of any future claims caused by lack of disclosure of relevant information, omission or misinformation provided.`,
      }),
    },

    // ---- CLÁUSULA: AUDITORÍA DE HACIENDA ----
    {
      id: 'auditoria_hacienda',
      condicional: true,
      default: false,
      etiqueta: 'Auditoría de Hacienda (responsabilidad fiscal del vendedor)',
      etiqueta_en: 'Tax authority audit (seller fiscal responsibility)',
      render: (ctx) => ({
        es: `${ctx.propietario.referencia_negrita} se obliga a informar a ${ctx.ofertante.referencia} si EL INMUEBLE ha sido o es actualmente sujeto de auditoría, revisión o procedimiento de fiscalización por parte de cualquier autoridad hacendaria federal, estatal o municipal.\n\nEn caso de que existieren cuotas, contribuciones, recargos, multas o cualquier otra obligación fiscal asignada o pendiente de determinación, derivada de períodos anteriores a la FECHA DE FORMALIZACIÓN, ${ctx.propietario.referencia} será el único responsable de su pago, liberando a ${ctx.ofertante.referencia} de cualquier responsabilidad al respecto. Lo anterior incluye, sin limitar, contribuciones por concepto de impuesto predial, derechos de concesión, contribuciones de mejoras, y cualquier otra obligación fiscal atribuible al período de propiedad de ${ctx.propietario.referencia}.`,
        en: `${ctx.propietario.en.referencia_negrita} is obligated to inform ${ctx.ofertante.en.referencia} whether THE PROPERTY has been or is currently subject to an audit, review or tax examination proceeding by any federal, state or municipal tax authority.\n\nIn the event that there are any taxes, contributions, surcharges, fines or any other fiscal obligation assigned or pending determination, arising from periods prior to THE FORMALIZING DATE, ${ctx.propietario.en.referencia} shall be solely responsible for their payment, holding ${ctx.ofertante.en.referencia} harmless from any liability in this regard. The foregoing includes, without limitation, property taxes, concession fees, improvement contributions, and any other fiscal obligation attributable to ${ctx.propietario.en.referencia}'s period of ownership.`,
      }),
    },

    // ---- CLÁUSULA: HOLDBACK EN ESCROW POR ADEUDOS DE CONDOMINIO ----
    {
      id: 'holdback_escrow',
      condicional: true,
      default: false,
      etiqueta: 'Holdback en escrow por adeudos de condominio',
      etiqueta_en: 'Escrow holdback for condominium assessments',
      render: (ctx) => ({
        es: `En caso de que al momento del cierre existiere cualquier cuota extraordinaria (assessment), derrama, o cargo pendiente de determinación por parte de la Administración de Condóminos, las partes acuerdan retener en la cuenta escrow una cantidad igual al monto estimado de dicho adeudo, o la cantidad que las partes acuerden por escrito.\n\nDicha retención será liberada a ${ctx.propietario.referencia} una vez que se determine el monto exacto del adeudo y se acredite fehacientemente su pago total. En caso de que la retención resulte insuficiente, ${ctx.propietario.referencia} será responsable de cubrir la diferencia. En caso de que la retención exceda el monto adeudado, el excedente será liberado a ${ctx.propietario.referencia}.\n\nPara efectos de lo anterior, ${ctx.propietario.referencia} deberá obtener y entregar a ${ctx.ofertante.referencia} una carta del Administrador del Condominio declarando que no existen cargos pendientes o, en su caso, detallando los cargos existentes y sus montos estimados.`,
        en: `In the event that at the time of closing there are any extraordinary assessments, special levies, or pending charges by the Homeowner's Administration, the parties agree to retain in the escrow account an amount equal to the estimated amount of such debt, or the amount agreed upon in writing by the parties.\n\nSaid holdback shall be released to ${ctx.propietario.en.referencia} once the exact amount of the debt is determined and its full payment is duly proven. In the event that the holdback is insufficient, ${ctx.propietario.en.referencia} shall be responsible for covering the difference. In the event that the holdback exceeds the amount owed, the surplus shall be released to ${ctx.propietario.en.referencia}.\n\nFor purposes of the foregoing, ${ctx.propietario.en.referencia} shall obtain and deliver to ${ctx.ofertante.en.referencia} a letter from the Condominium Administrator stating that there are no pending charges or, as the case may be, detailing the existing charges and their estimated amounts.`,
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
        es: `${ctx._inciso}) Que ${ctx.ofertante.referenciaConComillas} obtenga, pagado por él, dentro de los siguientes ${ctx.inspeccion.dias_inspeccion_letras} (${ctx.inspeccion.dias_inspeccion}) días naturales después de aceptada la presente oferta, cualquier inspección que ${ctx.ofertante.referenciaConComillas} estime ser necesario y razonable con la finalidad de que verifique la condición general de la propiedad, incluyendo, sin límite, la integridad estructural del inmueble; así como instalaciones eléctricas, sanitarias de plomería, gas y electrodomésticos, en su caso. ${ctx.ofertante.referenciaConComillas} tendrá ${ctx.inspeccion.dias_revision_letras} (${ctx.inspeccion.dias_revision}) días naturales más a partir de recibido el reporte para su revisión y aprobación. En caso de rechazarlo, avisará a ${ctx.propietario.referencia}, y ésta oferta será considerada cancelada y las partes quedarán, por lo tanto, liberadas de cualquier obligación derivada del presente contrato. Si dicho aviso no lo recibe ${ctx.propietario.referenciaConComillas} por parte de ${ctx.ofertante.referencia} dentro de dicha fecha, la condición aquí especificada se tendrá por totalmente satisfecha.`,
        en: `${ctx._inciso}) That ${ctx.ofertante.en.referenciaConComillas} obtain, paid by her, within the following ${ctx.inspeccion.dias_inspeccion_letras_en} (${ctx.inspeccion.dias_inspeccion}) calendar days after acceptance of this offer, any inspection that ${ctx.ofertante.en.referenciaConComillas} deems to be necessary and reasonable in order to verify the general condition of the property, including, without limitation, the structural integrity of the property; as well as electrical installations, sanitary plumbing, gas and electrical appliances, if applicable. ${ctx.ofertante.en.referenciaConComillas} will have ${ctx.inspeccion.dias_revision_letras_en} (${ctx.inspeccion.dias_revision}) more calendar days from receipt of the report for review and approval. In case of rejection, it will notify ${ctx.propietario.en.referencia}, and this offer will be considered canceled and the parties will be, therefore, released from any obligation derived from this contract. If said notice is not received by ${ctx.propietario.en.referenciaConComillas} from ${ctx.ofertante.en.referencia} within said date, the condition specified herein shall be deemed fully satisfied.`,
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
        es: `${ctx._inciso}) Que ${ctx.propietario.referencia} envíe a ${ctx.ofertante.referencia_negrita} copia completa de EL FIDEICOMISO original a que hace referencia el punto 3 de la presente oferta, así como copia simple de las dos últimas actas de asambleas del condominio y sus estados financieros.`,
        en: `${ctx._inciso}) That ${ctx.propietario.en.referencia} send ${ctx.ofertante.en.referencia_negrita} a complete copy of THE ORIGINAL TRUST referred to in point 3 of this offer, as well as a simple copy of the last two condominium assembly minutes and their financial statements.`,
      }),
    },

    // ---- SUB-BLOQUE: SUJETO A FINANCIAMIENTO ----
    {
      id: 'financiamiento',
      condicional: true,
      default: false,
      despues_de: 'doc_fideicomiso',
      etiqueta: 'Sujeto a financiamiento (compra con crédito)',
      etiqueta_en: 'Subject to financing (mortgage purchase)',
      render: (ctx) => ({
        es: `${ctx._inciso}) La presente oferta está sujeta a la aprobación del financiamiento por parte del prestamista${ctx.financiamiento?.nombre_lender ? ' (' + ctx.financiamiento.nombre_lender + ')' : ''} que ${ctx.ofertante.referencia} elija. ${ctx.propietario.referencia} deberá proporcionar al prestamista, dentro del plazo de due diligence, la siguiente documentación: escritura vigente del inmueble, plano del departamento, factura de impuesto predial del año en curso (pagada), reglamento y estatutos del condominio, estados de cuenta del fondo de reserva, estados financieros anuales más recientes, acta de la última reunión de la junta directiva del condominio, comprobante de seguro de áreas comunes, y cualquier otro documento que el prestamista requiera para la verificación y tasación de la propiedad.\n\nEl prestamista necesitará ${ctx.financiamiento?.dias_due_diligence || 30} (${ctx.financiamiento?.dias_due_diligence_letras || 'treinta'}) días naturales a partir de la recepción de los documentos para verificar legalmente toda la documentación y proporcionar la tasación de la propiedad. Una vez obtenida la aprobación financiera, ${ctx.ofertante.referencia} realizará el depósito en garantía dentro del plazo establecido.\n\nEn caso de que el financiamiento no sea aprobado, la presente oferta quedará sin efectos legales para las partes, y cualquier cantidad depositada le será reembolsada a ${ctx.ofertante.referencia}. Las partes podrán prorrogar el período de due diligence por escrito si ambas lo acuerdan.`,
        en: `${ctx._inciso}) The present offer is subject to financing approval by the lender${ctx.financiamiento?.nombre_lender ? ' (' + ctx.financiamiento.nombre_lender + ')' : ''} of ${ctx.ofertante.en.referencia}'s choice. ${ctx.propietario.en.referencia} shall provide the lender, within the due diligence period, the following documentation: existing title deed, floor plan, current year's property tax bill (paid), condominium regime and bylaws, reserve fund account statements, most recent annual financial statements, most recent condominium board meeting minutes, proof of common area insurance, and any other documents required by the lender for verification and property appraisal.\n\nThe lender will need ${ctx.financiamiento?.dias_due_diligence || 30} (${ctx.financiamiento?.dias_due_diligence_letras_en || 'thirty'}) calendar days from receipt of the documents to legally verify all documentation and provide the property appraisal. Upon financial approval, ${ctx.ofertante.en.referencia} will fund escrow within the established timeframe.\n\nIn the event that financing is not approved, the present offer will not cause any legal effect to the Parties, and any amounts deposited shall be reimbursed to ${ctx.ofertante.en.referencia}. The parties may extend the due diligence period in writing if agreed upon by both parties.`,
      }),
    },

    // ---- SUB-BLOQUE: INVENTARIO / INCLUSION LIST ----
    {
      id: 'inventario',
      condicional: true,
      default: false,
      despues_de: 'financiamiento',
      etiqueta: 'Inventario detallado / Inclusion list',
      etiqueta_en: 'Detailed inventory / Inclusion list',
      render: (ctx) => {
        const exclEs = ctx.inventario?.exclusiones
          ? `\n\nQuedan expresamente excluidos del inventario: ${ctx.inventario.exclusiones}.`
          : '';
        const exclEn = ctx.inventario?.exclusiones_en
          ? `\n\nExpressly excluded from the inventory: ${ctx.inventario.exclusiones_en}.`
          : (ctx.inventario?.exclusiones ? `\n\nExpressly excluded from the inventory: ${ctx.inventario.exclusiones}.` : '');
        return {
          es: `${ctx._inciso}) Que ${ctx.propietario.referencia} proporcione a ${ctx.ofertante.referencia} copia del inventario detallado del inmueble (lista de inclusiones), junto con fotografías del mismo. ${ctx.propietario.referencia} tiene prohibido retirar o modificar el contenido del inventario a partir de la aceptación de la presente oferta. El inmueble se transmitirá con todos los bienes muebles, instalaciones y electrodomésticos incluidos en dicho inventario.${exclEs}\n\nEn caso de que EL INMUEBLE no sea entregado con el inventario aprobado completo, se considerará incumplimiento de ${ctx.propietario.referencia}, quien tendrá 3 (tres) días naturales para subsanar dicha falta. Quedan exceptuados los casos de fuerza mayor tales como robos, huracanes, marejadas u otros eventos fuera del control de ${ctx.propietario.referencia}.`,
          en: `${ctx._inciso}) That ${ctx.propietario.en.referencia} provide ${ctx.ofertante.en.referencia} a copy of the detailed inventory of the property (inclusion list), together with photographs thereof. ${ctx.propietario.en.referencia} is forbidden to remove or modify the content of the inventory from the date of acceptance of the present offer. The property shall be transferred with all furniture, fixtures and appliances included in said inventory.${exclEn}\n\nIn the event that THE PROPERTY is not delivered with the complete approved inventory, it shall be considered a breach by ${ctx.propietario.en.referencia}, who shall have 3 (three) calendar days to cure such default. Events of force majeure such as theft, hurricanes, storm surges or other events beyond ${ctx.propietario.en.referencia}'s control shall be excepted.`,
        };
      },
    },

    // ---- SUB-BLOQUE: ARRENDAMIENTOS VIGENTES ----
    {
      id: 'arrendamientos',
      condicional: true,
      default: false,
      despues_de: 'inventario',
      etiqueta: 'Arrendamientos vigentes (rentas)',
      etiqueta_en: 'Existing rental agreements',
      render: (ctx) => {
        const rentaHasta = ctx.arrendamientos?.renta_hasta || 'escrow';
        const rentaHastaEs = {
          escrow: 'hasta que el dinero se refleje en la cuenta escrow',
          cuenta_vendedor: 'hasta que el dinero se refleje en la cuenta de ' + ctx.propietario.referencia,
          cierre: 'hasta la FECHA DE FORMALIZACIÓN',
        }[rentaHasta];
        const rentaHastaEn = {
          escrow: 'until the funds are reflected in the escrow account',
          cuenta_vendedor: 'until the funds are reflected in ' + ctx.propietario.en.referencia + '\'s account',
          cierre: 'until THE FORMALIZING DATE',
        }[rentaHasta];
        return {
          es: `${ctx._inciso}) En caso de existir contratos de arrendamiento vigentes con posterioridad a la FECHA DE FORMALIZACIÓN, ${ctx.propietario.referencia} deberá informar a ${ctx.ofertante.referencia} de dichos contratos para que éste determine si los mismos se mantendrán en vigor. En caso afirmativo, ${ctx.propietario.referencia} abonará a ${ctx.ofertante.referencia} todas las rentas y depósitos programados con posterioridad a la FECHA DE FORMALIZACIÓN, y ${ctx.ofertante.referencia} estará obligado a respetar los contratos de arrendamiento vigentes. ${ctx.propietario.referencia} tendrá derecho a percibir las rentas ${rentaHastaEs}. ${ctx.propietario.referencia} no será responsable de las cancelaciones de renta por parte de los arrendatarios. La decisión de ${ctx.ofertante.referencia} sobre la continuidad de los contratos de arrendamiento deberá comunicarse al momento de constituir el depósito en garantía.`,
          en: `${ctx._inciso}) In the event of existing rental agreements in force after THE FORMALIZING DATE, ${ctx.propietario.en.referencia} shall inform ${ctx.ofertante.en.referencia} of such agreements in order for ${ctx.ofertante.en.referencia} to determine if the rentals will remain in force. If so, ${ctx.propietario.en.referencia} shall credit ${ctx.ofertante.en.referencia} all the rentals and deposits scheduled after THE FORMALIZING DATE, and ${ctx.ofertante.en.referencia} shall be bound to honor the rental agreements. ${ctx.propietario.en.referencia} shall be entitled to collect rents ${rentaHastaEn}. ${ctx.propietario.en.referencia} will not be responsible for any rental cancellations by the renters. ${ctx.ofertante.en.referencia}'s decision regarding the continuity of the rental agreements must be communicated at the time of constituting the guarantee deposit.`,
        };
      },
    },

    // ---- SUB-BLOQUE: ZONA FEDERAL ----
    {
      id: 'zona_federal',
      condicional: true,
      default: false,
      despues_de: 'arrendamientos',
      etiqueta: 'Zona Federal (propiedades frente al mar)',
      etiqueta_en: 'Federal Zone (beachfront properties)',
      render: (ctx) => ({
        es: `${ctx._inciso}) Que ${ctx.propietario.referencia} proporcione a ${ctx.ofertante.referencia} copia de toda la documentación correspondiente a cualquier Zona Federal marítima, terrestre, vial y/o fluvial adyacente al inmueble, incluyendo, entre otros, concesiones, pagos y estudios, según corresponda. ${ctx.propietario.referencia} se compromete a ceder a ${ctx.ofertante.referencia} todos los derechos de la Zona Federal correspondiente en la FECHA DE FORMALIZACIÓN, debiendo encontrarse al corriente en el pago de los derechos de concesión.`,
        en: `${ctx._inciso}) That ${ctx.propietario.en.referencia} provide ${ctx.ofertante.en.referencia} a copy of all documentation corresponding to any maritime, ground, highway and/or river adjacent Federal Zone, including without limitation, concessions, payments and surveys, as applicable. ${ctx.propietario.en.referencia} agrees to assign ${ctx.ofertante.en.referencia} all the rights of the corresponding Federal Zone on THE FORMALIZING DATE, and must be current in the payment of concession fees.`,
      }),
    },

    // ---- SUB-BLOQUE: LITIGIOS PENDIENTES ----
    {
      id: 'litigios_pendientes',
      condicional: true,
      default: false,
      despues_de: 'zona_federal',
      etiqueta: 'Litigios pendientes como condición',
      etiqueta_en: 'Pending litigation as condition',
      render: (ctx) => ({
        es: `${ctx._inciso}) Que ${ctx.propietario.referencia} informe a ${ctx.ofertante.referencia}, por escrito, de cualquier litigio, procedimiento judicial, administrativo o arbitral, pendiente o inminente, que involucre o pudiere afectar a EL INMUEBLE, proporcionando copias de la documentación relevante dentro de los 3 (tres) días hábiles posteriores a la aceptación de la presente oferta.\n\n${ctx.ofertante.referencia} tendrá 5 (cinco) días naturales a partir de la recepción de dicha información para evaluar los litigios informados y notificar a ${ctx.propietario.referencia} si acepta o rechaza la situación reportada. En caso de rechazo, la presente oferta quedará sin efecto alguno y cualquier cantidad depositada le será reembolsada a ${ctx.ofertante.referencia} en su totalidad.`,
        en: `${ctx._inciso}) That ${ctx.propietario.en.referencia} inform ${ctx.ofertante.en.referencia}, in writing, of any pending or imminent litigation, judicial, administrative or arbitration proceeding, that involves or could affect THE PROPERTY, providing copies of the relevant documentation within 3 (three) business days after acceptance of the present offer.\n\n${ctx.ofertante.en.referencia} shall have 5 (five) calendar days from receipt of such information to evaluate the reported litigation and notify ${ctx.propietario.en.referencia} whether the reported situation is accepted or rejected. In case of rejection, the present offer shall be null and void and any amounts deposited shall be refunded to ${ctx.ofertante.en.referencia} in full.`,
      }),
    },

    // ---- SUB-BLOQUE: EMPLEADOS COMO CONDICIÓN ----
    {
      id: 'empleados_condicion',
      condicional: true,
      default: false,
      despues_de: 'litigios_pendientes',
      etiqueta: 'Litigios laborales como condición',
      etiqueta_en: 'Labor litigation as condition',
      render: (ctx) => ({
        es: `${ctx._inciso}) Que ${ctx.propietario.referencia} informe a ${ctx.ofertante.referencia}, por escrito, de cualquier relación laboral vigente, así como de cualquier litigio, demanda o procedimiento de naturaleza laboral, actual o anterior, que se relacione con EL INMUEBLE o con empleados que presten o hayan prestado servicios en el mismo, proporcionando la documentación relevante dentro de los 3 (tres) días hábiles posteriores a la aceptación de la presente oferta.\n\n${ctx.ofertante.referencia} tendrá 5 (cinco) días naturales a partir de la recepción de dicha información para evaluar la situación laboral reportada y notificar a ${ctx.propietario.referencia} si la acepta o rechaza. En caso de rechazo, la presente oferta quedará sin efecto alguno y cualquier cantidad depositada le será reembolsada a ${ctx.ofertante.referencia} en su totalidad.`,
        en: `${ctx._inciso}) That ${ctx.propietario.en.referencia} inform ${ctx.ofertante.en.referencia}, in writing, of any current labor relationship, as well as any current or previous labor litigation, claim or proceeding related to THE PROPERTY or to employees who render or have rendered services therein, providing the relevant documentation within 3 (three) business days after acceptance of the present offer.\n\n${ctx.ofertante.en.referencia} shall have 5 (five) calendar days from receipt of such information to evaluate the reported labor situation and notify ${ctx.propietario.en.referencia} whether it is accepted or rejected. In case of rejection, the present offer shall be null and void and any amounts deposited shall be refunded to ${ctx.ofertante.en.referencia} in full.`,
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
          es: `Las comunicaciones entre las partes relacionadas con la presente oferta por email y whatsapp serán consideradas como documental privada siempre y cuando éstas indiquen la fecha y la hora que fueron enviadas y contengan el nombre y firma del remitente. Así mismo, las partes reconocen la validez de los documentos firmados mediante plataformas de firma electrónica tales como DocuSign, Adobe Sign u otros medios de firma electrónica análogos.\n\nPara este efecto, las partes señalan las siguientes direcciones electrónicas:\n\n${ctx.ofertante.referencia_negrita}: Celular/Whatsapp: ${ctx.ofertante.celular}; Email: ${ctx.ofertante.email}\n\n${ctx.propietario.referencia_negrita}: Celular/Whatsapp: ${ctx.propietario.celular}; Email: ${ctx.propietario.email}${coord}\n\nNo obstante, los contratos deberán ser remitidos a las partes con firma original en el plazo no mayor a 15 días naturales siguientes a la fecha en que se suscriban vía correo electrónico o plataforma de firma electrónica.`,
          en: `Communications by email or whatsapp among the parties related to the present offer will be considered as valid evidence provided that those indicate the date and time when they were sent as well as the name and signature of the sender. Likewise, the parties acknowledge the validity of documents signed through electronic signature platforms such as DocuSign, Adobe Sign or other analogous electronic signature means.\n\nTo this effect, the parties point out the following email addresses:\n\n${ctx.ofertante.en.referencia_negrita}: Phone/Whatsapp: ${ctx.ofertante.celular}; Email: ${ctx.ofertante.email}\n\n${ctx.propietario.en.referencia_negrita}: Phone/Whatsapp: ${ctx.propietario.celular}; Email: ${ctx.propietario.email}${coordEn}\n\nHowever, contracts must be sent to the parties with original signature in the term no later than 15 calendar days following the date they are subscribed via email or electronic signature platform.`,
        };
      },
    },

    // ---- CLÁUSULA 18: PENALIDAD ----
    {
      id: 'cl_penalidad',
      numero: 18,
      siempre: true,
      titulo: { es: 'PENALIDAD', en: 'PENALTY CLAUSE' },
      render: (ctx) => {
        const distrib = ctx.penalidad.distribuir_agencia
          ? `\n\nEn caso de que se causara, dicha penalidad se distribuirá entre la parte afectada (${ctx.penalidad.pct_parte_afectada}) y LA AGENCIA de Bienes Raíces (${ctx.penalidad.pct_agencia}) por concepto de honorarios y gastos, por lo cual, en caso aplicable, se instruirá a la compañía escrow de hacer los desembolsos desde el importe depositado.`
          : '';
        const distribEn = ctx.penalidad.distribuir_agencia
          ? `\n\nIn the event that said penalty applies, it will be distributed between the affected party (${ctx.penalidad.pct_parte_afectada}) and the Real Estate Agency (${ctx.penalidad.pct_agencia}) towards their fees, expenses and services rendered, for which the parties, if applicable, will instruct the escrow company to disburse from the amount deposited.`
          : '';
        return {
          es: `Si la presente oferta es aceptada por ${ctx.propietario.referenciaConComillas}, la condición indispensable a la cuál se supedita su validez fuera satisfecha; y no obstante, una de las partes incumpliera las condiciones o términos de la presente oferta o bien decidiera o se viera impedida de formalizar el contrato definitivo, la parte responsable abonará a la otra la cantidad equivalente al ${ctx.penalidad.porcentaje_penalidad} de la oferta ${ctx.penalidad.completo} por concepto de pena convencional.${distrib}\n\nEn caso de que ${ctx.ofertante.referencia_negrita} hubiera depositado a la cuenta escrow e incumpliere, ambas partes firmarán la instrucción al escrow para liberar los fondos y de ahí pagarse a ${ctx.propietario.referencia_negrita} dicha pena convencional.\n\nAsí mismo, de ser ${ctx.propietario.referencia_negrita} quien incumpla, y de haberse depositado a la cuenta escrow fondos, estos deberán ser liberados por ambas partes a ${ctx.ofertante.referencia_negrita} y añadírseles por parte de ${ctx.propietario.referencia_negrita}, por concepto de pena convencional la cantidad aquí pactada.\n\nEl pago de dicha pena convencional liberará automáticamente a las partes de cualquier otra obligación o responsabilidad derivada de la presente oferta.`,
          en: `If the present Offer is accepted by ${ctx.propietario.en.referenciaConComillas}; the indispensable condition for its validity set forth is satisfied; and, notwithstanding, one of the parties fails to comply with the terms and conditions herein established, or shall decide, or shall be impeded to formalize the definitive contract, the responsible party will be obligated to pay the other the total amount of ${ctx.penalidad.completo}.${distribEn}\n\nIn case ${ctx.ofertante.en.referencia_negrita} had deposited into the escrow account and failed to comply, both parties will sign the instruction to release the funds to pay ${ctx.propietario.en.referencia_negrita} the agreed penalty.\n\nLikewise, if ${ctx.propietario.en.referencia_negrita} fail to comply and funds have been deposited into the escrow account, both parties must release the funds to ${ctx.ofertante.en.referencia_negrita} and add, by ${ctx.propietario.en.referencia_negrita}, to them the amount agreed upon as a penalty.\n\nThe payment of said penalty will liberate the parties of any further obligation or responsibility, and the present offer will be automatically canceled and null in all its effects.`,
        };
      },
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
      etiqueta: 'Caso fortuito y fuerza mayor (versión expandida)',
      etiqueta_en: 'Acts of God and force majeure (expanded version)',
      render: (ctx) => ({
        es: `En caso de fallecimiento de alguna de las partes, la presente oferta prevalecerá en todos sus términos, continuándose con el(los) beneficiario(s) sustituto(s) de las partes: para el caso de ${ctx.propietario.referencia} se continuará con los beneficiarios designados en su escritura de fideicomiso y para el caso de ${ctx.ofertante.referencia} la que éste en su momento designe.\n\nEn caso de que el cumplimiento de las obligaciones derivadas de la presente oferta se viera impedido o retrasado por causas de caso fortuito o fuerza mayor, incluyendo sin limitar: pandemias, epidemias o emergencias sanitarias; huelgas o paros laborales; fenómenos meteorológicos o sísmicos tales como huracanes, terremotos, tsunamis, marejadas o inundaciones; incendios; guerras, conflictos armados o disturbios civiles; actos de terrorismo; órdenes gubernamentales o restricciones de autoridades competentes; u otros eventos similares fuera del control razonable de las partes, la FECHA DE FORMALIZACIÓN se extenderá automáticamente día por día durante un período máximo de 90 (noventa) días naturales.\n\nTranscurridos los 90 (noventa) días naturales sin que se haya superado el evento de fuerza mayor, las partes podrán extender el plazo por consentimiento mutuo otorgado por escrito. En caso de no acordarse dicha extensión, la presente oferta se cancelará sin aplicar penalidad alguna a cargo de las partes, las cuales quedarán liberadas de cualquier obligación contractual derivada de la misma, y cualquier cantidad que haya sido pagada le será reembolsada a ${ctx.ofertante.referencia} en su totalidad.`,
        en: `In the event of death of any of the parties herein, the present offer shall prevail in all its terms, continuing with their substitute beneficiary(ies): for ${ctx.propietario.en.referencia}, with the substitute beneficiaries designated in their bank trust deed, and for ${ctx.ofertante.en.referencia}, with the beneficiary designated for this purpose.\n\nIn the event that the fulfillment of the obligations derived from the present offer is prevented or delayed by acts of God or force majeure, including without limitation: pandemics, epidemics or health emergencies; strikes or labor stoppages; meteorological or seismic phenomena such as hurricanes, earthquakes, tsunamis, storm surges or floods; fires; wars, armed conflicts or civil unrest; acts of terrorism; governmental orders or restrictions by competent authorities; or other similar events beyond the reasonable control of the parties, THE FORMALIZING DATE shall be automatically extended on a day-for-day basis for a maximum period of 90 (ninety) calendar days.\n\nUpon expiration of the 90 (ninety) calendar day period without the force majeure event having been resolved, the parties may extend the term by mutual written consent. In the event that such extension is not agreed upon, the present offer shall be cancelled without applying any penalty to any of the parties, which shall be released from any contractual obligation derived herefrom, and any amounts paid shall be refunded to ${ctx.ofertante.en.referencia} in full.`,
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

    // ---- CLÁUSULA: DOCUMENTOS QUE FORMAN PARTE INTEGRAL ----
    {
      id: 'documentos_integrales',
      condicional: true,
      default: true,
      etiqueta: 'Documentos que forman parte integral de la oferta',
      etiqueta_en: 'Documents that form integral part of the offer',
      render: (ctx) => ({
        es: `Los siguientes documentos forman parte integral de la presente oferta:\n\n1. Documentos que contengan el cumplimiento y remoción de las Condiciones Indispensables;\n2. Contrato de Depósito en Garantía (Escrow Agreement), en su caso;\n3. Convenios modificatorios, documentos y anexos firmados por las Partes;\n4. Inventario detallado del inmueble, en su caso.`,
        en: `The following documents form an integral part of the present offer:\n\n1. Documents containing the compliance and removal of the Indispensable Conditions;\n2. Guarantee Deposit Contract (Escrow Agreement), if applicable;\n3. Amendments, documents and annexes signed by the Parties;\n4. Detailed inventory of the property, if applicable.`,
      }),
    },

    // ---- CLÁUSULA: PROTECCIÓN DE DATOS PERSONALES ----
    {
      id: 'proteccion_datos',
      condicional: true,
      default: false,
      etiqueta: 'Protección de datos personales',
      etiqueta_en: 'Personal data protection',
      render: (ctx) => ({
        es: `Las partes reconocen que los datos personales intercambiados en la presente oferta se recaban únicamente para los fines de esta transacción inmobiliaria y serán compartidos exclusivamente con el Notario Público designado, la empresa de escrow y los agentes inmobiliarios directamente involucrados. Los datos no serán utilizados para fines distintos a los aquí establecidos, ni divulgados a terceros sin consentimiento expreso, salvo requerimiento de autoridad competente. Cada parte conservará los datos únicamente durante el tiempo necesario para cumplir con las obligaciones derivadas de esta operación y con las disposiciones legales aplicables.`,
        en: `The parties acknowledge that personal data exchanged in this offer is collected solely for the purposes of this real estate transaction and will be shared exclusively with the designated Public Notary, the escrow company, and the real estate agents directly involved. The data will not be used for purposes other than those established herein, nor disclosed to third parties without express consent, except when required by competent authority. Each party shall retain the data only for the time necessary to fulfill the obligations derived from this transaction and to comply with applicable legal provisions.`,
      }),
    },

    // ---- CLÁUSULA: CONFIDENCIALIDAD (NDA) ----
    {
      id: 'confidencialidad',
      condicional: true,
      default: false,
      etiqueta: 'Confidencialidad (NDA)',
      etiqueta_en: 'Confidentiality (NDA)',
      etiqueta_fr: 'Confidentialité (NDA)',
      render: (ctx) => {
        const meses = ctx.confidencialidad?.meses || 6;
        const mesesMap = { 3: 'tres', 6: 'seis', 12: 'doce', 24: 'veinticuatro' };
        const mesesMapEn = { 3: 'three', 6: 'six', 12: 'twelve', 24: 'twenty-four' };
        const mesesMapFr = { 3: 'trois', 6: 'six', 12: 'douze', 24: 'vingt-quatre' };
        const mesesLetras = mesesMap[meses] || meses;
        const mesesLetrasEn = mesesMapEn[meses] || meses;
        const mesesLetrasFr = mesesMapFr[meses] || meses;
        return {
          es: `Las partes, así como sus respectivos representantes, agentes inmobiliarios y asesores, se obligan a mantener estricta confidencialidad sobre la existencia, los términos, las condiciones, el precio y cualquier otra información relativa a la presente oferta. Dicha información no podrá ser divulgada a terceros ajenos a la operación sin el consentimiento previo y por escrito de la parte que la generó.\n\nEsta obligación de confidencialidad permanecerá vigente durante toda la negociación y por un período de ${mesesLetras} (${meses}) meses contados a partir del cierre de la operación o, en su caso, de la terminación de la presente oferta por cualquier causa.\n\nSe exceptúan de esta obligación las divulgaciones realizadas a: (i) el Notario Público designado, la empresa de escrow y los abogados de las partes, en la medida estrictamente necesaria para el cierre; y (ii) cualquier autoridad competente que así lo requiera mediante mandato legal o judicial.`,
          en: `The parties, as well as their respective representatives, real estate agents, and advisors, are obligated to maintain strict confidentiality regarding the existence, terms, conditions, price, and any other information related to the present offer. Such information may not be disclosed to third parties not involved in the transaction without the prior written consent of the party that generated it.\n\nThis confidentiality obligation shall remain in effect throughout the negotiation and for a period of ${mesesLetrasEn} (${meses}) months from the closing of the transaction or, as the case may be, from the termination of this offer for any reason.\n\nExcepted from this obligation are disclosures made to: (i) the designated Public Notary, the escrow company, and the parties' attorneys, to the extent strictly necessary for closing; and (ii) any competent authority that requires it by legal or judicial mandate.`,
          fr: `Les parties, ainsi que leurs représentants, agents immobiliers et conseillers respectifs, s'engagent à maintenir une stricte confidentialité concernant l'existence, les termes, les conditions, le prix et toute autre information relative à la présente offre. Ces informations ne pourront être divulguées à des tiers non impliqués dans la transaction sans le consentement préalable et écrit de la partie qui les a générées.\n\nCette obligation de confidentialité restera en vigueur pendant toute la durée de la négociation et pour une période de ${mesesLetrasFr} (${meses}) mois à compter de la clôture de la transaction ou, le cas échéant, de la résiliation de la présente offre pour quelque raison que ce soit.\n\nSont exceptées de cette obligation les divulgations faites à : (i) le Notaire Public désigné, la société d'entiercement et les avocats des parties, dans la mesure strictement nécessaire à la clôture ; et (ii) toute autorité compétente qui l'exige par mandat légal ou judiciaire.`,
        };
      },
    },

    // ---- CLÁUSULA: DUPLICADOS / COUNTERPARTS ----
    {
      id: 'duplicados',
      condicional: true,
      default: true,
      etiqueta: 'Duplicados / Counterparts',
      etiqueta_en: 'Counterparts and electronic communications',
      render: (ctx) => ({
        es: `La presente oferta podrá ser firmada en más de una copia, y bastará con que esté firmada y rubricada en todas sus páginas por cualquiera de las partes para su validez. Las partes acuerdan reconocer las comunicaciones electrónicas entre ellas, así como el consentimiento otorgado por dichos medios.`,
        en: `This offer may be signed in more than one copy, and it will be valid once signed and initialed in all of its pages by any Party. The Parties agree to recognize electronic communications between them, as well as their consent given through such means.`,
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
        testigos: ctx.testigos?.incluir_testigos,
        aceptacion: ctx.testigos?.incluir_aceptacion !== false,
      }),
    },
  ],
};

export default PLANTILLA_OFERTA_COMPRA;
