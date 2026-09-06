/**
 * ConvenioGen — Plantilla: Convenio Privado de Enajenación de Bienes Muebles
 *
 * Producto hermano de OfertaGen. Es el documento al que la propia oferta remite
 * cuando el precio es compuesto ("se formalizará por separado mediante Contrato
 * Privado de Compraventa de Bienes Muebles"): OfertaGen generaba la referencia
 * pero no el instrumento.
 *
 * Arquitectura:
 *   - Deep link desde OfertaGen (hereda partes, precio de muebles, escrow, fechas)
 *   - Cláusulas numeradas dinámicamente (PRIMERA, SEGUNDA… según cuáles se activen)
 *   - Bilingüe ES/EN
 *   - Anexo A (inventario) se elabora MANUALMENTE: el convenio solo lo identifica
 *
 * Basado en el ejercicio Veneros 204 (D'Agata → Busso Rojo, ago-2026), con tres
 * correcciones respecto de aquel: el IVA se traslada de forma expresa, la
 * "unidad indivisible" es opt-in por su costo fiscal, y no se pretende vincular
 * al notario en materia de retenciones.
 */

const PLANTILLA_CONVENIO_MUEBLES = {

  meta: {
    id: 'convenio_muebles',
    version: '1.0.0',
    nombre: 'Convenio Privado de Enajenación de Bienes Muebles',
    nombre_en: 'Private Agreement for the Sale of Personal Property',
    idiomas: ['es', 'en'],
    formato: 'bilingue_tabla',
    nota_idioma: {
      es: 'La versión en idioma inglés es solamente una traducción de cortesía. Para todos los efectos legales prevalecerá la versión en idioma español.',
      en: 'The English version is only a courtesy translation. For all legal effects the Spanish version will prevail.',
    },
  },

  partes: [
    {
      id: 'enajenante',
      rol: 'enajenante',
      etiqueta: 'Enajenante / Vendedor',
      etiqueta_en: 'Seller',
      min: 1,
      max: 4,
    },
    {
      id: 'adquirente',
      rol: 'adquirente',
      etiqueta: 'Adquirente / Comprador',
      etiqueta_en: 'Buyer',
      min: 1,
      max: 4,
    },
  ],

  bloques: [

    // ============================================================
    // ENCABEZADO Y DECLARACIONES
    // ============================================================
    {
      id: 'encabezado',
      siempre: true,
      titulo: {
        es: 'CONVENIO PRIVADO DE ENAJENACIÓN DE BIENES MUEBLES',
        en: 'PRIVATE AGREEMENT FOR THE SALE OF PERSONAL PROPERTY',
      },
      tituloFn: true,
      render: (ctx) => {
        const conVehiculo = ctx.bloques.vehiculo;
        const tituloEs = conVehiculo
          ? 'CONVENIO PRIVADO DE ENAJENACIÓN DE BIENES MUEBLES, ENSERES Y VEHÍCULO'
          : 'CONVENIO PRIVADO DE ENAJENACIÓN DE BIENES MUEBLES Y ENSERES';
        const tituloEn = conVehiculo
          ? 'PRIVATE AGREEMENT FOR THE SALE OF PERSONAL PROPERTY, FURNISHINGS AND VEHICLE'
          : 'PRIVATE AGREEMENT FOR THE SALE OF PERSONAL PROPERTY AND FURNISHINGS';

        return {
          titulo_es: tituloEs,
          titulo_en: tituloEn,
          es: `En ${ctx.lugar.ciudad}, a los ${ctx.lugar.fecha_es}, celebran el presente Convenio Privado de Enajenación: por una parte, ${ctx.enajenante.comparecencia}, a quien en lo sucesivo se le denominará ${ctx.enajenante.referenciaConComillas}; y por la otra parte, ${ctx.adquirente.comparecencia}, a quien en lo sucesivo se le denominará ${ctx.adquirente.referenciaConComillas}; al tenor de las siguientes Declaraciones y Cláusulas:`,
          en: `In ${ctx.lugar.ciudad}, on ${ctx.lugar.fecha_en}, this Private Sale Agreement is entered into by and between: ${ctx.enajenante.comparecencia_en}, hereinafter ${ctx.enajenante.en.referenciaConComillas}; and ${ctx.adquirente.comparecencia_en}, hereinafter ${ctx.adquirente.en.referenciaConComillas}; pursuant to the following Recitals and Clauses:`,
        };
      },
    },

    {
      id: 'declaraciones',
      siempre: true,
      titulo: { es: 'DECLARACIONES', en: 'RECITALS' },
      render: (ctx) => {
        const ubi = ctx.inmueble.identificacion;
        const ubiEn = ctx.inmueble.identificacion_en || ubi;

        const vehEs = ctx.bloques.vehiculo
          ? `\n\nII. DECLARA ${ctx.enajenante.referenciaConComillas}: Que asimismo tiene la propiedad y libre disposición del vehículo automotor que se identifica y describe en el ANEXO "B" (en adelante EL VEHÍCULO), el cual se encuentra libre de gravamen, adeudo, reserva de dominio y de cualquier limitación de dominio, y al corriente en el pago de sus contribuciones vehiculares.`
          : '';
        const vehEn = ctx.bloques.vehiculo
          ? `\n\nII. ${ctx.enajenante.en.referenciaConComillas} DECLARES: That it likewise holds title and free disposition of the motor vehicle identified and described in EXHIBIT "B" (hereinafter THE VEHICLE), which is free of any lien, debt, retention of title or other limitation of ownership, and current in the payment of its vehicle taxes and fees.`
          : '';

        const nIII = ctx.bloques.vehiculo ? 'III' : 'II';
        const nIV = ctx.bloques.vehiculo ? 'IV' : 'III';
        const objetoEs = ctx.bloques.vehiculo ? 'LOS BIENES MUEBLES y EL VEHÍCULO' : 'LOS BIENES MUEBLES';
        const objetoEn = ctx.bloques.vehiculo ? 'THE PERSONAL PROPERTY and THE VEHICLE' : 'THE PERSONAL PROPERTY';

        return {
          es: `I. DECLARA ${ctx.enajenante.referenciaConComillas}: Que tiene la propiedad, posesión legítima, pleno dominio y libre disposición de los bienes muebles, electrodomésticos, enseres y elementos de decoración que actualmente se encuentran en el interior de ${ubi} (en adelante LOS BIENES MUEBLES), los cuales se relacionan de forma individual, con descripción y valor asignado por partida, en el ANEXO "A" (Inventario Detallado con Valores Asignados).${vehEs}\n\n${nIII}. DECLARA ${ctx.adquirente.referenciaConComillas}: Que es su voluntad adquirir ${objetoEs} en los términos de este convenio, y que tendrá oportunidad de inspeccionarlos físicamente y de aprobar el inventario y la documentación que los ampara con anterioridad a la firma definitiva.\n\n${nIV}. DECLARAN AMBAS PARTES: Que de forma simultánea a la firma de este instrumento suscriben una Oferta de Compra respecto del inmueble antes descrito, y que es su expresa voluntad celebrar el presente convenio de manera separada e independiente de la transmisión de dicho inmueble, por tratarse de bienes de naturaleza distinta.`,
          en: `I. ${ctx.enajenante.en.referenciaConComillas} DECLARES: That it holds title, lawful possession, full ownership and free disposition of the personal property, appliances, furnishings and decorative items currently located within ${ubiEn} (hereinafter THE PERSONAL PROPERTY), individually itemized, with description and value assigned per item, in EXHIBIT "A" (Itemized Inventory with Assigned Values).${vehEn}\n\n${nIII}. ${ctx.adquirente.en.referenciaConComillas} DECLARES: That it is its will to acquire ${objetoEn} under the terms of this agreement, and that it shall have the opportunity to physically inspect them and to approve the inventory and their supporting documentation prior to definitive execution.\n\n${nIV}. BOTH PARTIES DECLARE: That simultaneously with the execution of this instrument they enter into a Purchase Offer regarding the real property described above, and that it is their express will to enter into this agreement separately and independently from the transfer of said real property, these being assets of a different nature.`,
        };
      },
    },

    // ============================================================
    // CLÁUSULAS (numeradas dinámicamente)
    // ============================================================

    {
      id: 'cl_antecedente',
      siempre: true,
      ordinal: true,
      etiqueta: 'Antecedente jurídico y simultaneidad de firma',
      titulo: { es: 'ANTECEDENTE JURÍDICO Y SIMULTANEIDAD DE FIRMA', en: 'LEGAL BACKGROUND AND SIMULTANEOUS EXECUTION' },
      render: (ctx) => ({
        es: `El presente convenio se celebra de forma simultánea a la Oferta de Compra del inmueble que las partes suscriben en esta misma fecha. Ambos instrumentos se firman en un mismo acto.`,
        en: `This agreement is entered into simultaneously with the Purchase Offer for the real property executed by the parties on this same date. Both instruments are signed in a single act.`,
      }),
    },

    {
      id: 'cl_objeto_precio',
      siempre: true,
      ordinal: true,
      etiqueta: 'Objeto y precio',
      titulo: { es: 'OBJETO Y PRECIO', en: 'OBJECT AND PRICE' },
      render: (ctx) => {
        const conVeh = ctx.bloques.vehiculo;
        const objetoEs = conVeh ? 'LOS BIENES MUEBLES y de EL VEHÍCULO' : 'LOS BIENES MUEBLES';
        const objetoEn = conVeh ? 'THE PERSONAL PROPERTY and THE VEHICLE' : 'THE PERSONAL PROPERTY';
        // Absorbe la preposicion para evitar "conforme a el ANEXO".
        const anexosEs = conVeh ? 'a los ANEXOS "A" y "B" que, firmados' : 'al ANEXO "A" que, firmado';
        const anexosEn = conVeh ? 'EXHIBITS "A" and "B" which, signed' : 'EXHIBIT "A" which, signed';

        // Desglose muebles / vehículo sólo cuando hay vehículo y su precio está capturado.
        const desgloseEs = conVeh && ctx.precio.muebles && ctx.precio.vehiculo
          ? `, que se integra de la siguiente manera: por LOS BIENES MUEBLES, la cantidad de ${ctx.precio.muebles.completo}; y por EL VEHÍCULO, la cantidad de ${ctx.precio.vehiculo.completo}`
          : '';
        const desgloseEn = conVeh && ctx.precio.muebles && ctx.precio.vehiculo
          ? `, allocated as follows: for THE PERSONAL PROPERTY, the amount of ${ctx.precio.muebles.completo_en}; and for THE VEHICLE, the amount of ${ctx.precio.vehiculo.completo_en}`
          : '';

        const sustentoEs = conVeh
          ? ` El valor de LOS BIENES MUEBLES se sustenta en el inventario detallado del ANEXO "A", y el de EL VEHÍCULO en su identificación y documentación contenidas en el ANEXO "B".`
          : ` El valor de LOS BIENES MUEBLES se sustenta en el inventario detallado del ANEXO "A".`;
        const sustentoEn = conVeh
          ? ` The value of THE PERSONAL PROPERTY is supported by the itemized inventory in EXHIBIT "A", and that of THE VEHICLE by its identification and documentation set forth in EXHIBIT "B".`
          : ` The value of THE PERSONAL PROPERTY is supported by the itemized inventory in EXHIBIT "A".`;

        return {
          es: `${ctx.enajenante.referenciaConComillas} vende y transmite a ${ctx.adquirente.referenciaConComillas}, quien compra y adquiere para sí, la propiedad y legítima posesión de ${objetoEs}, conforme ${anexosEs} por las partes, forma${conVeh ? 'n' : ''} parte integral de este convenio.\n\nEl precio total convenido por la enajenación es la cantidad de ${ctx.precio.total.completo}${desgloseEs}.${sustentoEs} Las partes reconocen que se trata de valores individualmente asignados y aceptados por ambas, sustentados documentalmente.`,
          en: `${ctx.enajenante.en.referenciaConComillas} sells and transfers to ${ctx.adquirente.en.referenciaConComillas}, who purchases and acquires for itself, the ownership and lawful possession of ${objetoEn}, in accordance with ${anexosEn} by the parties, form${conVeh ? '' : 's'} an integral part of this agreement.\n\nThe total price agreed for the sale is the amount of ${ctx.precio.total.completo_en}${desgloseEn}.${sustentoEn} The parties acknowledge these to be values individually assigned and accepted by both, documentarily supported.`,
        };
      },
    },

    // ---- IVA: hueco del ejercicio Veneros, aquí resuelto de forma expresa ----
    {
      id: 'cl_iva',
      condicional: true,
      default: true,
      ordinal: true,
      etiqueta: 'Impuesto al Valor Agregado (traslado expreso)',
      etiqueta_en: 'Value Added Tax (express pass-through)',
      titulo: { es: 'IMPUESTO AL VALOR AGREGADO', en: 'VALUE ADDED TAX' },
      render: (ctx) => {
        const incluido = ctx.iva?.incluido !== false; // true: el precio ya lo incluye
        const tasa = ctx.iva?.tasa || '16%';

        return {
          es: incluido
            ? `La enajenación de bienes muebles a que se refiere este convenio se encuentra gravada por el Impuesto al Valor Agregado a la tasa del ${tasa}. Las partes convienen expresamente que el precio pactado en la cláusula que antecede **incluye** dicho impuesto, por lo que ${ctx.enajenante.referencia} expedirá el comprobante fiscal digital correspondiente con el impuesto desglosado, a favor de ${ctx.adquirente.referencia}.`
            : `La enajenación de bienes muebles a que se refiere este convenio se encuentra gravada por el Impuesto al Valor Agregado a la tasa del ${tasa}. Las partes convienen expresamente que el precio pactado en la cláusula que antecede **no incluye** dicho impuesto, el cual será trasladado a ${ctx.adquirente.referencia} en adición al precio, contra la expedición del comprobante fiscal digital correspondiente por parte de ${ctx.enajenante.referencia}.`,
          en: incluido
            ? `The sale of personal property contemplated in this agreement is subject to Value Added Tax at the rate of ${tasa}. The parties expressly agree that the price set forth in the preceding clause **includes** such tax, and accordingly ${ctx.enajenante.en.referencia} shall issue the corresponding digital tax receipt with the tax itemized, in favor of ${ctx.adquirente.en.referencia}.`
            : `The sale of personal property contemplated in this agreement is subject to Value Added Tax at the rate of ${tasa}. The parties expressly agree that the price set forth in the preceding clause **does not include** such tax, which shall be passed through to ${ctx.adquirente.en.referencia} in addition to the price, against issuance of the corresponding digital tax receipt by ${ctx.enajenante.en.referencia}.`,
        };
      },
    },

    {
      id: 'cl_pago',
      condicional: true,
      default: true,
      ordinal: true,
      etiqueta: 'Forma y condiciones de pago (escrow)',
      etiqueta_en: 'Payment terms (escrow)',
      titulo: { es: 'FORMA Y CONDICIONES DE PAGO', en: 'PAYMENT TERMS AND CONDITIONS' },
      render: (ctx) => {
        const emp = ctx.escrow.empresa || '[EMPRESA DE ESCROW]';
        const hayDeposito = !!ctx.precio.deposito;
        const depEs = hayDeposito
          ? `\n\nA) Dentro de los ${ctx.plazos.deposito_letras} (${ctx.plazos.deposito}) días hábiles siguientes a la firma del presente convenio, ${ctx.adquirente.referenciaConComillas} transferirá a dicha cuenta la cantidad de ${ctx.precio.deposito.completo}, en garantía del cumplimiento de este instrumento.\n\nB) El saldo, es decir la cantidad de ${ctx.precio.saldo.completo}, se transferirá a la misma cuenta a más tardar ${ctx.plazos.saldo_letras} (${ctx.plazos.saldo}) días hábiles antes de la fecha de formalización de la escritura pública del inmueble.`
          : `\n\nEl precio se transferirá a dicha cuenta a más tardar ${ctx.plazos.saldo_letras} (${ctx.plazos.saldo}) días hábiles antes de la fecha de formalización de la escritura pública del inmueble.`;
        const depEn = hayDeposito
          ? `\n\nA) Within ${ctx.plazos.deposito_letras_en} (${ctx.plazos.deposito}) business days following execution of this agreement, ${ctx.adquirente.en.referenciaConComillas} shall wire to said account the amount of ${ctx.precio.deposito.completo_en}, as security for performance of this instrument.\n\nB) The balance, that is ${ctx.precio.saldo.completo_en}, shall be wired to the same account no later than ${ctx.plazos.saldo_letras_en} (${ctx.plazos.saldo}) business days prior to the closing date of the public deed for the real property.`
          : `\n\nThe price shall be wired to said account no later than ${ctx.plazos.saldo_letras_en} (${ctx.plazos.saldo}) business days prior to the closing date of the public deed for the real property.`;

        return {
          es: `El precio pactado se cubrirá en su totalidad por ${ctx.adquirente.referenciaConComillas} mediante fondos constituidos en la cuenta de Depósito en Garantía (Escrow) operada por ${emp}, conforme a las instrucciones de desembolso que las partes firmen conjuntamente, de la siguiente manera:${depEs}\n\nLas instrucciones de desembolso identificarán de manera separada e inequívoca los conceptos correspondientes a este convenio, a fin de que su pago quede plenamente trazable.\n\nLa liberación e instrucción de pago de dichos fondos a favor de ${ctx.enajenante.referenciaConComillas} se ejecutará en la misma fecha en que se formalice ante Notario Público la escritura pública correspondiente al inmueble.`,
          en: `The agreed price shall be paid in full by ${ctx.adquirente.en.referenciaConComillas} with funds constituted in the Escrow account operated by ${emp}, pursuant to the disbursement instructions jointly signed by the parties, as follows:${depEn}\n\nThe disbursement instructions shall separately and unequivocally identify the concepts corresponding to this agreement, so that its payment remains fully traceable.\n\nThe release and payment instruction of such funds in favor of ${ctx.enajenante.en.referenciaConComillas} shall be executed on the same date on which the corresponding public deed for the real property is formalized before a Notary Public.`,
        };
      },
    },

    // ---- CONDICIÓN SUSPENSIVA CRUZADA — OPT-IN ----
    // Protege el negocio (que no se caiga una pata sin la otra), pero al declarar
    // ambas operaciones como unidad indivisible refuerza el argumento de que se
    // trata de UNA sola enajenación. Se deja apagada por defecto: el usuario decide
    // con el costo fiscal a la vista.
    {
      id: 'cl_condicion_cruzada',
      condicional: true,
      default: false,
      ordinal: true,
      etiqueta: 'Condición suspensiva cruzada y rescisión',
      etiqueta_en: 'Cross suspensive condition and rescission',
      titulo: { es: 'CONDICIÓN SUSPENSIVA CRUZADA Y RESCISIÓN', en: 'CROSS SUSPENSIVE CONDITION AND RESCISSION' },
      render: (ctx) => {
        const objetoEs = ctx.bloques.vehiculo ? 'LOS BIENES MUEBLES y de EL VEHÍCULO' : 'LOS BIENES MUEBLES';
        const objetoEn = ctx.bloques.vehiculo ? 'THE PERSONAL PROPERTY and THE VEHICLE' : 'THE PERSONAL PROPERTY';
        return {
          es: `La exigibilidad de las obligaciones de este convenio y la transmisión definitiva de ${objetoEs} quedan sujetas a la condición suspensiva de que se perfeccione y formalice en escritura pública la transmisión del inmueble.\n\nEn caso de que la Oferta de Compra del inmueble se rescinda, cancele o resulte nula por cualquier causa, el presente convenio quedará rescindido de pleno derecho, de forma automática y sin necesidad de declaración judicial, quedando las partes obligadas a restituirse las prestaciones que se hubieren entregado.`,
          en: `The enforceability of the obligations under this agreement and the definitive transfer of ${objetoEn} are subject to the suspensive condition that the transfer of the real property be perfected and formalized in a public deed.\n\nShould the Purchase Offer for the real property be rescinded, cancelled or held void for any cause, this agreement shall be rescinded by operation of law, automatically and without need of judicial declaration, and the parties shall be bound to restore to each other whatever consideration had been delivered.`,
        };
      },
    },

    {
      id: 'cl_entrega',
      siempre: true,
      ordinal: true,
      etiqueta: 'Entrega y estado de los bienes',
      titulo: { es: 'ENTREGA Y ESTADO DE LOS BIENES', en: 'DELIVERY AND CONDITION OF THE ASSETS' },
      render: (ctx) => {
        const objetoEs = ctx.bloques.vehiculo ? 'LOS BIENES MUEBLES y EL VEHÍCULO' : 'LOS BIENES MUEBLES';
        const objetoEn = ctx.bloques.vehiculo ? 'THE PERSONAL PROPERTY and THE VEHICLE' : 'THE PERSONAL PROPERTY';
        return {
          es: `${ctx.enajenante.referenciaConComillas} se obliga a conservar ${objetoEs} en el estado físico en que se encuentran a la fecha de inspección, y a realizar su entrega material y jurídica de forma conjunta con la entrega de la posesión del inmueble, el día de la firma de la escritura pública. Los bienes se entregan en el estado de uso en que se encuentran ("AS-IS"), libres de todo gravamen, carga o afectación legal.`,
          en: `${ctx.enajenante.en.referenciaConComillas} undertakes to preserve ${objetoEn} in the physical condition in which they are found as of the inspection date, and to make physical and legal delivery thereof together with delivery of possession of the real property, on the date of execution of the public deed. The assets are delivered in their current used condition ("AS-IS"), free of any lien, encumbrance or legal charge.`,
        };
      },
    },

    {
      id: 'cl_vehiculo',
      condicional: true,
      default: false,
      ordinal: true,
      requiere: 'vehiculo',
      etiqueta: 'Traslado de dominio del vehículo',
      etiqueta_en: 'Transfer of title to the vehicle',
      titulo: { es: 'TRASLADO DE DOMINIO DE EL VEHÍCULO', en: 'TRANSFER OF TITLE TO THE VEHICLE' },
      render: (ctx) => ({
        es: `En la fecha de entrega, ${ctx.enajenante.referenciaConComillas} hará entrega a ${ctx.adquirente.referenciaConComillas} de la factura original debidamente endosada a su favor, así como de los comprobantes de pago de tenencias, refrendos y verificaciones vehiculares, del juego completo de llaves y de la documentación que ampare la legítima propiedad de EL VEHÍCULO.\n\n${ctx.enajenante.referenciaConComillas} se obliga a realizar y suscribir todos los trámites de baja de placas o cambio de propietario que resulten necesarios ante la autoridad vehicular competente. Los adeudos, infracciones, contribuciones y gastos de regularización anteriores a la fecha de entrega serán por cuenta exclusiva de ${ctx.enajenante.referencia}. Los derechos y gastos del cambio de propietario y del alta a nombre de ${ctx.adquirente.referencia}, así como las responsabilidades derivadas del uso posterior a la entrega, serán por cuenta de ${ctx.adquirente.referencia}.`,
        en: `On the delivery date, ${ctx.enajenante.en.referenciaConComillas} shall deliver to ${ctx.adquirente.en.referenciaConComillas} the original invoice duly endorsed in its favor, together with proof of payment of vehicle taxes, registration renewals and vehicle inspections, the complete set of keys, and the documentation evidencing lawful ownership of THE VEHICLE.\n\n${ctx.enajenante.en.referenciaConComillas} undertakes to carry out and execute all plate cancellation or change-of-owner procedures required before the competent vehicle authority. Debts, traffic violations, taxes and regularization expenses arising prior to the delivery date shall be borne solely by ${ctx.enajenante.en.referencia}. The fees and expenses of the change of ownership and registration in the name of ${ctx.adquirente.en.referencia}, as well as liabilities arising from use after delivery, shall be borne by ${ctx.adquirente.en.referencia}.`,
      }),
    },

    {
      id: 'cl_penalidad',
      condicional: true,
      default: true,
      ordinal: true,
      etiqueta: 'Pena convencional por incumplimiento',
      etiqueta_en: 'Liquidated damages for breach',
      titulo: { es: 'PENA CONVENCIONAL POR INCUMPLIMIENTO', en: 'LIQUIDATED DAMAGES FOR BREACH' },
      render: (ctx) => ({
        es: `En caso de que ${ctx.adquirente.referenciaConComillas} incumpla la obligación de pago en los términos aquí establecidos, o de que por su causa o desistimiento se impida la liberación de los fondos del Escrow en la fecha de formalización del inmueble, se configurará incumplimiento definitivo del presente instrumento. En consecuencia, la parte incumplida pagará a la parte afectada, de manera inmediata y como pena convencional, la cantidad de ${ctx.penalidad.completo}. La misma pena será exigible a ${ctx.enajenante.referenciaConComillas} si el incumplimiento le fuere imputable.`,
        en: `Should ${ctx.adquirente.en.referenciaConComillas} breach the payment obligation under the terms established herein, or should the release of the Escrow funds on the closing date of the real property be prevented by its act or withdrawal, a definitive breach of this instrument shall be deemed to have occurred. Consequently, the breaching party shall pay to the affected party, immediately and as liquidated damages, the amount of ${ctx.penalidad.completo_en}. The same penalty shall be enforceable against ${ctx.enajenante.en.referenciaConComillas} if the breach is attributable to it.`,
      }),
    },

    {
      id: 'cl_impuestos',
      siempre: true,
      ordinal: true,
      etiqueta: 'Impuestos',
      titulo: { es: 'IMPUESTOS', en: 'TAXES' },
      render: (ctx) => ({
        es: `Sin perjuicio de lo pactado en materia de Impuesto al Valor Agregado, cada parte será responsable del pago de los impuestos y contribuciones que conforme a la legislación aplicable le correspondan con motivo de la enajenación materia de este convenio, y de la expedición de los comprobantes fiscales a que haya lugar.`,
        en: `Without prejudice to what has been agreed regarding Value Added Tax, each party shall be responsible for the payment of the taxes and contributions that, under applicable law, correspond to it by reason of the sale contemplated in this agreement, and for the issuance of any applicable tax receipts.`,
      }),
    },

    {
      id: 'cl_jurisdiccion',
      siempre: true,
      ordinal: true,
      etiqueta: 'Jurisdicción',
      titulo: { es: 'JURISDICCIÓN', en: 'JURISDICTION' },
      render: (ctx) => ({
        es: `Para la interpretación, cumplimiento y ejecución del presente convenio, las partes se someten expresamente a la jurisdicción de los tribunales competentes de ${ctx.jurisdiccion.ciudad}, renunciando a cualquier otro fuero que pudiera corresponderles en razón de sus domicilios presentes o futuros.`,
        en: `For the interpretation, performance and enforcement of this agreement, the parties expressly submit to the jurisdiction of the competent courts of ${ctx.jurisdiccion.ciudad}, waiving any other venue that might correspond to them by reason of their present or future domiciles.`,
      }),
    },

    // ============================================================
    // CIERRE Y ANEXOS
    // ============================================================
    {
      id: 'anexos',
      siempre: true,
      titulo: { es: 'ANEXOS', en: 'EXHIBITS' },
      render: (ctx) => {
        // El Anexo A se elabora manualmente: aquí sólo se identifica.
        const vehEs = ctx.bloques.vehiculo ? `\n\nANEXO "B" — Identificación y documentación de EL VEHÍCULO, referido al mismo inmueble y suscrito por las partes.` : '';
        const vehEn = ctx.bloques.vehiculo ? `\n\nEXHIBIT "B" — Identification and documentation of THE VEHICLE, referring to the same property and executed by the parties.` : '';
        return {
          es: `Forman parte integral del presente convenio los siguientes anexos, que se agregan firmados por las partes:\n\nANEXO "A" — Inventario Detallado con Valores Asignados de los bienes muebles ubicados en ${ctx.inmueble.identificacion}, con la descripción y el valor asignado a cada partida.${vehEs}`,
          en: `The following exhibits, attached duly executed by the parties, form an integral part of this agreement:\n\nEXHIBIT "A" — Itemized Inventory with Assigned Values of the personal property located at ${ctx.inmueble.identificacion_en || ctx.inmueble.identificacion}, with the description and assigned value of each item.${vehEn}`,
        };
      },
    },

    {
      id: 'cl_cierre',
      siempre: true,
      render: (ctx) => ({
        es: `Leído que fue el presente convenio y enteradas las partes de su contenido, valor y alcance legal, lo firman por duplicado en ${ctx.lugar.ciudad}, en la fecha señalada al inicio.`,
        en: `This agreement having been read and the parties being aware of its content, value and legal scope, they sign it in duplicate in ${ctx.lugar.ciudad}, on the date first written above.`,
      }),
    },

    {
      id: 'cl_nota_idioma',
      condicional: true,
      default: true,
      etiqueta: 'Nota de prevalencia del idioma',
      render: (ctx) => ({
        es: PLANTILLA_CONVENIO_MUEBLES.meta.nota_idioma.es,
        en: PLANTILLA_CONVENIO_MUEBLES.meta.nota_idioma.en,
      }),
    },

    {
      id: 'firmas',
      siempre: true,
      tipo: 'firmas',
      render: (ctx) => ({
        firmas: [
          {
            nombre: ctx.enajenante.nombres,
            rol_es: `${ctx.enajenante.referencia} / ${ctx.enajenante.en.referencia}`,
          },
          {
            nombre: ctx.adquirente.nombres,
            rol_es: `${ctx.adquirente.referencia} / ${ctx.adquirente.en.referencia}`,
          },
        ],
        aceptacion: false,
      }),
    },

  ],
};

export default PLANTILLA_CONVENIO_MUEBLES;
