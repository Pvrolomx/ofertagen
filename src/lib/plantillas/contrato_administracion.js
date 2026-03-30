/**
 * OfertaGen — Plantilla: Contrato de Administración y Mantenimiento
 * Castle Solutions / CASTLEBAY PV, SRL DE CV
 * 
 * Basado en contratos reales de Claudia Castillo:
 *   - Contract_Castle_Solutions_New.docx (Bay, 2018)
 *   - CONTRATO_PVCASTLEMX_PLURAL_2024.docx (Sears, 2024)
 * 
 * Versión 2024 como base — más madura, 13 cláusulas.
 * Todos los bloques son escalables/descalables sin romper nada.
 */

const PLANTILLA_ADMINISTRACION = {

  // ============================================================
  // META
  // ============================================================

  meta: {
    id: 'contrato_administracion',
    version: '1.0.0',
    nombre: 'Contrato de Administración y Mantenimiento',
    nombre_en: 'Property Management and Maintenance Contract',
    idiomas: ['es', 'en'],
    formato: 'bilingue_tabla',
    nota_idioma: {
      es: 'La traducción al idioma inglés es mera cortesía. En el evento de una controversia, la versión en español prevalecerá.',
      en: 'The translation to English is mere courtesy. In the event of a controversy, the Spanish version will prevail.',
    },
  },

  // ============================================================
  // PARTES
  // ============================================================

  partes: [
    {
      id: 'propietario',
      rol: 'propietario',
      etiqueta: 'Propietario / Owner',
      etiqueta_en: 'Owner',
      min: 1,
      max: 4,
      tiposPermitidos: ['fisica'],
      campos: [
        { id: 'nombre', tipo: 'texto', requerido: true, etiqueta: 'Nombre completo', etiqueta_en: 'Full name' },
        { id: 'genero', tipo: 'select', requerido: true, etiqueta: 'Género', opciones: [{ valor: 'M', texto: 'Masculino' }, { valor: 'F', texto: 'Femenino' }] },
        { id: 'email', tipo: 'email', requerido: true, etiqueta: 'Correo electrónico', etiqueta_en: 'Email' },
        { id: 'celular', tipo: 'tel', requerido: true, etiqueta: 'Celular / WhatsApp', etiqueta_en: 'Cell / WhatsApp' },
      ],
    },
    {
      id: 'administrador',
      rol: 'administrador',
      etiqueta: 'Administrador / Manager',
      etiqueta_en: 'Administrator',
      min: 1,
      max: 1,
      tiposPermitidos: ['moral'],
      fijo: true, // No editable — siempre es PVCASTLEMX
      campos: [],
      defaults: {
        razonSocial: 'CASTLEBAY PV, SRL DE CV',
        representante: { nombre: 'Claudia Rebeca Castillo Soto', genero: 'F' },
        domicilio: 'Paseo del Arque 59, Las Ceibas, Bahía de Banderas, Nayarit, 63735',
        email: 'claudia@castlesolutions.biz',
        celular: '+52 322 306 8482',
      },
    },
  ],

  // ============================================================
  // CAMPOS GENERALES
  // ============================================================

  campos: {
    propiedad: {
      etiqueta: 'Datos de la propiedad',
      etiqueta_en: 'Property data',
      campos: [
        { id: 'direccion', tipo: 'textarea', requerido: true, etiqueta: 'Dirección completa de la propiedad', etiqueta_en: 'Full property address', placeholder: 'Condominio La Jolla de Mismaloya, CARR.A BARRA DE NAVIDAD SN KM-11 5705...' },
        { id: 'tipo_propiedad', tipo: 'select', requerido: true, etiqueta: 'Tipo de propiedad', opciones: [
          { valor: 'condominio', texto: 'Condominio / Departamento' },
          { valor: 'casa', texto: 'Casa' },
          { valor: 'villa', texto: 'Villa' },
          { valor: 'penthouse', texto: 'Penthouse' },
          { valor: 'terreno', texto: 'Terreno' },
        ], default: 'condominio' },
        { id: 'es_condominio', tipo: 'boolean', requerido: false, etiqueta: 'Parte de un conjunto condominal', etiqueta_en: 'Part of a condominium complex', default: true },
      ],
    },

    honorarios: {
      etiqueta: 'Honorarios y cuotas',
      etiqueta_en: 'Fees',
      campos: [
        { id: 'cuota_mensual', tipo: 'numero', requerido: true, etiqueta: 'Cuota mensual administración (USD)', etiqueta_en: 'Monthly admin fee (USD)', default: 125 },
        { id: 'cuota_no_negociable', tipo: 'boolean', requerido: false, etiqueta: 'Cuota no negociable', default: true },
        { id: 'incluye_iva', tipo: 'boolean', requerido: false, etiqueta: 'Más IVA (16%)', default: true },
        { id: 'umbral_reparacion', tipo: 'numero', requerido: true, etiqueta: 'Umbral reparación sin autorización (USD)', etiqueta_en: 'Repair threshold w/o authorization (USD)', default: 100 },
        { id: 'tarifa_servicios_especiales', tipo: 'numero', requerido: true, etiqueta: 'Tarifa servicios especiales (USD/hr)', etiqueta_en: 'Special services rate (USD/hr)', default: 20 },
        { id: 'porcentaje_supervision', tipo: 'texto', requerido: true, etiqueta: 'Porcentaje supervisión de obras', default: '10%' },
        { id: 'costo_asamblea', tipo: 'numero', requerido: false, etiqueta: 'Costo representación asamblea (USD por 2 hrs)', default: 100 },
        { id: 'costo_hora_adicional_asamblea', tipo: 'numero', requerido: false, etiqueta: 'Costo hora adicional asamblea (USD)', default: 30 },
      ],
    },

    vigencia: {
      etiqueta: 'Vigencia y firma',
      etiqueta_en: 'Duration and signing',
      campos: [
        { id: 'fecha_inicio', tipo: 'fecha', requerido: true, etiqueta: 'Fecha de inicio del contrato', etiqueta_en: 'Contract start date' },
        { id: 'duracion', tipo: 'select', requerido: true, etiqueta: 'Duración', opciones: [
          { valor: 'indefinida', texto: 'Indefinida' },
          { valor: '12', texto: '12 meses' },
          { valor: '24', texto: '24 meses' },
        ], default: 'indefinida' },
        { id: 'dias_aviso_cancelacion', tipo: 'numero', requerido: true, etiqueta: 'Días naturales de aviso para cancelación', default: 30 },
        { id: 'ciudad_firma', tipo: 'texto', requerido: true, etiqueta: 'Ciudad de firma', default: 'Puerto Vallarta, Jalisco' },
        { id: 'num_llaves', tipo: 'numero', requerido: true, etiqueta: 'Juegos de llaves a entregar', default: 3 },
        { id: 'incluir_codigo_acceso', tipo: 'boolean', requerido: false, etiqueta: 'O código de acceso (en lugar de llaves)', default: true },
      ],
    },

    reportes: {
      etiqueta: 'Reportes',
      etiqueta_en: 'Reports',
      campos: [
        { id: 'dias_reporte', tipo: 'numero', requerido: true, etiqueta: 'Promedio de días para reporte de gastos', default: 30 },
        { id: 'dias_inconformidad', tipo: 'numero', requerido: true, etiqueta: 'Días para inconformarse contra cargos', default: 30 },
      ],
    },

    testigos: {
      etiqueta: 'Testigos',
      etiqueta_en: 'Witnesses',
      campos: [
        { id: 'incluir_testigos', tipo: 'boolean', requerido: false, etiqueta: 'Incluir líneas de testigos', default: true },
      ],
    },
  },

  // ============================================================
  // BLOQUES DEL CONTRATO
  // Cada bloque es una cláusula o sub-sección.
  // condicional: true → se puede activar/desactivar (escalable)
  // siempre: true → no se puede quitar (core)
  // ============================================================

  bloques: [

    // ─────────────────────────────────────────────────────────────
    // ENCABEZADO (siempre)
    // ─────────────────────────────────────────────────────────────
    {
      id: 'encabezado',
      tipo: 'encabezado',
      siempre: true,
      render: (ctx) => ({
        es: `Contrato de Administración y Mantenimiento de Propiedades que celebran por un lado ${ctx.propietario.nombres_negrita} a ${ctx.propietario.quien} para los efectos de este contrato se ${ctx.propietario.denominara} EL PROPIETARIO y por otra parte Claudia Rebeca Castillo Soto en su carácter de representante legal de CASTLEBAY PV, SRL DE CV en lo sucesivo denominado EL ADMINISTRADOR, sujeto a las siguientes declaraciones y cláusulas.`,
        en: `Property Management and Maintenance contract entered between ${ctx.propietario.nombres_negrita} ${ctx.propietario.quien_en} for the purposes of this contract shall be identified as THE OWNER and Claudia Rebeca Castillo Soto in her character of legal representative of CASTLEBAY PV, SRL DE CV, hereinafter identified as THE ADMINISTRATOR, subject to the following declarations and clauses.`,
      }),
    },

    // ─────────────────────────────────────────────────────────────
    // DECLARACIONES
    // ─────────────────────────────────────────────────────────────

    // DECLARACION I — EL PROPIETARIO
    {
      id: 'declaracion_propietario',
      siempre: true,
      titulo: { es: 'DECLARACIONES', en: 'DECLARATIONS' },
      render: (ctx) => ({
        es: `I.- Declara EL PROPIETARIO que:\n\nA) Es titular de los derechos y posesión legal de la finca denominada ${ctx.propiedad.direccion}, en adelante la PROPIEDAD, ${ctx.propietario.quien} ${ctx.propietario.manifiesta} su voluntad para contratar Los Servicios de administración y mantenimiento proveídos por EL ADMINISTRADOR conforme a lo estipulado en este contrato.\n\nB) Comprende${ctx.propietario.clave === 'mp' || ctx.propietario.clave === 'fp' ? 'n' : ''} el contenido y alcance legal de todas y cada una de las obligaciones y derechos contenidos en este documento, manifestando expresamente su voluntad para celebrarlo con EL ADMINISTRADOR de conformidad con las leyes mexicanas.`,
        en: `I.- THE OWNER declares that:\n\nA) ${ctx.propietario.clave === 'mp' || ctx.propietario.clave === 'fp' ? 'They are' : 'Is'} the holder${ctx.propietario.clave === 'mp' || ctx.propietario.clave === 'fp' ? 's' : ''} of the legal possession and rights of the property known as ${ctx.propiedad.direccion}, hereinafter the PROPERTY, who expresses their willingness to contract The Property Management and Maintenance Services provided by THE ADMINISTRATOR as in this contract.\n\nB) Understand${ctx.propietario.clave === 'mp' || ctx.propietario.clave === 'fp' ? '' : 's'} the content and legal scope of each and every one of the obligations and rights contained in this document, stating explicitly ${ctx.propietario.clave === 'fp' || ctx.propietario.clave === 'fs' ? 'her' : ctx.propietario.clave === 'mp' || ctx.propietario.clave === 'ms' ? 'his' : 'their'} willingness to sign it with THE ADMINISTRATOR in accordance with the Mexican laws.`,
      }),
    },

    // DECLARACION II — EL ADMINISTRADOR
    {
      id: 'declaracion_administrador',
      siempre: true,
      render: (ctx) => ({
        es: `II.- Declara EL ADMINISTRADOR que:\n\nA) Tener su domicilio en, Paseo del Arque 59, Las Ceibas, Bahía de Banderas, Nayarit, 63735 quien manifiesta su voluntad de proveer Servicios de Administración y Mantenimiento a la propiedad y PROPIETARIO descritos con anterioridad en el presente contrato.\n\nB) Tiene la capacidad legal, económica y administrativa para cumplir con el objeto materia de este contrato.\n\nC) Comprende el contenido y alcance legal de las obligaciones y derechos contenidos y pactados en este contrato, manifestando expresamente su voluntad para celebrarlo con EL PROPIETARIO.`,
        en: `II.- THE ADMINISTRATOR declares that;\n\nA) His office is located on, Paseo del Arque 59, Las Ceibas, Bahía de Banderas, Nayarit, 63735 who expresses his willingness to provide Property Management and Maintenance Services to THE OWNER and property described above in this contract.\n\nB) Has the legal, economic and administrative capacity to comply with the terms of this contract.\n\nC) Understands the content and legal scope of the obligations and rights agreed in this contract, expressly stating his willingness to sign it with THE OWNER.`,
      }),
    },

    // ─────────────────────────────────────────────────────────────
    // CLÁUSULAS
    // ─────────────────────────────────────────────────────────────

    // CLÁUSULA 1 — DERECHO EXCLUSIVO
    {
      id: 'cl_exclusividad',
      numero: 1,
      siempre: true,
      titulo: { es: 'DERECHO EXCLUSIVO', en: 'EXCLUSIVE RIGHT' },
      render: (ctx) => ({
        es: `EL PROPIETARIO confiere al ADMINISTRADOR de forma exclusiva la administración y mantenimiento de la PROPIEDAD descrita en la fracción I inciso A) de DECLARACIONES de este contrato; acepta el paquete de servicios que se describe en la cláusula número 2 (dos) y el adjunto de éste contrato y se obliga a proporcionar la documentación para conformar los Anexos 1 y 2, descritos más adelante, a la firma del presente contrato.`,
        en: `THE OWNER confers to the ADMINISTRATOR the exclusive right to the property management and maintenance of the PROPERTY described in section I point A) of DECLARATIONS in this contract, accepts the package of services described in clause 2 (two) below and Attachment 1 of this contract and agrees to provide the documentation to conform Annexes 1 and 2, listed below, at the signing of this contract.`,
      }),
    },

    // CLÁUSULA 2 — REPORTES
    {
      id: 'cl_reportes',
      numero: 2,
      siempre: true,
      titulo: { es: 'REPORTES', en: 'REPORT' },
      render: (ctx) => ({
        es: `EL ADMINISTRADOR se obliga a informar al PROPIETARIO en un promedio de ${ctx.reportes.dias_reporte} (${ctx.reportes.dias_reporte_letras}) días y electrónicamente de los gastos realizados por EL ADMINISTRADOR a cuenta de la administración y mantenimiento de LA PROPIEDAD materia de este contrato. EL ADMINISTRADOR proporcionará al PROPIETARIO un vínculo de identificación personal y confidencial para el acceso electrónico a su página personal donde podrá supervisar y verificar la información relacionada con los gastos cargados a su cuenta por suministros, servicios externos de mantenimiento general y preventivo, servicio de limpieza y otros servicios contratados como son electricidad, teléfono, agua, servicio de televisión por cable, servicio de televisión satelital, internet, así como la información particular de la propiedad relativa a la rutina del servicio de limpieza y mantenimiento general y preventivo, servicios extras, pagos por los consumos de los servicios utilizados, pago del impuesto predial, multas, recargos, etc. EL PROPIETARIO tendrá ${ctx.reportes.dias_inconformidad} (${ctx.reportes.dias_inconformidad_letras}) días para inconformarse contra cualquier cargo hecho en su cuenta. Después de ese tiempo y sin existir inconformidad alguna por escrito por parte del PROPIETARIO se entenderán aceptados y consentidos dichos cargos.`,
        en: `THE ADMINISTRATOR is obligated to inform THE OWNER in an average period of ${ctx.reportes.dias_reporte} (${ctx.reportes.dias_reporte_letras_en}) days and electronically about the expenses incurred by THE ADMINISTRATION in the property management and maintenance of THE PROPERTY object of this contract. THE ADMINISTRATOR will provide THE OWNER a confidential and personal identification link to access in his personal homepage from where he can monitor and verify information related to the expenses charged to his account for supplies, general or preventive maintenance external services, cleaning services and other contracted services such as electricity, telephone, water, cable service, satellite television service, internet service and as well particular information of the property related to the routine of cleaning services, general or preventive maintenance external services, extra services, payment of consumption for used services, property tax payment, fines, charges, etc. THE OWNER will have ${ctx.reportes.dias_inconformidad} (${ctx.reportes.dias_inconformidad_letras_en}) days to disagree against any expenses charged on his account. After ${ctx.reportes.dias_inconformidad_letras_en} days and without any written notice the charges will be considered accepted by THE OWNER.`,
      }),
    },

    // REPORTES — Bloque condicional: Autorización a recibir info de ocupantes
    {
      id: 'cl_reportes_ocupantes',
      condicional: true,
      default: true,
      despues_de: 'cl_reportes',
      etiqueta: 'Autorización para recibir info de ocupantes vía email',
      etiqueta_en: 'Authorization to receive occupant info via email',
      render: (ctx) => ({
        es: `El PROPIETARIO autoriza a EL ADMINISTRADOR para recibir información, consejo y recomendación de los ocupantes de la PROPIEDAD, respecto de situaciones relacionadas con la PROPIEDAD materia de este contrato.`,
        en: `THE OWNER authorizes THE ADMINISTRATOR to receive information, advice and recommendations from the occupants of the property, regarding PROPERTY-related situations made via email.`,
      }),
    },

    // CLÁUSULA 3 — SERVICIOS (contenedor)
    {
      id: 'cl_servicios',
      numero: 3,
      siempre: true,
      titulo: { es: 'SERVICIOS', en: 'SERVICES' },
      render: (ctx) => ({
        es: `El ADMINISTRADOR manejará la propiedad con el más alto nivel de profesionalismo, poniendo a disposición del PROPIETARIO los servicios de Administración y Mantenimiento que a continuación se describen:`,
        en: `THE ADMINISTRATOR will manage the property with the highest level of professionalism, offering THE OWNER the following Property Management and Maintenance services below described:`,
      }),
    },

    // 3a — MANTENIMIENTO
    {
      id: 'cl_mantenimiento',
      siempre: true,
      subtitulo: { es: 'a).- SERVICIO DE MANTENIMIENTO', en: 'a).- MAINTENANCE SERVICES' },
      render: (ctx) => ({
        es: `Implementar un programa de supervisión que incluirá una visita semanal a cada PROPIEDAD con bitácora de reportes específicos para inspeccionar y asegurarse de que todas las instalaciones tales como calentadores, aire acondicionado, aparatos electrodomésticos, instalaciones hidráulicas, eléctricas y sanitarias, cerraduras en puertas y ventanas, vidrios, muebles, accesorios, equipos de gas estén en perfectas condiciones de uso y funcionamiento así como verificar que los muros y techos no tengan humedad y/o goteras, que la jardinería y la fumigación periódica de la unidad esté hecha y la unidad esté en perfectas condiciones de uso y funcionamiento.\n\nSe incluyen en esta cláusula los reportes de mantenimiento preventivo y/o reclamo de las garantías de los equipos y/o servicios adquiridos de los trabajos ejecutados por terceros en caso de ser necesario.\n\nCabe señalar que las reparaciones, el mantenimiento y trabajos que en general a juicio del PROPIETARIO deban realizarse en la PROPIEDAD y sobre los bienes muebles incluidos en ella, no serán ejecutados por EL ADMINISTRADOR, si no que éste, en nombre y representación del PROPIETARIO contratará a terceros para que dichos terceros realicen las obras. EL ADMINISTRADOR exclusivamente se dedicará a supervisar y verificar que dichos trabajos sean ejecutados conforme las instrucciones del propietario. Cualquier reparación, mantenimiento o trabajo externo realizados tendrá 30 (treinta) días de garantía a partir de su conclusión. A tal efecto EL PROPIETARIO al momento de la firma del presente contrato entregará un inventario de los bienes existentes en la propiedad y una bitácora de mantenimiento en su caso.\n\nEL PROPIETARIO antes de iniciarse los trabajos, extenderá por correo electrónico una autorización al ADMINISTRADOR para que éste actúe en su nombre y representación, se conduzca ante los contratistas con las instrucciones sobre lo que se debe hacer, cómo se debe hacer, lista de conceptos contratados, calendarios de pagos y montos de los mismos incluidas las copias de los contratos y los proyectos constructivos o de remodelación o los documentos necesarios para la recepción del equipo o bienes si tuviese a la mano tal información.`,
        en: `Implementing a supervision program which will include a weekly visit to the PROPERTY to log specific reports, to inspect and ensure that all facilities such as heaters, air conditioning, appliances, hydraulic facilities, electrical facilities, plumbing facilities, locks doors and windows, glass, furniture, fixtures, gas appliances are in satisfactory working order and to verify that the walls and ceilings do not have any moisture and/or leaks, the gardening work and periodic fumigation on the unit are done, so the unit can be in perfect condition and performance.\n\nIncluded in this clause are the preventive maintenance reports and/or claims of warranties of acquired equipment and/or purchased services and/or third party performed work if that is the case.\n\nIt should be noted that the repairs, maintenance and general work wanted by THE OWNER in the PROPERTY and on its assets, will not be executed by THE ADMINISTRATOR; THE ADMINISTRATOR on behalf of THE OWNER shall hire third parties to carry out the works. THE ADMINISTRATOR exclusively will supervise and verify that such works are executed according the owner's instructions. Any repair, maintenance or external work performed will have 30 days warranty once completed. For this purpose THE OWNER at the time of signing this contract will deliver an inventory of existing assets in the property and a maintenance log in its case.\n\nTHE OWNER before the beginning of the work, will authorize THE ADMINISTRATOR via email to lead on his behalf with the contractors, with instructions on what to do, how to do it, the list of contracted work, payment schedules and amounts of them, including copies of contracts and the construction or remodeling projects or documents required for reception of equipment or assets, if there is information about it.`,
      }),
    },

    // Mantenimiento — reparaciones y emergencias
    {
      id: 'cl_reparaciones',
      siempre: true,
      render: (ctx) => ({
        es: `EL ADMINISTRADOR, informará al PROPIETARIO de los problemas que se detecten en la finca así como de ser el caso, el costo de reparación de los mismos. Si el costo de la reparación es menor a los $${ctx.honorarios.umbral_reparacion}.00 (${ctx.honorarios.umbral_reparacion_letras} USD) o su equivalente en moneda nacional, EL PROPIETARIO desde éste momento autoriza al ADMINISTRADOR a descontar el costo de dichas reparaciones de la cuenta de gastos del PROPIETARIO para efectuar tales reparaciones, debiendo EL ADMINISTRADOR agregar a la cuenta de gastos del PROPIETARIO las facturas y/o recibos correspondientes. EL ADMINISTRADOR no pagará ningún gasto a cargo del PROPIETARIO si no existen fondos suficientes en la cuenta de gastos del PROPIETARIO que cubran dichos montos.\n\nReparaciones con un costo mayor a $${ctx.honorarios.umbral_reparacion} (${ctx.honorarios.umbral_reparacion_letras} USD) o su equivalente en moneda nacional, requerirán autorización por correo electrónico del PROPIETARIO antes del inicio de las reparaciones. De no autorizarse su pago, EL PROPIETARIO será responsable de las consecuencias que por tal circunstancia llegaran a generarse en su PROPIEDAD, o en las propiedades y/o bienes de terceros.`,
        en: `THE ADMINISTRATOR, will notify THE OWNER about any problem identified in the PROPERTY, and if applicable, the cost to repair it. If the cost of the repair is less than $${ctx.honorarios.umbral_reparacion}.00 (${ctx.honorarios.umbral_reparacion_letras_en} USD) or its equivalent in peso currency, THE OWNER from this moment authorizes THE ADMINISTRATOR to deduct the cost of such repair expenses from the homeowner's expenses account and make such repairs; THE ADMINISTRATOR must add to the homeowner's expenses account the bills and/or receipts of the expenses related to those repairs. THE ADMINISTRATOR will not pay any expense if there are not enough funds in the homeowner's expenses account to cover those expenses.\n\nRepairs with a cost above $${ctx.honorarios.umbral_reparacion} (${ctx.honorarios.umbral_reparacion_letras_en} USD) or its equivalent in peso currency will require electronic written authorization from THE OWNER before the beginning of the repairs. If a payment is not authorized, THE OWNER will be liable for the consequences generated for this circumstance on his PROPERTY, or third parties' properties and assets.`,
      }),
    },

    // Emergencias
    {
      id: 'cl_emergencias',
      siempre: true,
      render: (ctx) => ({
        es: `En el caso de una situación de emergencia que ponga en riesgo LA PROPIEDAD y/o los bienes existentes en ésta, o en las de terceros y sus bienes, de ser responsabilidad del PROPIETARIO, EL ADMINISTRADOR tomará las providencias necesarias e informará al PROPIETARIO en un término máximo de 24 (veinticuatro) horas para que autorice los gastos para cubrir la emergencia. De no ser suficientes los fondos existentes en la cuenta de gastos del PROPIETARIO, éste deposita inmediatamente la cantidad necesaria para cubrir dichos gastos. En caso de que EL PROPIETARIO no autorice el/los gasto(s), EL ADMINISTRADOR quedará liberado de toda responsabilidad que por tales hechos se produzcan.`,
        en: `In the case of an emergency that threatens THE PROPERTY and/or its existing assets, or third parties' properties and their assets, to be the responsibility of THE OWNER, THE ADMINISTRATOR will do the necessary arrangements and will report to THE OWNER the situation within 24 (twenty four) hours so THE OWNER could authorize the expenses to resolve the emergency. If there are not enough funds in the homeowner's expenses account, THE OWNER will immediately deposit the necessary amount to cover the expenses. If THE OWNER does not authorize the expenses, THE ADMINISTRATOR is discharged from all liability that may occur for these circumstances.`,
      }),
    },

    // Condominio — responsabilidad áreas comunes
    {
      id: 'cl_condominio_areas',
      condicional: true,
      default: true,
      etiqueta: 'Responsabilidad en condominios (áreas comunes)',
      etiqueta_en: 'Condominium common areas responsibility',
      render: (ctx) => ({
        es: `Cuando la PROPIEDAD sea parte de un complejo de condominios EL ADMINISTRADOR será responsable por cualquier asunto relacionado con la administración y mantenimiento al interior de la PROPIEDAD materia de este contrato en la forma y medida en la que EL ADMINISTRADOR se obliga en este contrato. Cualquier cuestión relacionada con las áreas comunes del condominio es responsabilidad del Administrador del conjunto condominal.\n\nEl servicio de jardinería, solo en plantas interiores, está incluido dentro de la cuota mensual por administración y mantenimiento,`,
        en: `When THE PROPERTY is part of a condominium complex, THE ADMINISTRATOR will be responsible for the matters relating to the administration and maintenance of the interior of THE PROPERTY, subject matter of this contract. Any situation regarding the condominium common areas is the responsibility of the Condominium Complex Administrator.\n\nThe landscaping service only in indoor plants, is included in the monthly fee for administration and maintenance,`,
      }),
    },

    // 3b — LIMPIEZA
    {
      id: 'cl_limpieza',
      condicional: true,
      default: true,
      etiqueta: 'Servicios de limpieza',
      etiqueta_en: 'Cleaning services',
      subtitulo: { es: 'b).- SERVICIOS DE LIMPIEZA', en: 'b).- CLEANING SERVICES' },
      render: (ctx) => ({
        es: `El servicio de limpieza consistirá en barrer, trapear, sacudir, acomodar, cambiar y lavar toallas y blancos, limpiar baños, de acuerdo a los estándares que para tales tareas se establezcan al ADMINISTRADOR. El costo de éste servicio no está incluido dentro de la cuota mensual por administración y mantenimiento, por tal motivo éste servicio se cargará a la cuenta del propietario en forma adicional.\n\nLos servicios de limpieza solicitados serán considerados servicios extraordinarios y serán cargados al PROPIETARIO o a quien ocupe la finca y solicite el servicio.\n\nEn el supuesto de que previamente a la firma del presente contrato, EL PROPIETARIO y/o el Conjunto Condominal al que pertenece la propiedad hayan contratado directamente al personal de aseo y mozos para dar servicio de limpieza a la propiedad, el pago de sueldos y prestaciones sociales, así como las responsabilidades laborales derivadas de tal situación serán responsabilidad exclusiva de quienes los hayan contratado, limitándose EL ADMINISTRADOR a verificar que tales tareas se cumplan conforme a las instrucciones recibidas por EL PROPIETARIO. Cuando el ADMINISTRADOR tenga contrato con o contrate a el personal de limpieza y los demás prestadores de servicios para ejecución de los servicios prestados en virtud del presente contrato, cualquier salario, beneficios de acuerdo a las leyes laborales de el estado de Jalisco y ruptura o costos relacionados con terminar esas relaciones laborales serán pagados por el ADMINISTRADOR.\n\nLos servicios extraordinarios de limpieza deberán ser solicitados por correo electrónico al ADMINISTRADOR con 24 (veinticuatro) horas de anticipación y estarán sujetos a la disponibilidad del personal. EL PROPIETARIO pagará los servicios de limpieza ordinarios y extraordinarios que solicite así como los productos de limpieza y utilería necesarios para el aseo de la propiedad. EL ADMINISTRADOR cargará a la cuenta de gastos del PROPIETARIO los cargos que se hayan solicitado conforme a la tarifa aplicable a cada caso.`,
        en: `The cleaning service will consist of sweeping, mopping, dusting, arranging, washing and changing sheets and towels, clean bathrooms, according to the standards established for those tasks to THE ADMINISTRATOR. The cost of this service is not included in the monthly fee for administration and maintenance, for that reason this service will be charged to the homeowner's expenses account separately.\n\nCleaning services requested will be considered as an extraordinary service and will be charged to THE OWNER, or whoever is occupying the PROPERTY and is requesting the service.\n\nIn the case that prior to the signing of this contract, THE OWNER and/or the Condominium Complex to which the property belongs to, has contracted directly the cleaning staff for the property, the payment of salaries and benefits, the work responsibilities arising from this situation are responsibilities of those who have contracted them, limiting THE ADMINISTRATOR liability to verify the completion of the tasks in accordance with the instructions received by THE OWNER. When THE ADMINISTRATOR contracts with or hires the maids and any others to execute the services provided under this contract, any salaries, wages, benefits according with the labor law in the state of Jalisco and severance or related costs of terminating those relationships will be paid by THE ADMINISTRATOR.\n\nExtraordinary cleaning services must be asked via email to THE ADMINISTRATOR with a 24 (twenty four) hour notice and will depend on the availability of the staff. THE OWNER will pay the requested ordinary and extraordinary cleaning services as well for the cleaning products and tools necessary for cleaning and maintenance. THE ADMINISTRATOR will charge to the homeowner's expenses account these charges in accordance with the fare applicable to each case.`,
      }),
    },

    // 3c — PAGOS POR SERVICIOS Y COMPRAS
    {
      id: 'cl_pagos_servicios',
      siempre: true,
      subtitulo: { es: 'c).- PAGOS POR SERVICIOS Y COMPRAS', en: 'c).- PAYMENTS FOR SERVICES AND PURCHASES' },
      render: (ctx) => ({
        es: `EL ADMINISTRADOR pagará a tiempo, por cuenta del PROPIETARIO, el consumo de los siguientes servicios; electricidad, gas, agua, teléfono, servicio de cable, servicio de televisión satelital, internet, las cuotas de mantenimiento del condominio, cuotas de gastos extraordinarios del condominio, pagos anuales por derechos del fideicomiso, impuesto predial, pagos a contratistas, proveedores, gastos de mantenimiento de la unidad, seguros, lavanderia de blancos (sábanas y toallas solamente), fumigación, jardinería, limpieza, etc., siempre y cuando los servicios existan en la propiedad administrada y el pago de los mismos sean encomendados al ADMINISTRADOR. En caso de que el PROPIETARIO tenga invitados o huéspedes en su propiedad, serán a cargo del PROPIETARIO las compras de: comida, bebidas, agua embotellada, papel sanitario, pañuelos desechables, servitoallas, jabón para lavar y de baño.\n\nSi los servicios o suministros para la PROPIEDAD fueran proveídos por terceras personas cuando el PROPIETARIO esté ausente, el PROPIETARIO acuerda que EL ADMINISTRADOR podrá utilizar los fondos necesarios de los depósitos hechos por el PROPIETARIO en su cuenta de gastos para hacer el pago de servicios y/o de suministros autorizados por él o bien dejará instrucciones para que el cobro se haga directamente al PROPIETARIO siendo de su exclusiva responsabilidad la liquidación de tales cuentas.\n\nEL PROPIETARIO se obliga a realizar periódicamente los depósitos bancarios para que el ADMINISTRADOR pueda cubrir los gastos originados por la administración y mantenimiento de la propiedad, obligándose éste último a utilizar los fondos para pagar los gastos acordados en éste contrato debiendo estar autorizado para efectuar los pagos correspondientes. EL PROPIETARIO se compromete a mantener el saldo de su cuenta de gastos a un nivel suficiente para cubrir el equivalente a un mes de los gastos fijos en su PROPIEDAD en todo momento. Todos los gastos deberán estar amparados con recibos digitales y podrán ser verificados por EL PROPIETARIO en su cuenta electrónica personal.\n\nLos gastos hechos por el ADMINISTRADOR por cuenta del PROPIETARIO nunca deberán exceder la cantidad que EL PROPIETARIO tiene depositada en su cuenta de gastos. En caso de fondos insuficientes, EL ADMINISTRADOR NO SERÁ RESPONSABLE de los pagos, recargos y multas que resulten por mora causada por falta de fondos para la liquidación de los adeudos existentes. EL ADMINISTRADOR en caso de insuficiencia de fondos en la cuenta de gastos del PROPIETARIO enviará a éste un recordatorio vía correo electrónico una semana antes del vencimiento. Si el estado de cuenta del PROPIETARIO presenta un saldo negativo, el pago de todos los servicios y obligaciones que nazcan de la administración y mantenimiento de la propiedad quedarán suspendidos hasta en tanto EL PROPIETARIO realice un depósito en su cuenta de gastos que alcancen a cubrir los adeudos existentes y además, una vez aplicados los pagos, presenta un saldo positivo en su cuenta.`,
        en: `THE ADMINISTRATOR, on behalf of THE OWNER, will pay on time the consumption of the following services: electricity, gas, water, telephone, cable service, satellite television service, internet, the condominium maintenance fees, special assessments fees, extraordinary condominium fees, bank trust fees, property tax fees, contractors payments, suppliers payments, maintenance cost of the unit, insurance, white laundry (sheets and towels only) pool maintenance, fumigation, gardening, cleaning services, etc., as long as the services described above exist in the property and their payment is assigned to the ADMINISTRATOR. If THE OWNER has guests (occupants who are not paying rent) in the property, it will be in THE OWNER'S expense the purchase of: food, beverages, bottled water, toilet paper, tissue papers, paper towels, and laundry detergent and bar soap.\n\nIf the services or supplies for the property were provided by third parties when THE OWNER is absent, THE OWNER agrees that THE ADMINISTRATOR may use the necessary funds from deposits made by THE OWNER on his homeowner's expenses account and pay the services and/or supplies authorized by him, or THE OWNER will give instructions to pay the payments directly by himself at the OWNER's sole responsibility.\n\nTHE OWNER agrees to make regular bank deposits to the homeowner's expenses account, so THE ADMINISTRATOR can be able to cover the expenses of the administration and maintenance of the property, obligating THE ADMINISTRATOR to use the funds to pay the agreed expenses described in this contract and the corresponding payments from the homeowner's expenses account. THE OWNER agrees to maintain a positive balance in his homeowner's expenses account enough to cover the equivalent of one month of expenses at all times. All expenses must be covered by digital receipts and can be verified by THE OWNER on his own personal electronic account.\n\nThe expenses made by THE ADMINISTRATOR on behalf of THE OWNER, in the performance of this contract shall never exceed the amount that the owner has in his homeowner's expenses account. In case of insufficient funds, THE ADMINISTRATOR WILL NOT BE LIABLE for the payments, penalties and fines resulting due to lack of funds to cover the expenses. THE ADMINISTRATOR, if insufficient funds are in the homeowner's expenses account, will send an Email reminder a week before the expenses become due. If the homeowner's expenses account of the owner has a negative balance, the payments of all services and obligations that arise from the administration and maintenance of the property shall remain suspended until THE OWNER makes a deposit in his homeowner's expenses account to cover the pending debts and once these payments are applied there should be a positive balance in his account.`,
      }),
    },

    // Venta de propiedad — condicional
    {
      id: 'cl_venta_propiedad',
      condicional: true,
      default: true,
      etiqueta: 'Aviso de venta de propiedad',
      etiqueta_en: 'Property sale notice clause',
      render: (ctx) => ({
        es: `En el caso de la venta de la propiedad, EL PROPIETARIO se obliga a notificar por escrito al ADMINISTRADOR con 30 (treinta) días de anticipación al cierre de la venta de tal situación y éste, en caso de que existieran gastos administrativos o de cualquier tipo pendientes de pago a cargo del PROPIETARIO, los comunicará por escrito al PROPIETARIO, quien en caso de realizar la venta de la finca sin cubrirlos será responsable de todos los gastos pagados por EL ADMINISTRADOR por cuenta del propietario.`,
        en: `In the event of the sale of the property, the OWNER will be responsible for notifying the ADMINISTRATOR of that circumstance in writing 30 (thirty) days prior of the closing date of the sale and the OWNER will be responsible for all expenses paid by the ADMINISTRATOR on behalf of the OWNER, until such time as a final statement of account is prepared and given to the OWNER by the ADMINISTRATOR.`,
      }),
    },

    // Facturas deducibles — condicional
    {
      id: 'cl_facturas',
      condicional: true,
      default: false,
      etiqueta: 'Facturas deducibles (RFC)',
      etiqueta_en: 'Deductible receipts (RFC)',
      render: (ctx) => ({
        es: `En caso de requerir facturas para deducir impuestos, EL PROPIETARIO proveerá al ADMINISTRADOR el número de su RFC y su domicilio fiscal, para que su contador pase a recogerlas a la oficina del ADMINISTRADOR.`,
        en: `In the case deductible receipts are needed, THE OWNER will provide the tax registration number (RFC) and its tax residence address, so his accountant could pick them up at the office of THE ADMINISTRATOR.`,
      }),
    },

    // CLÁUSULA 4 — CONTRATACIÓN Y SUPERVISIÓN
    {
      id: 'cl_supervision',
      numero: 4,
      siempre: true,
      titulo: { es: 'CONTRATACION Y SUPERVISION DE SERVICIOS', en: 'SUPERVISION AND CONTRACTING SERVICES' },
      render: (ctx) => ({
        es: `EL ADMINISTRADOR o el designado autorizado por EL ADMINISTRADOR en nombre y representación del PROPIETARIO con autorización por escrito podrá realizar los trámites necesarios de contratación, instalación, modificación y/o cancelación de servicios y/o trabajos y/o cambio de titularidad de contratos de servicios como son electricidad (CFE), teléfono (TELMEX), agua (SEAPAL), servicio de cable (TELECABLE, COSMORED), servicio de televisión satelital (SKY, STARCHOICE), internet, etc, que EL PROPIETARIO decida realizar en la propiedad administrada.\n\nEn caso de que EL PROPIETARIO requiera de compras de electrodomésticos, materiales para reparaciones y/o remodelaciones, etc., distintas a las que normalmente se hacen para la propiedad, se cobrará un cargo extra que dependerá del tiempo invertido, el tamaño y la ubicación de la finca, obligándose el ADMINISTRADOR a buscar los mejores precios y calidad de los productos en el mercado así como a coordinar su transporte y descarga en la finca. Los servicios especiales proveídos por EL ADMINISTRADOR se calculan a razón de $${ctx.honorarios.tarifa_servicios_especiales}.00 USD (${ctx.honorarios.tarifa_especiales_letras} DÓLARES AMERICANOS) o su equivalente en moneda nacional por hora.\n\nEn caso de que se ejecuten trabajos de remodelación, de ampliación o de reparación en la PROPIEDAD y haya necesidad de supervisar trabajadores o contratistas, o sea necesaria la supervisión de entrega y/o recepción de muebles, equipo, etc., así como de aquellos hechos por terceros contratados directamente por EL PROPIETARIO o por EL ADMINISTRADOR en nombre del PROPIETARIO o se requiera recibir algún equipo y/o bienes enviados para la decoración y/o mejor funcionalidad de la finca, el servicio de supervisión y/o recepción de bienes y/o equipo y/o de los trabajos contratados tendrá un costo del ${ctx.honorarios.porcentaje_supervision} (${ctx.honorarios.porcentaje_supervision_letras}) del costo del trabajo supervisado.`,
        en: `THE ADMINISTRATOR or designate authorized by THE ADMINISTRATOR on behalf of THE OWNER with a written authorization may contract, install, modify or cancel services and/or work performance, change the name of the ownership of contract services such as electricity (CFE), telephone (TELMEX), water (SEAPAL), cable service (TELECABLE, COSMORED), satellite television service (SKY, STARCHOICE), internet service, etc., who THE OWNER decides to carry out in the managed property.\n\nIf THE OWNER requires purchases of appliances, materials for repairs and/or remodeling, etc., different from those usually made for THE PROPERTY, this will be charged as an additional fee, depending on the time spent in these tasks, the size and the location of the property, obligating THE ADMINISTRATOR to seek the best price and quality of the products in the market and to arrange transportation and unloading at the property. The special services provided by THE ADMINISTRATOR are calculated at $ ${ctx.honorarios.tarifa_servicios_especiales}.00 USD (${ctx.honorarios.tarifa_especiales_letras_en} AMERICAN DOLLARS) or its equivalent in peso currency per hour.\n\nIn the event that remodeling, extension or repair work is carried out on the PROPERTY and there is a need to supervise workers or contractors, or the supervision of delivery and/or reception of furniture, equipment, etc., as well as those made by third parties contracted directly by THE OWNER or by THE ADMINISTRATOR on behalf of THE OWNER or required to receive some equipment and/or goods sent for the decoration and/or better functionality of the PROPERTY, the service of supervision and/or reception of goods and/or equipment and/or contracted work will have a cost of ${ctx.honorarios.porcentaje_supervision} (${ctx.honorarios.porcentaje_supervision_letras_en}) of the cost of the supervised work.`,
      }),
    },

    // CLÁUSULA 5 — ACCESO A CONDOMINIOS
    {
      id: 'cl_acceso_condominios',
      numero: 5,
      condicional: true,
      default: true,
      etiqueta: 'Acceso a condominios',
      etiqueta_en: 'Access to condominiums',
      titulo: { es: 'ACCESO A CONDOMINIOS', en: 'ACCESS TO CONDOMINIUMS' },
      render: (ctx) => ({
        es: `En caso de que la PROPIEDAD sea parte de un conjunto condominal, EL PROPIETARIO hará todos los arreglos necesarios y dará los avisos requeridos por escrito al Administrador del conjunto condominal y/o la mesa directiva de los condóminos autorizando al ADMINISTRADOR y/o al personal que EL PROPIETARIO designe para que ingresen ininterrumpidamente a la propiedad y proporcionen los servicios contratados, debiendo entregar una copia simple de tal autorización al ADMINISTRADOR quien, a su vez, entregará al administrador del conjunto condominal una lista de las personas autorizadas para entrar a la unidad anexando una copia de sus identificaciones.`,
        en: `If the PROPERTY is part of a condominium complex, THE OWNER will do all the necessary arrangements and will notify the Administrator of the Condominium Complex and/or the Board of the Condominium authorizing THE ADMINISTRATOR and/or the staff designated by THE OWNER to have uninterrupted access to the property and provide the contracted services, submitting a copy of the authorization to THE ADMINISTRATOR, who in return, will deliver to the Condominium Complex Administrator a list of persons authorized to enter to the unit, attaching a copy of their identifications.`,
      }),
    },

    // CLÁUSULA 6 — REPRESENTACIÓN EN ASAMBLEAS
    {
      id: 'cl_asambleas',
      numero: 6,
      condicional: true,
      default: true,
      etiqueta: 'Representación en asambleas de condóminos',
      etiqueta_en: 'Representation at condominium meetings',
      titulo: { es: 'REPRESENTACIÓN EN ASAMBLEAS DE CONDÓMINOS', en: 'REPRESENTATION AT CONDOMINIUM BOARD OF DIRECTORS MEETINGS' },
      render: (ctx) => ({
        es: `En caso de que EL PROPIETARIO requiera que EL ADMINISTRADOR le represente en la Asamblea de Condóminos, le enviará al ADMINISTRADOR la información provista por la Asociación de Condóminos previamente a su celebración así mismo le enviará una carta y/o proxy autorizando al ADMINISTRADOR y/o a quien éste designe, para que lo represente en la asamblea con voz y voto. Este servicio no está incluido dentro de la cuota mensual por administración y mantenimiento, por tal motivo éste servicio se cargará a la cuenta del propietario en forma extra y tendrá un costo de $${ctx.honorarios.costo_asamblea}.00 USD (${ctx.honorarios.costo_asamblea_letras} USD más IVA) por 2 horas o su equivalente en moneda nacional. Horas adicionales tendrán un costo de $${ctx.honorarios.costo_hora_adicional_asamblea} (${ctx.honorarios.costo_hora_adicional_letras} más IVA) cada una.`,
        en: `Where the OWNER requests the ADMINISTRATOR to be his representative at the Homeowner's meeting, the OWNER shall notify the condominium complex administrator that the ADMINISTRATOR or one of his employees will be his representative. The ADMINISTRATOR will require a proxy document from the owner to attend the meeting and have voting power. This service is not included in the monthly fee for administration and maintenance, for that reason this service will be charged to the homeowner's expenses account separately at a cost of $${ctx.honorarios.costo_asamblea}.00 (${ctx.honorarios.costo_asamblea_letras_en} USD plus tax) for 2 hours or its equivalent in peso currency. Additional hours will have a cost of $${ctx.honorarios.costo_hora_adicional_asamblea} (${ctx.honorarios.costo_hora_adicional_letras_en} USD plus tax) each.`,
      }),
    },

    // CLÁUSULA 7 — CUOTA Y DEPÓSITOS
    {
      id: 'cl_cuota',
      numero: 7,
      siempre: true,
      titulo: { es: 'CUOTA POR ADMINISTRACIÓN Y MANTENIMIENTO ASÍ COMO DEPÓSITOS BANCARIOS', en: 'ADMINISTRATION AND MAINTENANCE FEES AND BANK DEPOSITS' },
      render: (ctx) => ({
        es: `EL PROPIETARIO pagará mensualmente al ADMINISTRADOR por la administración y mantenimiento de la propiedad motivo de éste contrato la cantidad de $${ctx.honorarios.cuota_formateada} (${ctx.honorarios.cuota_letras} USD${ctx.honorarios.incluye_iva ? ' más IVA' : ''})${ctx.honorarios.cuota_no_negociable ? ', no negociable' : ''}, cantidad que se cargará a la cuenta de gastos del PROPIETARIO. EL PROPIETARIO autoriza al ADMINISTRADOR a deducir de su cuenta de gastos el pago mensual por concepto de administración y en general de todos aquellos gastos y/o cargos que se generen por la administración y mantenimiento de la PROPIEDAD, entregando al propietario los recibos y facturas digitales mediante los que se comprueben los gastos.\n\nEL PROPIETARIO depositará la cantidad mensual estipulada para cubrir los gastos que se generen por la administración y mantenimiento de su propiedad el día primero de cada mes, contado éste a partir de la fecha de la firma del presente contrato.`,
        en: `THE OWNER will pay monthly to THE ADMINISTRATOR the amount of $${ctx.honorarios.cuota_formateada} (${ctx.honorarios.cuota_letras_en} USD${ctx.honorarios.incluye_iva ? ' plus tax' : ''})${ctx.honorarios.cuota_no_negociable ? ', non-negotiable' : ''} as property management and maintenance fee, and that amount will be charged to the homeowner's expenses account. THE OWNER authorizes THE ADMINISTRATOR to deduct from his home owner's expenses account the monthly property management fee and in general all the expenses generated by the administration and maintenance of the PROPERTY, giving the digital receipts to THE OWNER so they state proof of the expenses.\n\nTHE OWNER will deposit the prescribed monthly amount to cover expenses generated by the administration and maintenance of the property the first day of each month, counted from the date of signing of the Contract.`,
      }),
    },

    // CLÁUSULA 8 — LLAVES
    {
      id: 'cl_llaves',
      numero: 8,
      siempre: true,
      titulo: { es: 'LLAVES', en: 'KEYS' },
      render: (ctx) => ({
        es: `EL PROPIETARIO acuerda proveer al ADMINISTRADOR ${ctx.vigencia.num_llaves} juegos de llaves${ctx.vigencia.incluir_codigo_acceso ? ' o código de entrada' : ''} de la PROPIEDAD.`,
        en: `THE OWNER agrees to provide THE ADMINISTRATOR with ${ctx.vigencia.num_llaves} sets of keys${ctx.vigencia.incluir_codigo_acceso ? ' or door code' : ''} to THE PROPERTY.`,
      }),
    },

    // CLÁUSULA 9 — DURACIÓN Y CANCELACIÓN
    {
      id: 'cl_duracion',
      numero: 9,
      siempre: true,
      titulo: { es: 'DURACIÓN DEL CONTRATO DE ADMINISTRACIÓN Y MANTENIMIENTO ASÍ COMO CANCELACIÓN ANTICIPADA', en: 'DURATION OF THE MANAGEMENT AND MAINTENANCE SERVICES CONTRACT AND CANCELLATION' },
      render: (ctx) => ({
        es: `El contrato empezará a surtir sus efectos el ${ctx.vigencia.fecha_inicio_es} y tendrá vigencia ${ctx.vigencia.duracion_texto_es} salvo que EL PROPIETARIO y/o el ADMINISTRADOR haya manifestado, unilateralmente vía email, y con un mes de anticipación, su deseo de darlo por terminado.\n\nEn caso de que EL PROPIETARIO no hiciera manifestación alguna al ADMINISTRADOR en el sentido de dar por terminado este contrato y del ADMINISTRADOR para con EL PROPIETARIO, éste se mantendrá vigente como se menciona anteriormente, constituyendo el pago de las mensualidades por concepto de administración y mantenimiento la aceptación tácita y expresa de la continuidad del mismo independientemente de que no se haya firmado el contrato. En caso de que EL PROPIETARIO y/o el ADMINISTRADOR desee rescindir el contrato, notificarán con ${ctx.vigencia.dias_aviso_cancelacion} (${ctx.vigencia.dias_aviso_letras}) días naturales de anticipación a cada parte vía correo electrónico. Al término del contrato EL PROPIETARIO será responsable del último pago mensual por concepto de administración y mantenimiento que esté corriendo así como de cualquier pago y/o gasto que en general este corriendo originado por éste contrato y quedará pendiente de cubrir o de aquellos que el ADMINISTRADOR haya cubierto por cuenta del PROPIETARIO. Cualquier gasto relacionado con la rescisión del contrato por decisión del PROPIETARIO será a su cargo.`,
        en: `The contract will take effect on the ${ctx.vigencia.fecha_inicio_en} and will be ${ctx.vigencia.duracion_texto_en} unless THE OWNER and/or THE ADMINISTRATOR have stated via email, with a month in advance, their desire to terminate it.\n\nIf THE OWNER does not make any statement to THE ADMINISTRATOR to terminate this contract and from THE ADMINISTRATOR to THE OWNER, this is deemed as mentioned above, constitutes the payment of monthly property management and maintenance fee will also be accepted as continuity of the contract, regardless of whether the renewal has been signed or not. If THE OWNER and/or THE ADMINISTRADOR wish to terminate the contract before its natural termination date, there should be a notification ${ctx.vigencia.dias_aviso_cancelacion} (${ctx.vigencia.dias_aviso_letras_en}) calendar days prior to termination date, to each party via Email. At the end of the contract THE OWNER will be liable to pay the last payment of property management and maintenance fee that is outstanding as well any general expense outstanding generated by this contract or for those expenses that THE ADMINISTRATOR paid on behalf of THE OWNER. Any expenses related to rescinding the contract by decision of THE OWNER shall be absorbed by them.`,
      }),
    },

    // CLÁUSULA 10 — LISTA DE PRECIOS
    {
      id: 'cl_precios',
      numero: 10,
      siempre: true,
      titulo: { es: 'LISTA DE PRECIOS', en: 'PRICE LIST' },
      render: (ctx) => ({
        es: `El ADMINISTRADOR proveerá la lista de precios de los servicios no incluidos en la cuota de mensual la cual tendrá la vigencia que se muestre en la misma si el PROPIETARIO acepta el precio sugerido. Los precios están incluidos en el ANEXO I y se entienden aceptados a la firma del presente contrato.`,
        en: `THE ADMINISTRATOR will provide the price list for the services not included in the monthly fee and this will be valid according with the date in the list, if the OWNER agrees to the suggested prices. The prices are included in ATTACHMENT I and are understood as accepted at the signing of this contract.`,
      }),
    },

    // CLÁUSULA 11 — RESPONSABILIDAD (condicional)
    {
      id: 'cl_responsabilidad',
      numero: 11,
      condicional: true,
      default: true,
      etiqueta: 'Cláusula de responsabilidad/liability',
      etiqueta_en: 'Liability clause',
      titulo: { es: 'RESPONSABILIDAD', en: 'LIABILITY' },
      render: (ctx) => ({
        es: `EL ADMINISTRADOR no será responsable bajo ninguna circunstancia por ningún acto y/o asunto relativo al orden judicial, administrativo y/o criminal que se sigan en contra de EL PROPIETARIO relacionado con su finca, ya sea por autoridades del orden Federal y/o Estatal y/o Municipal. En su caso.`,
        en: `THE ADMINISTRATOR shall not be liable under any circumstance for any act and/or issue relating to judicial, administrative and/or criminal enforcement against THE OWNER relating to this property either by Federal and/or State and/or Municipal law enforcement.`,
      }),
    },

    // CLÁUSULA 12 — NOTIFICACIONES
    {
      id: 'cl_notificaciones',
      numero: 12,
      siempre: true,
      titulo: { es: 'NOTIFICACIONES', en: 'NOTIFICATIONS' },
      render: (ctx) => ({
        es: `Cualquier comunicación sobre cuestiones relacionadas con la administración y mantenimiento de la PROPIEDAD administrada y de este contrato, las partes acuerdan en realizarse vía correo electrónico a las siguientes direcciones:\n\nEL ADMINISTRADOR: claudia@castlesolutions.biz\nTeléfono: +52 322 306 8482\n\nEL PROPIETARIO: ${ctx.propietario.email}\nTeléfono: ${ctx.propietario.celular}\n\nSiendo la única forma legal de hacerlo.`,
        en: `Any communication on matters related to the administration and maintenance of the managed PROPERTY and this contract, the parties agree to be made by e-mail to the following addresses:\n\nTHE ADMINISTRATOR: claudia@castlesolutions.biz\nPhone: +52 322 306 8482\n\nTHE OWNER: ${ctx.propietario.email}\nPhone: ${ctx.propietario.celular}\n\nWhich will be the only legal way to do it.`,
      }),
    },

    // CLÁUSULA 13 — JURISDICCIÓN
    {
      id: 'cl_jurisdiccion',
      numero: 13,
      siempre: true,
      titulo: { es: 'JURISDICCIÓN', en: 'JURISDICTION' },
      render: (ctx) => ({
        es: `Las partes convienen que en el presente contrato no existen vicios del consentimiento y comprenden todas y cada de las obligaciones contraídas, y, en caso de controversia respecto de la interpretación y cumplimiento de las obligaciones y derechos pactados, aceptan someterse a la jurisdicción y competencia de los Tribunales civiles de la ciudad de Puerto Vallarta, Jalisco.`,
        en: `The parties agree that in this contract there are no will full malicious conducts and understand every obligation contained in this contract and in the event of interpretation and/or dispute over rights and obligations agreed in this contract, are subject to the jurisdiction and competence of the Civil Courts of the town of Puerto Vallarta, Jalisco.`,
      }),
    },

    // NOTA DE TRADUCCIÓN
    {
      id: 'nota_traduccion',
      siempre: true,
      render: (ctx) => ({
        es: `La traducción al idioma inglés es mera cortesía. En el evento de una controversia, la versión en español prevalecerá.`,
        en: `The translation to English is mere courtesy. In the event of a controversy, the Spanish version will prevail.`,
      }),
    },

    // CIERRE Y FIRMA
    {
      id: 'cierre',
      siempre: true,
      render: (ctx) => ({
        es: `Leído que fue el contenido de éste contrato por las partes lo firman de conformidad en la ciudad de ${ctx.vigencia.ciudad_firma} el día ${ctx.vigencia.fecha_inicio_es} ante la presencia de los testigos que lo acompañan.`,
        en: `Having read this contract and being aware of its contents, the parties agree to sign this contract in the City of ${ctx.vigencia.ciudad_firma} on the ${ctx.vigencia.fecha_inicio_en} in the presence of witnesses that are present.`,
      }),
    },

    // FIRMAS
    {
      id: 'firmas',
      tipo: 'firmas',
      siempre: true,
      render: (ctx) => ({
        firmas: [
          { nombre: ctx.propietario.nombres, rol_es: ctx.propietario.clave === 'mp' || ctx.propietario.clave === 'fp' ? 'PROPIETARIOS' : 'PROPIETARIO', rol_en: ctx.propietario.clave === 'mp' || ctx.propietario.clave === 'fp' ? 'OWNERS' : 'OWNER' },
          { nombre: 'Claudia Rebeca Castillo Soto', rol_es: 'Representante legal\nCASTLEBAY PV, SRL DE CV\nADMINISTRADORA', rol_en: 'Legal representative\nCASTLEBAY PV, SRL DE CV\nADMINISTRATOR' },
        ],
        testigos: ctx.testigos?.incluir_testigos !== false,
      }),
    },
  ],
};

export default PLANTILLA_ADMINISTRACION;
