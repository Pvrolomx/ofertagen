/**
 * ContraOfertaGen — Plantilla: Contraoferta / Convenio Modificatorio
 * 
 * Producto hermano de OfertaGen.
 * Referencia la oferta original y permite modificar campos específicos.
 * 
 * Arquitectura:
 *   - Deep link desde OfertaGen (hereda datos via localStorage)
 *   - 7 campos modificables con toggles
 *   - Frase cierre: "el resto de la oferta original continúa sin cambios"
 *   - Trilingüe nativo ES/EN/FR desde el inicio
 * 
 * Sprint CA-1 — Abril 2026
 */

const PLANTILLA_CONTRAOFERTA = {

  // ============================================================
  // META
  // ============================================================

  meta: {
    id: 'contraoferta',
    version: '1.0.0',
    nombre: 'Contraoferta',
    nombre_en: 'Counter-Offer',
    nombre_fr: 'Contre-Offre',
    idiomas: ['es', 'en', 'fr'],
    formato: 'bilingue_tabla',
    nota_idioma: {
      es: 'La versión en idioma inglés es solamente una traducción de cortesía. Para todos los efectos legales prevalecerá la versión en idioma español.',
      en: 'The English version is only a courtesy translation. For all legal effects the Spanish version will prevail.',
      fr: 'La version en français est uniquement une traduction de courtoisie. Pour tous les effets juridiques, la version en espagnol prévaudra.',
    },
  },

  // ============================================================
  // PARTES (simplificadas — heredan de oferta original)
  // ============================================================

  partes: [
    {
      id: 'ofertante',
      rol: 'ofertante',
      etiqueta: 'Ofertante / Comprador',
      etiqueta_en: 'Offerer / Buyer',
      etiqueta_fr: 'Proposant / Acheteur',
      min: 1,
      max: 4,
      campos: [
        { id: 'nombre', tipo: 'texto', requerido: true, etiqueta: 'Nombre completo', etiqueta_en: 'Full name', etiqueta_fr: 'Nom complet' },
        { id: 'genero', tipo: 'select', requerido: true, etiqueta: 'Género', opciones: [{ valor: 'M', texto: 'Masculino' }, { valor: 'F', texto: 'Femenino' }] },
      ],
    },
    {
      id: 'propietario',
      rol: 'propietario',
      etiqueta: 'Propietario / Vendedor',
      etiqueta_en: 'Owner / Seller',
      etiqueta_fr: 'Propriétaire / Vendeur',
      min: 1,
      max: 4,
      campos: [
        { id: 'nombre', tipo: 'texto', requerido: true, etiqueta: 'Nombre completo', etiqueta_en: 'Full name', etiqueta_fr: 'Nom complet' },
        { id: 'genero', tipo: 'select', requerido: true, etiqueta: 'Género', opciones: [{ valor: 'M', texto: 'Masculino' }, { valor: 'F', texto: 'Femenino' }] },
      ],
    },
  ],

  // ============================================================
  // CAMPOS GENERALES
  // ============================================================

  campos: {
    oferta_original: {
      etiqueta: 'Referencia a la oferta original',
      etiqueta_en: 'Reference to original offer',
      etiqueta_fr: 'Référence à l\'offre originale',
      campos: [
        { id: 'fecha_oferta', tipo: 'fecha', requerido: true, etiqueta: 'Fecha de la oferta original', etiqueta_en: 'Date of original offer', etiqueta_fr: 'Date de l\'offre originale' },
        { id: 'descripcion_inmueble', tipo: 'texto', requerido: true, etiqueta: 'Descripción corta del inmueble', etiqueta_en: 'Short property description', etiqueta_fr: 'Description courte du bien' },
        { id: 'precio_original', tipo: 'moneda', requerido: true, etiqueta: 'Precio original (USD)', etiqueta_en: 'Original price (USD)', etiqueta_fr: 'Prix original (USD)' },
      ],
    },

    modificaciones: {
      etiqueta: 'Modificaciones propuestas',
      etiqueta_en: 'Proposed modifications',
      etiqueta_fr: 'Modifications proposées',
      campos: [
        // Toggle 1: Precio
        { id: 'nuevo_precio', tipo: 'moneda', requerido: false, etiqueta: 'Nuevo precio (USD)', etiqueta_en: 'New price (USD)', etiqueta_fr: 'Nouveau prix (USD)' },
        
        // Toggle 2: Fecha de formalización
        { id: 'nueva_fecha_formalizacion', tipo: 'fecha', requerido: false, etiqueta: 'Nueva fecha de formalización', etiqueta_en: 'New closing date', etiqueta_fr: 'Nouvelle date de formalisation' },
        
        // Toggle 3: Notario
        { id: 'nuevo_notario_nombre', tipo: 'texto', requerido: false, etiqueta: 'Nombre del nuevo notario', etiqueta_en: 'New notary name', etiqueta_fr: 'Nom du nouveau notaire' },
        { id: 'nuevo_notario_numero', tipo: 'texto', requerido: false, etiqueta: 'Número de notaría', etiqueta_en: 'Notary number', etiqueta_fr: 'Numéro de notariat' },
        { id: 'nuevo_notario_ciudad', tipo: 'texto', requerido: false, etiqueta: 'Ciudad de la notaría', etiqueta_en: 'Notary city', etiqueta_fr: 'Ville du notariat' },
        
        // Toggle 4: Coordinador de cierre
        { id: 'nuevo_coordinador_nombre', tipo: 'texto', requerido: false, etiqueta: 'Nombre del nuevo coordinador', etiqueta_en: 'New coordinator name', etiqueta_fr: 'Nom du nouveau coordinateur' },
        { id: 'nuevo_coordinador_empresa', tipo: 'texto', requerido: false, etiqueta: 'Empresa del coordinador', etiqueta_en: 'Coordinator company', etiqueta_fr: 'Société du coordinateur' },
        
        // Toggle 5: Vigencia y hora
        { id: 'nueva_fecha_vigencia', tipo: 'fecha', requerido: false, etiqueta: 'Nueva fecha de vigencia', etiqueta_en: 'New expiration date', etiqueta_fr: 'Nouvelle date d\'expiration' },
        { id: 'nueva_hora_vigencia', tipo: 'select', requerido: false, etiqueta: 'Nueva hora de vigencia', opciones: [
          { valor: 'medianoche', texto: 'Medianoche / Midnight / Minuit' },
          { valor: 'mediodía', texto: 'Mediodía / Noon / Midi' },
          { valor: '17:00 horas', texto: '17:00 hrs' },
          { valor: '18:00 horas', texto: '18:00 hrs' },
        ], default: 'medianoche' },
        
        // Toggle 6: Depósito escrow (monto y/o empresa)
        { id: 'nuevo_deposito', tipo: 'moneda', requerido: false, etiqueta: 'Nuevo depósito escrow (USD)', etiqueta_en: 'New escrow deposit (USD)', etiqueta_fr: 'Nouveau dépôt escrow (USD)' },
        { id: 'nueva_empresa_escrow', tipo: 'select', requerido: false, etiqueta: 'Nueva empresa escrow', etiqueta_en: 'New escrow company', etiqueta_fr: 'Nouvelle société escrow', opciones: [
          { valor: '', texto: '— Sin cambio / No change —' },
          { valor: 'ARMOUR SECURE ESCROW, S DE RL DE CV', texto: 'ARMOUR SECURE ESCROW' },
          { valor: 'SECURE TITLE LATIN AMERICA INC', texto: 'SECURE TITLE LATIN AMERICA' },
          { valor: 'TLA LLC', texto: 'TLA LLC' },
          { valor: 'otro_escrow', texto: 'Otra empresa (captura manual)' },
        ] },
        { id: 'nueva_empresa_escrow_manual', tipo: 'texto', requerido: false, etiqueta: 'Nombre de empresa escrow (si otra)', etiqueta_en: 'Escrow company name (if other)', etiqueta_fr: 'Nom de la société escrow (si autre)' },
        
        // Toggle 7: Cláusula libre
        { id: 'clausula_libre_es', tipo: 'textarea', requerido: false, etiqueta: 'Cláusula adicional (español)', etiqueta_en: 'Additional clause (Spanish)', etiqueta_fr: 'Clause additionnelle (espagnol)' },
        { id: 'clausula_libre_en', tipo: 'textarea', requerido: false, etiqueta: 'Cláusula adicional (inglés)', etiqueta_en: 'Additional clause (English)', etiqueta_fr: 'Clause additionnelle (anglais)' },
        { id: 'clausula_libre_fr', tipo: 'textarea', requerido: false, etiqueta: 'Cláusula adicional (francés)', etiqueta_en: 'Additional clause (French)', etiqueta_fr: 'Clause additionnelle (français)' },
      ],
    },

    aceptacion: {
      etiqueta: 'Aceptación y vigencia',
      etiqueta_en: 'Acceptance and validity',
      etiqueta_fr: 'Acceptation et validité',
      campos: [
        { id: 'fecha_contraoferta', tipo: 'fecha', requerido: true, etiqueta: 'Fecha de la contraoferta', etiqueta_en: 'Counter-offer date', etiqueta_fr: 'Date de la contre-offre' },
        { id: 'ciudad_contraoferta', tipo: 'texto', requerido: true, etiqueta: 'Ciudad', etiqueta_en: 'City', etiqueta_fr: 'Ville', default: 'Bucerías, Nayarit' },
        { id: 'vigencia_horas', tipo: 'numero', requerido: true, etiqueta: 'Vigencia (horas)', etiqueta_en: 'Validity (hours)', etiqueta_fr: 'Validité (heures)', default: 48 },
      ],
    },
  },

  // ============================================================
  // BLOQUES CONDICIONALES (7 modificaciones)
  // ============================================================

  bloques: [

    // ---- ENCABEZADO / DECLARACIONES ----
    {
      id: 'encabezado',
      siempre: true,
      render: (ctx) => ({
        es: `CONTRAOFERTA Y CONVENIO MODIFICATORIO\n\nCon relación a la OFERTA DE INTENCIÓN DE COMPRA de fecha ${ctx.oferta_original.fecha_es}, presentada por ${ctx.ofertante.referencia} a ${ctx.propietario.referencia}, respecto del inmueble conocido como ${ctx.oferta_original.descripcion_inmueble}, por un precio original de ${ctx.oferta_original.precio_completo}, las partes acuerdan las siguientes modificaciones:`,
        en: `COUNTER-OFFER AND AMENDMENT AGREEMENT\n\nWith respect to the PURCHASE INTENT OFFER dated ${ctx.oferta_original.fecha_en}, submitted by ${ctx.ofertante.en.referencia} to ${ctx.propietario.en.referencia}, regarding the property known as ${ctx.oferta_original.descripcion_inmueble}, for an original price of ${ctx.oferta_original.precio_completo}, the parties agree to the following modifications:`,
        fr: `CONTRE-OFFRE ET CONVENTION MODIFICATIVE\n\nConcernant l'OFFRE D'INTENTION D'ACHAT en date du ${ctx.oferta_original.fecha_fr}, présentée par ${ctx.ofertante.fr.referencia} à ${ctx.propietario.fr.referencia}, relativement au bien immobilier connu sous le nom de ${ctx.oferta_original.descripcion_inmueble}, pour un prix original de ${ctx.oferta_original.precio_completo}, les parties conviennent des modifications suivantes:`,
      }),
    },

    // ---- TOGGLE 1: PRECIO ----
    {
      id: 'mod_precio',
      condicional: true,
      default: false,
      etiqueta: 'Modificar precio',
      etiqueta_en: 'Modify price',
      etiqueta_fr: 'Modifier le prix',
      render: (ctx) => ({
        es: `**PRIMERA. PRECIO.**\nSe modifica el precio de compraventa, de ${ctx.oferta_original.precio_completo} a ${ctx.modificaciones.nuevo_precio_completo}.`,
        en: `**FIRST. PRICE.**\nThe purchase price is modified from ${ctx.oferta_original.precio_completo} to ${ctx.modificaciones.nuevo_precio_completo}.`,
        fr: `**PREMIÈRE. PRIX.**\nLe prix de vente est modifié de ${ctx.oferta_original.precio_completo} à ${ctx.modificaciones.nuevo_precio_completo}.`,
      }),
    },

    // ---- TOGGLE 2: FECHA DE FORMALIZACIÓN ----
    {
      id: 'mod_fecha',
      condicional: true,
      default: false,
      etiqueta: 'Modificar fecha de formalización',
      etiqueta_en: 'Modify closing date',
      etiqueta_fr: 'Modifier la date de formalisation',
      render: (ctx) => ({
        es: `**SEGUNDA. FECHA DE FORMALIZACIÓN.**\nLa nueva fecha de formalización (cierre) será el ${ctx.modificaciones.nueva_fecha_formalizacion_es}.`,
        en: `**SECOND. CLOSING DATE.**\nThe new closing date shall be ${ctx.modificaciones.nueva_fecha_formalizacion_en}.`,
        fr: `**DEUXIÈME. DATE DE FORMALISATION.**\nLa nouvelle date de formalisation (clôture) sera le ${ctx.modificaciones.nueva_fecha_formalizacion_fr}.`,
      }),
    },

    // ---- TOGGLE 3: NOTARIO ----
    {
      id: 'mod_notario',
      condicional: true,
      default: false,
      etiqueta: 'Modificar notario',
      etiqueta_en: 'Modify notary',
      etiqueta_fr: 'Modifier le notaire',
      render: (ctx) => ({
        es: `**TERCERA. NOTARIO.**\nLa escritura de compraventa se formalizará ante ${ctx.modificaciones.nuevo_notario_nombre}, Notario Público ${ctx.modificaciones.nuevo_notario_numero} de ${ctx.modificaciones.nuevo_notario_ciudad}.`,
        en: `**THIRD. NOTARY.**\nThe deed of sale shall be executed before ${ctx.modificaciones.nuevo_notario_nombre}, Notary Public ${ctx.modificaciones.nuevo_notario_numero} of ${ctx.modificaciones.nuevo_notario_ciudad}.`,
        fr: `**TROISIÈME. NOTAIRE.**\nL'acte de vente sera formalisé devant ${ctx.modificaciones.nuevo_notario_nombre}, Notaire Public ${ctx.modificaciones.nuevo_notario_numero} de ${ctx.modificaciones.nuevo_notario_ciudad}.`,
      }),
    },

    // ---- TOGGLE 4: COORDINADOR DE CIERRE ----
    {
      id: 'mod_coordinador',
      condicional: true,
      default: false,
      etiqueta: 'Modificar coordinador de cierre',
      etiqueta_en: 'Modify closing coordinator',
      etiqueta_fr: 'Modifier le coordinateur de clôture',
      render: (ctx) => ({
        es: `**CUARTA. COORDINADOR DE CIERRE.**\nEl nuevo coordinador de cierre será ${ctx.modificaciones.nuevo_coordinador_nombre}${ctx.modificaciones.nuevo_coordinador_empresa ? ' de ' + ctx.modificaciones.nuevo_coordinador_empresa : ''}.`,
        en: `**FOURTH. CLOSING COORDINATOR.**\nThe new closing coordinator shall be ${ctx.modificaciones.nuevo_coordinador_nombre}${ctx.modificaciones.nuevo_coordinador_empresa ? ' of ' + ctx.modificaciones.nuevo_coordinador_empresa : ''}.`,
        fr: `**QUATRIÈME. COORDINATEUR DE CLÔTURE.**\nLe nouveau coordinateur de clôture sera ${ctx.modificaciones.nuevo_coordinador_nombre}${ctx.modificaciones.nuevo_coordinador_empresa ? ' de ' + ctx.modificaciones.nuevo_coordinador_empresa : ''}.`,
      }),
    },

    // ---- TOGGLE 5: VIGENCIA ----
    {
      id: 'mod_vigencia',
      condicional: true,
      default: false,
      etiqueta: 'Modificar vigencia de la oferta',
      etiqueta_en: 'Modify offer validity',
      etiqueta_fr: 'Modifier la validité de l\'offre',
      render: (ctx) => ({
        es: `**QUINTA. VIGENCIA.**\nLa nueva fecha de vigencia de la oferta será el ${ctx.modificaciones.nueva_fecha_vigencia_es}, a las ${ctx.modificaciones.nueva_hora_vigencia}.`,
        en: `**FIFTH. VALIDITY.**\nThe new offer expiration date shall be ${ctx.modificaciones.nueva_fecha_vigencia_en}, at ${ctx.modificaciones.nueva_hora_vigencia_en}.`,
        fr: `**CINQUIÈME. VALIDITÉ.**\nLa nouvelle date d'expiration de l'offre sera le ${ctx.modificaciones.nueva_fecha_vigencia_fr}, à ${ctx.modificaciones.nueva_hora_vigencia_fr}.`,
      }),
    },

    // ---- TOGGLE 6: DEPÓSITO ESCROW Y/O EMPRESA ----
    {
      id: 'mod_deposito',
      condicional: true,
      default: false,
      etiqueta: 'Modificar depósito escrow o empresa',
      etiqueta_en: 'Modify escrow deposit or company',
      etiqueta_fr: 'Modifier le dépôt escrow ou la société',
      render: (ctx) => {
        // Construir texto según qué cambió
        const cambioMonto = ctx.modificaciones.nuevo_deposito_completo;
        const cambioEmpresa = ctx.modificaciones.nueva_empresa_escrow;
        
        let textoEs = '**SEXTA. DEPÓSITO EN ESCROW.**\n';
        let textoEn = '**SIXTH. ESCROW DEPOSIT.**\n';
        let textoFr = '**SIXIÈME. DÉPÔT ESCROW.**\n';
        
        if (cambioMonto && cambioEmpresa) {
          textoEs += `El nuevo monto del depósito en escrow será de ${cambioMonto}, y se depositará con ${cambioEmpresa}.`;
          textoEn += `The new escrow deposit amount shall be ${cambioMonto}, to be deposited with ${cambioEmpresa}.`;
          textoFr += `Le nouveau montant du dépôt escrow sera de ${cambioMonto}, à déposer auprès de ${cambioEmpresa}.`;
        } else if (cambioMonto) {
          textoEs += `El nuevo monto del depósito en escrow será de ${cambioMonto}.`;
          textoEn += `The new escrow deposit amount shall be ${cambioMonto}.`;
          textoFr += `Le nouveau montant du dépôt escrow sera de ${cambioMonto}.`;
        } else if (cambioEmpresa) {
          textoEs += `El depósito en escrow se realizará con ${cambioEmpresa}.`;
          textoEn += `The escrow deposit shall be made with ${cambioEmpresa}.`;
          textoFr += `Le dépôt escrow sera effectué auprès de ${cambioEmpresa}.`;
        }
        
        return { es: textoEs, en: textoEn, fr: textoFr };
      },
    },

    // ---- TOGGLE 7: CLÁUSULA LIBRE ----
    {
      id: 'mod_clausula_libre',
      condicional: true,
      default: false,
      etiqueta: 'Agregar cláusula adicional',
      etiqueta_en: 'Add additional clause',
      etiqueta_fr: 'Ajouter une clause additionnelle',
      render: (ctx) => ({
        es: `**SÉPTIMA. CLÁUSULA ADICIONAL.**\n${ctx.modificaciones.clausula_libre_es || '[CLÁUSULA ADICIONAL]'}`,
        en: `**SEVENTH. ADDITIONAL CLAUSE.**\n${ctx.modificaciones.clausula_libre_en || '[ADDITIONAL CLAUSE]'}`,
        fr: `**SEPTIÈME. CLAUSE ADDITIONNELLE.**\n${ctx.modificaciones.clausula_libre_fr || '[CLAUSE ADDITIONNELLE]'}`,
      }),
    },

    // ---- CIERRE: RESTO SIN CAMBIOS ----
    {
      id: 'cierre_sin_cambios',
      siempre: true,
      render: (ctx) => ({
        es: `**CLÁUSULA FINAL.**\nTodas las demás cláusulas, términos y condiciones de la OFERTA DE INTENCIÓN DE COMPRA original de fecha ${ctx.oferta_original.fecha_es} que no hayan sido expresamente modificadas por el presente convenio, continuarán en pleno vigor y efecto.`,
        en: `**FINAL CLAUSE.**\nAll other clauses, terms, and conditions of the original PURCHASE INTENT OFFER dated ${ctx.oferta_original.fecha_en} that have not been expressly modified by this agreement shall remain in full force and effect.`,
        fr: `**CLAUSE FINALE.**\nToutes les autres clauses, termes et conditions de l'OFFRE D'INTENTION D'ACHAT originale datée du ${ctx.oferta_original.fecha_fr} qui n'ont pas été expressément modifiées par la présente convention resteront en pleine vigueur et effet.`,
      }),
    },

    // ---- VIGENCIA DE LA CONTRAOFERTA ----
    {
      id: 'vigencia_contraoferta',
      siempre: true,
      render: (ctx) => ({
        es: `**VIGENCIA DE ESTA CONTRAOFERTA.**\nLa presente contraoferta estará vigente por ${ctx.aceptacion.vigencia_horas} horas a partir de su presentación, es decir, hasta las ${ctx.aceptacion.hora_limite_es} del ${ctx.aceptacion.fecha_limite_es}. De no ser aceptada dentro de este plazo, se considerará automáticamente rechazada.`,
        en: `**VALIDITY OF THIS COUNTER-OFFER.**\nThis counter-offer shall be valid for ${ctx.aceptacion.vigencia_horas} hours from its submission, that is, until ${ctx.aceptacion.hora_limite_en} on ${ctx.aceptacion.fecha_limite_en}. If not accepted within this period, it shall be automatically deemed rejected.`,
        fr: `**VALIDITÉ DE CETTE CONTRE-OFFRE.**\nLa présente contre-offre sera valide pendant ${ctx.aceptacion.vigencia_horas} heures à compter de sa présentation, soit jusqu'à ${ctx.aceptacion.hora_limite_fr} le ${ctx.aceptacion.fecha_limite_fr}. En l'absence d'acceptation dans ce délai, elle sera automatiquement considérée comme rejetée.`,
      }),
    },

    // ---- ACEPTACIÓN ----
    {
      id: 'aceptacion',
      siempre: true,
      render: (ctx) => ({
        es: `**ACEPTACIÓN.**\nPara su aceptación, la parte receptora deberá firmar el presente documento y notificar su aceptación a la parte oferente por correo electrónico o cualquier medio electrónico que deje constancia fehaciente de su recepción.\n\nPresentada en ${ctx.aceptacion.ciudad_contraoferta}, el día ${ctx.aceptacion.fecha_contraoferta_es}.`,
        en: `**ACCEPTANCE.**\nFor acceptance, the receiving party must sign this document and notify the offering party of their acceptance by email or any electronic means that provides reliable proof of receipt.\n\nSubmitted in ${ctx.aceptacion.ciudad_contraoferta}, on ${ctx.aceptacion.fecha_contraoferta_en}.`,
        fr: `**ACCEPTATION.**\nPour acceptation, la partie réceptrice doit signer le présent document et notifier son acceptation à la partie offrante par courrier électronique ou tout moyen électronique fournissant une preuve fiable de réception.\n\nPrésentée à ${ctx.aceptacion.ciudad_contraoferta}, le ${ctx.aceptacion.fecha_contraoferta_fr}.`,
      }),
    },

    // ---- FIRMAS ----
    {
      id: 'firmas',
      siempre: true,
      tipo: 'firmas',
      render: (ctx) => ({
        es: '',
        en: '',
        fr: '',
        firmas: [
          {
            rol: ctx.quien_presenta === 'vendedor' ? 'propietario' : 'ofertante',
            etiqueta_es: ctx.quien_presenta === 'vendedor' ? 'PROPIETARIO / VENDEDOR' : 'OFERTANTE / COMPRADOR',
            etiqueta_en: ctx.quien_presenta === 'vendedor' ? 'OWNER / SELLER' : 'OFFERER / BUYER',
            etiqueta_fr: ctx.quien_presenta === 'vendedor' ? 'PROPRIÉTAIRE / VENDEUR' : 'PROPOSANT / ACHETEUR',
            nombre: ctx.quien_presenta === 'vendedor' ? ctx.propietario.nombres : ctx.ofertante.nombres,
            linea_firma: true,
          },
          {
            rol: 'aceptacion',
            etiqueta_es: 'ACEPTO / ACCEPTED / ACCEPTÉ',
            etiqueta_en: 'ACEPTO / ACCEPTED / ACCEPTÉ',
            etiqueta_fr: 'ACEPTO / ACCEPTED / ACCEPTÉ',
            nombre: ctx.quien_presenta === 'vendedor' ? ctx.ofertante.nombres : ctx.propietario.nombres,
            linea_firma: true,
            fecha_linea: true,
          },
        ],
      }),
    },

  ],

};

export default PLANTILLA_CONTRAOFERTA;
