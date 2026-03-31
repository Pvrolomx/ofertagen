/**
 * OfertaGen — Traducciones Francesas
 * 
 * Mapeo de bloques ES → FR para la comunidad francocanadiense.
 * Se usa en conjunto con oferta_compra.js cuando idioma_secundario = 'fr'
 */

// Títulos de cláusulas en francés
export const TITULOS_FR = {
  'cl_ofertante': (ctx) => `${ctx.ofertante.fr?.referencia || "L'OFFRANT"}`,
  'cl_propietario': (ctx) => `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'}`,
  'cl_antecedente': 'L\'IMMEUBLE',
  'cl_precio': 'PRIX DE VENTE ET MODALITÉS DE PAIEMENT',
  'cl_escrow': 'DÉPÔT EN GARANTIE (ESCROW)',
  'cl_escrituracion': 'FRAIS DE NOTAIRE',
  'cl_formalizacion': 'DATE DE FORMALISATION',
  'cl_vigencia': 'DURÉE DE VALIDITÉ',
  'cl_incumplimiento': 'INEXÉCUTION ET PÉNALITÉ',
  'cl_jurisdiccion': 'JURIDICTION',
  'cl_email': 'COMMUNICATIONS ÉLECTRONIQUES',
  'cl_cierre': '',
  'cl_nota_idioma': '',
};

// Traducciones de bloques condicionales y fijos
export const BLOQUES_FR = {
  
  // ---- COMPARECENCIA ----
  'cl_ofertante': (ctx) => 
    `${ctx.ofertante.fr?.referencia || "L'OFFRANT"}, de nationalité ${ctx.ofertante.nacionalidad || 'étrangère'}, ci-après dénommé ${ctx.ofertante.fr?.referenciaConComillas || '"L\'OFFRANT"'}, déclare avoir la capacité juridique et économique nécessaire pour contracter selon les termes du présent accord, et désigne comme adresse conventionnelle ${ctx.ofertante.domicilio || '[ADRESSE]'}.`,

  'cl_propietario': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'}, de nationalité ${ctx.propietario.nacionalidad || 'mexicaine'}, ci-après dénommé ${ctx.propietario.fr?.referenciaConComillas || '"LE PROPRIÉTAIRE"'}, déclare avoir la capacité juridique nécessaire pour contracter selon les termes du présent accord, et désigne comme adresse conventionnelle l'immeuble objet de la présente offre.`,

  // ---- ADJUDICACIÓN CÓNYUGE ----
  'adjudicacion_conyuge': (ctx) =>
    `De même, ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} déclare que simultanément à la vente actuelle, elle sera attributaire de 50% des droits fiduciaires qui correspondaient à son défunt époux, consolidant 100% des droits fiduciaires en sa personne.`,

  // ---- ANTECEDENTE ----
  'cl_antecedente': (ctx) => {
    const usoFr = ctx.inmueble.tiene_uso_exclusivo && ctx.inmueble.notas_uso_exclusivo
      ? `. Cette unité a l'usage exclusif de ${ctx.inmueble.notas_uso_exclusivo}` : '';
    const catFr = ctx.inmueble.clave_catastral ? ` et clé cadastrale ${ctx.inmueble.clave_catastral}` : '';
    
    return `Qu'en date du ${ctx.antecedente.fecha_escritura_es}, par acte notarié ${ctx.antecedente.numero_escritura} devant ${ctx.antecedente.notario_anterior}, Notaire Public ${ctx.antecedente.numero_notaria_anterior} de ${ctx.antecedente.ciudad_notaria_anterior}, a acquis les droits fiduciaires sur l'immeuble suivant:\n\n${ctx.inmueble.descripcion_corta}, situé ${ctx.inmueble.ubicacion_completa}${ctx.inmueble.nivel_torre ? ', au ' + ctx.inmueble.nivel_torre : ''}${ctx.inmueble.descripcion_interior ? ' comprenant ' + ctx.inmueble.descripcion_interior : ''}, d'une surface construite de ${ctx.inmueble.superficie_m2} mètres carrés${ctx.inmueble.indiviso ? ', correspondant à une quote-part indivise de ' + ctx.inmueble.indiviso + ' pour cent des parties communes' : ''}${usoFr}, avec les mesures et limites décrites dans l'acte susmentionné${ctx.antecedente.cuenta_predial ? ', Compte Foncier ' + ctx.antecedente.cuenta_predial : ''}${catFr} (ci-après dénommé L'IMMEUBLE).`;
  },

  // ---- AD CORPUS / AS-IS ----
  'ad_corpus': (ctx) =>
    `Les parties conviennent expressément que la présente opération est réalisée "AD CORPUS" (par corps certain), ce qui signifie que les surfaces et mesures indiquées sont approximatives et qu'aucune différence en plus ou en moins ne donnera lieu à un ajustement du prix convenu.\n\nDe même, l'IMMEUBLE est vendu dans son état actuel "AS-IS" (tel quel), L'OFFRANT déclarant avoir inspecté l'immeuble et l'accepter avec l'usure normale correspondant à son âge et à son utilisation.`,

  // ---- PRECIO ----
  'cl_precio': (ctx) =>
    `${ctx.ofertante.fr?.referencia || "L'OFFRANT"} offre d'acheter L'IMMEUBLE pour la somme de ${ctx.precio.precio_formateado} ${ctx.precio.moneda} (${ctx.precio.precio_letras} ${ctx.precio.moneda_letras}), payable comme suit:\n\n${ctx.precio.deposito_formateado} ${ctx.precio.moneda} (${ctx.precio.deposito_letras} ${ctx.precio.moneda_letras}), qui sera déposé dans les ${ctx.precio.dias_deposito} jours suivant l'acceptation de cette offre sur le COMPTE SÉQUESTRE.\n\nLe solde de ${ctx.precio.saldo_formateado} ${ctx.precio.moneda} (${ctx.precio.saldo_letras} ${ctx.precio.moneda_letras}) sera déposé avant la DATE DE FORMALISATION sur le COMPTE SÉQUESTRE.`,

  // ---- ESCROW ----
  'cl_escrow': (ctx) =>
    `Les parties désignent ${ctx.escrow.empresa_escrow} comme dépositaire pour recevoir et administrer les fonds selon le contrat de dépôt en garantie (Escrow Agreement) qui sera signé à cet effet. Les instructions de virement seront fournies par la société de dépôt directement à ${ctx.ofertante.fr?.referencia || "L'OFFRANT"}.`,

  // ---- DOC FIDEICOMISO ----
  'doc_fideicomiso': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} s'engage à remettre à ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} une copie du contrat de fidéicommis dans les cinq (5) jours ouvrables suivant l'acceptation de la présente offre. ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} dispose de dix (10) jours calendaires supplémentaires à compter de la réception pour examiner le document. Si des conditions inacceptables sont identifiées, l'offre devient nulle et le dépôt sera remboursé intégralement à ${ctx.ofertante.fr?.referencia || "L'OFFRANT"}.`,

  // ---- INSPECCIÓN ----
  'inspeccion': (ctx) =>
    `${ctx.ofertante.fr?.referencia || "L'OFFRANT"} dispose de ${ctx.inspeccion.dias_inspeccion_letras || ctx.inspeccion.dias_inspeccion} (${ctx.inspeccion.dias_inspeccion}) jours calendaires à compter de l'acceptation de cette offre pour effectuer une inspection professionnelle de L'IMMEUBLE. Une fois le rapport d'inspection reçu, ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} dispose de ${ctx.inspeccion.dias_revision_letras || ctx.inspeccion.dias_revision} (${ctx.inspeccion.dias_revision}) jours calendaires supplémentaires pour l'examiner.\n\nSi des défauts majeurs affectant la structure ou les systèmes essentiels de L'IMMEUBLE sont identifiés, les parties négocieront une solution. En l'absence d'accord, cette offre devient nulle et le dépôt sera remboursé intégralement à ${ctx.ofertante.fr?.referencia || "L'OFFRANT"}.`,

  // ---- FINANCIAMIENTO ----
  'financiamiento': (ctx) =>
    `La présente offre est conditionnée à l'obtention par ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} d'un crédit hypothécaire. ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} dispose de ${ctx.financiamiento?.dias_financiamiento || 30} jours calendaires à compter de l'acceptation pour obtenir une lettre d'approbation de crédit. Si le financement n'est pas obtenu dans ce délai, l'offre devient nulle et le dépôt sera remboursé intégralement à ${ctx.ofertante.fr?.referencia || "L'OFFRANT"}.`,

  // ---- INVENTARIO ----
  'inventario': (ctx) =>
    `L'IMMEUBLE sera livré avec le mobilier et les équipements décrits dans l'inventaire annexé à la présente offre. Tout mobilier non mentionné dans l'inventaire sera retiré par ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} avant la DATE DE FORMALISATION.\n\nSi ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} ne livre pas L'IMMEUBLE avec l'inventaire complet, cela constitue un manquement, et ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} dispose de trois (3) jours calendaires pour rectifier, sauf cas de force majeure (vols, ouragans, ondes de tempête).`,

  // ---- ARRENDAMIENTOS ----
  'arrendamientos': (ctx) => {
    let hastaFr = "jusqu'à la DATE DE FORMALISATION";
    if (ctx.arrendamientos?.renta_hasta === 'escrow') {
      hastaFr = "jusqu'à ce que les fonds soient reflétés sur le COMPTE SÉQUESTRE";
    } else if (ctx.arrendamientos?.renta_hasta === 'cuenta_vendedor') {
      hastaFr = "jusqu'à ce que les fonds soient reflétés sur le compte de " + (ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE');
    }
    return `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} aura droit à tous les revenus locatifs générés par L'IMMEUBLE ${hastaFr}.\n\n${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} s'engage à fournir une copie des contrats de location en vigueur dans les cinq (5) jours ouvrables suivant l'acceptation de cette offre. ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} dispose de cinq (5) jours calendaires supplémentaires pour les examiner. En cas de conditions inacceptables, l'offre devient nulle et le dépôt sera remboursé.`;
  },

  // ---- ZONA FEDERAL ----
  'zona_federal': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} déclare que L'IMMEUBLE comprend une zone de concession fédérale. La transmission de la concession fédérale est une condition suspensive de cette offre. Si la transmission n'est pas possible, l'offre devient nulle et le dépôt sera remboursé intégralement à ${ctx.ofertante.fr?.referencia || "L'OFFRANT"}.`,

  // ---- LITIGIOS PENDIENTES ----
  'litigios_pendientes': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} déclare qu'il n'existe pas de litiges judiciaires ou administratifs en cours affectant L'IMMEUBLE. Si de tels litiges existent et ne sont pas divulgués, ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} dispose de cinq (5) jours calendaires après les avoir découverts pour accepter ou rejeter la situation. En cas de rejet, l'offre devient nulle et le dépôt sera remboursé.`,

  // ---- EMPLEADOS CONDICIÓN ----
  'empleados_condicion': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} déclare qu'il n'existe pas d'employés assignés à L'IMMEUBLE avec des obligations patronales en suspens. Si de tels employés existent, ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} dispose de trois (3) jours ouvrables pour fournir la documentation prouvant l'absence d'obligations. En cas de non-conformité, l'offre devient nulle et le dépôt sera remboursé.`,

  // ---- COMISIÓN ----
  'comision': (ctx) => {
    const ivaText = ctx.comision.incluye_iva ? ' plus TVA' : '';
    let agenciasText = `${ctx.comision.agencia1_nombre} (${ctx.comision.agencia1_porcentaje})`;
    if (ctx.comision.agencia2_nombre) {
      agenciasText += ` et ${ctx.comision.agencia2_nombre} (${ctx.comision.agencia2_porcentaje})`;
    }
    return `Les parties conviennent que la commission immobilière sera de ${ctx.comision.porcentaje_total}${ivaText} sur le prix de vente, payable par ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} au moment de la formalisation de l'acte, à distribuer entre: ${agenciasText}.`;
  },

  // ---- CONDICIÓN USO ----
  'condicion_uso': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} s'engage à permettre à ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} et/ou ses représentants d'accéder à L'IMMEUBLE pour des inspections, des évaluations, des mesures et d'autres activités raisonnablement nécessaires à la conclusion de cette transaction, avec un préavis raisonnable.`,

  // ---- OBLIGACIONES VENDEDOR ----
  'obligaciones_vendedor': (ctx) => {
    let serviciosText = `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} s'engage à effectuer le transfert des services (électricité, eau, gaz, internet, etc.) dans les trente (30) jours calendaires suivant la DATE DE FORMALISATION. En cas de non-respect, ${ctx.ofertante.fr?.referencia || "L'OFFRANT"} est autorisé à annuler les services et à contracter de nouveaux en son nom, aux frais de ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'}.`;
    if (ctx.obligaciones_vendedor_agua) {
      serviciosText += `\n\n${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} s'engage spécifiquement à ce que le service d'eau soit à jour et sans dette au moment de la formalisation.`;
    }
    return serviciosText;
  },

  // ---- DERECHO DEDUCCIÓN ----
  'derecho_deduccion': (ctx) =>
    `${ctx.ofertante.fr?.referencia || "L'OFFRANT"} aura le droit de demander au notaire de déduire du prix de vente toute dette, impôt ou charge en suspens affectant L'IMMEUBLE, avec les fonds correspondants retenus sur le COMPTE SÉQUESTRE jusqu'à leur règlement.`,

  // ---- AUDITORÍA HACIENDA ----
  'auditoria_hacienda': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} déclare être à jour de toutes les obligations fiscales liées à L'IMMEUBLE. ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} sera responsable de toutes les dettes ou impôts générés avant la DATE DE FORMALISATION, y compris ceux qui pourraient être découverts lors d'un audit ultérieur.`,

  // ---- HOLDBACK ESCROW ----
  'holdback_escrow': (ctx) =>
    `Les parties conviennent de retenir sur le COMPTE SÉQUESTRE un montant équivalent à douze (12) mois de charges de copropriété pour garantir tout ajustement après la formalisation. ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} devra fournir une lettre de l'administrateur du condominium confirmant l'absence de dettes. Tout excédent sera restitué à ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} dans les 30 jours suivant la réception de ladite lettre.`,

  // ---- FUERZA MAYOR ----
  'fuerza_mayor': (ctx) =>
    `En cas de force majeure (pandémies, ouragans, tremblements de terre, tsunamis, guerres, troubles civils, ou actes de Dieu) empêchant la formalisation dans les délais convenus, les parties conviennent d'une prolongation automatique de quatre-vingt-dix (90) jours calendaires. Si après cette période l'empêchement persiste, l'une ou l'autre des parties peut résilier cette offre par consentement mutuel écrit, sans pénalité, et le dépôt sera remboursé intégralement à ${ctx.ofertante.fr?.referencia || "L'OFFRANT"}.\n\nEn cas de décès de l'une des parties, les obligations de cette offre seront transmises à ses héritiers ou ayants droit.`,

  // ---- FACTURA COMPLEMENTARIA ----
  'factura_complementaria': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} émettra une facture complémentaire pour la différence entre le prix déclaré dans l'acte et le prix réel de la transaction, conformément aux dispositions fiscales applicables.`,

  // ---- DISCLOSURE ----
  'disclosure': (ctx) =>
    `${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'} déclare avoir divulgué toute information pertinente concernant l'état physique, juridique et administratif de L'IMMEUBLE. Toute omission significative constitue un manquement à cette offre.`,

  // ---- ESCRITURACIÓN ----
  'cl_escrituracion': (ctx) =>
    `Les frais de notaire pour la formalisation de cette opération seront répartis conformément aux usages locaux: les frais liés au vendeur (certificat de non-gage, lettre de l'administrateur, constance de liberté de gravamen) seront à la charge de ${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'}, et les frais liés à l'acheteur (droits d'acquisition, ISR le cas échéant, constitution de fidéicommis) seront à la charge de ${ctx.ofertante.fr?.referencia || "L'OFFRANT"}.`,

  // ---- FORMALIZACIÓN ----
  'cl_formalizacion': (ctx) =>
    `Les parties conviennent que l'acte de cession des droits fiduciaires sera formalisé devant ${ctx.notario.nombre_completo}, Notaire Public ${ctx.notario.numero_notaria} de ${ctx.notario.ciudad_notaria}, le ${ctx.fechas.fecha_formalizacion}, avec possibilité de prolongation jusqu'au ${ctx.fechas.fecha_extension || '[DATE D\'EXTENSION]'} par accord mutuel.`,

  // ---- VIGENCIA ----
  'cl_vigencia': (ctx) =>
    `La présente offre sera valide à partir de sa présentation et jusqu'à ${ctx.fechas.fecha_vigencia_fr || ctx.fechas.fecha_vigencia || '[DATE]'}. Si elle n'est pas acceptée dans ce délai, elle deviendra automatiquement sans effet.`,

  // ---- INCUMPLIMIENTO ----
  'cl_incumplimiento': (ctx) => {
    let distribucionText = '';
    if (ctx.penalidad.distribuir_agencia) {
      distribucionText = ` Cette pénalité sera distribuée comme suit: ${ctx.penalidad.pct_parte_afectada || '60%'} pour la partie lésée et ${ctx.penalidad.pct_agencia || '40%'} pour l'agence immobilière.`;
    }
    return `En cas d'inexécution de l'une des parties, celle-ci s'engage à payer à titre de clause pénale la somme équivalente à ${ctx.penalidad.porcentaje_penalidad} (${ctx.penalidad.porcentaje_penalidad_letras || 'dix pour cent'}) du prix de vente, soit ${ctx.penalidad.monto_penalidad_formateado || '[MONTANT]'} ${ctx.precio.moneda}.${distribucionText}\n\nCette clause pénale est indépendante de toute autre action légale que la partie lésée pourrait exercer.`;
  },

  // ---- JURISDICCIÓN ----
  'cl_jurisdiccion': (ctx) =>
    `Pour tout différend découlant de la présente offre, les parties se soumettent expressément à la juridiction des tribunaux compétents de ${ctx.jurisdiccion.ciudad_jurisdiccion}, renonçant à tout autre for qui pourrait leur correspondre en raison de leur domicile présent ou futur.`,

  // ---- EMAIL / COMUNICACIONES ----
  'cl_email': (ctx) =>
    `Les parties conviennent que les communications électroniques (courrier électronique, WhatsApp, et autres moyens similaires) auront pleine validité aux fins de cette offre, y compris les notifications, accords et modifications. Sont également valides les signatures via des plateformes électroniques telles que DocuSign, Adobe Sign, ou autres moyens analogues de signature électronique. Les adresses électroniques désignées sont:\n\n${ctx.ofertante.fr?.referencia || "L'OFFRANT"}: ${ctx.ofertante.email || '[EMAIL]'}\n${ctx.propietario.fr?.referencia || 'LE PROPRIÉTAIRE'}: ${ctx.propietario.email || '[EMAIL]'}`,

  // ---- DOCUMENTOS INTEGRALES ----
  'documentos_integrales': (ctx) =>
    `Les documents suivants font partie intégrante de la présente offre:\n\n1. Documents contenant la conformité et la levée des Conditions Suspensives;\n2. Contrat de Dépôt en Garantie (Escrow Agreement), le cas échéant;\n3. Avenants, documents et annexes signés par les Parties;\n4. Inventaire détaillé de l'immeuble, le cas échéant.`,

  // ---- PROTECCIÓN DATOS ----
  'proteccion_datos': (ctx) =>
    `Les parties reconnaissent que les données personnelles échangées dans la présente offre sont collectées uniquement aux fins de cette transaction immobilière et seront partagées exclusivement avec le Notaire Public désigné, la société de dépôt et les agents immobiliers directement impliqués. Les données ne seront pas utilisées à d'autres fins que celles établies ici, ni divulguées à des tiers sans consentement exprès, sauf demande d'une autorité compétente. Chaque partie conservera les données uniquement pendant le temps nécessaire pour remplir les obligations découlant de cette opération et se conformer aux dispositions légales applicables.`,

  // ---- DUPLICADOS ----
  'duplicados': (ctx) =>
    `La présente offre peut être signée en plusieurs exemplaires, et il suffit qu'elle soit signée et paraphée sur toutes ses pages par l'une des parties pour être valide. Les parties conviennent de reconnaître les communications électroniques entre elles, ainsi que le consentement donné par ces moyens.`,

  // ---- CIERRE ----
  'cl_cierre': (ctx) =>
    `La présente offre est présentée dans la ville de ${ctx.fechas.ciudad_presentacion}, le ${ctx.fechas.fecha_presentacion_fr || ctx.fechas.fecha_presentacion_es}.`,

  // ---- NOTA IDIOMA ----
  'cl_nota_idioma': (ctx) =>
    `La version en français est uniquement une traduction de courtoisie. Pour tous les effets juridiques, la version en espagnol prévaudra.`,
};

/**
 * Obtiene la traducción francesa de un bloque
 * @param {string} bloqueId - ID del bloque
 * @param {Object} ctx - Contexto con datos del contrato
 * @returns {string} Texto en francés
 */
export function obtenerTraduccionFr(bloqueId, ctx) {
  const traductor = BLOQUES_FR[bloqueId];
  if (!traductor) return null;
  
  if (typeof traductor === 'function') {
    return traductor(ctx);
  }
  return traductor;
}

/**
 * Obtiene el título en francés de una cláusula
 * @param {string} bloqueId - ID del bloque
 * @param {Object} ctx - Contexto
 * @returns {string} Título en francés
 */
export function obtenerTituloFr(bloqueId, ctx) {
  const titulo = TITULOS_FR[bloqueId];
  if (!titulo) return null;
  
  if (typeof titulo === 'function') {
    return titulo(ctx);
  }
  return titulo;
}
