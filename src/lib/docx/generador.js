/**
 * OfertaGen — Generador DOCX Bilingüe
 * 
 * Convierte bloques renderizados en un documento Word
 * con formato de tabla lado a lado (ES | EN).
 * 
 * Reproduce el formato exacto de OFERTA_DENNIS_3.docx:
 * - Tabla de 2 columnas (español izquierda, inglés derecha)
 * - Títulos en negrita y subrayado
 * - Referencias contractuales en negrita
 * - Sección de firmas al final
 * - US Letter, márgenes de 1 pulgada
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  HeadingLevel,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  Tab,
  TabStopType,
  TabStopPosition,
  SectionType,
  VerticalAlign,
  ImageRun,
} from 'docx';

// ============================================================
// CONSTANTES DE FORMATO
// ============================================================

// US Letter: 12240 DXA ancho, 15840 DXA alto
const PAGE_WIDTH = 12240;
const PAGE_HEIGHT = 15840;
const MARGIN = 1080; // 0.75 pulgadas (un poco menos que 1" para dar más espacio a la tabla)
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2); // 10080 DXA

// Columnas de la tabla: 50/50
const COL_ES = Math.floor(CONTENT_WIDTH / 2); // 5040
const COL_EN = CONTENT_WIDTH - COL_ES;         // 5040

// Fuentes
const FONT = 'Arial';
const FONT_SIZE_BODY = 18;       // 9pt (en half-points)
const FONT_SIZE_TITLE = 20;      // 10pt
const FONT_SIZE_HEADER = 24;     // 12pt
const FONT_SIZE_FIRMA = 18;      // 9pt

// Bordes de tabla
const BORDER_THIN = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const BORDERS_VISIBLE = { top: BORDER_THIN, bottom: BORDER_THIN, left: BORDER_THIN, right: BORDER_THIN };
const BORDERS_NONE = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE };

// Bordes elegantes: solo línea vertical central visible
// Columna ES: solo borde derecho (la línea divisoria)
const BORDERS_COL_ES = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_THIN };
// Columna EN: solo borde izquierdo (la línea divisoria)
const BORDERS_COL_EN = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_THIN, right: BORDER_NONE };

// Márgenes de celda
const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

// Placeholder de logo (1x1 pixel PNG transparente, se reemplaza en UI)
// El usuario puede subir su propio logo que se pasará como base64
const LOGO_PLACEHOLDER = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Dimensiones del logo en el header
const LOGO_WIDTH = 120;  // pixels
const LOGO_HEIGHT = 50;  // pixels (ratio ~2.4:1 típico de logos)

// ============================================================
// HELPERS DE TEXTO
// ============================================================

/**
 * Detecta referencias contractuales en el texto y las pone en negrita.
 * Ej: "EL OFERTANTE" → negrita, "LA PROPIETARIA" → negrita
 * También detecta texto entre comillas que son referencias: "EL OFERTANTE"
 */
function parseTextoConNegritas(texto, fontSize = FONT_SIZE_BODY) {
  if (!texto) return [new TextRun({ text: '', font: FONT, size: fontSize })];

  const runs = [];
  // Patrón 1: referencias contractuales (EL OFERTANTE, THE OWNER, etc.)
  // Patrón 2: nombres propios en mayúsculas (DENNIS DREISBACH DOTY, etc.)
  // Patrón 3: términos clave (FECHA DE FORMALIZACIÓN, TÉRMINO DE VIGENCIA, etc.)
  const pattern = /((?:"|")?(?:EL|LA|LOS|LAS|THE)\s+(?:OFERTANTE|PROPIETARI[OA]|VENDEDOR[A]?|COMPRADOR[A]?|OFFERER|OWNER|SELLER|BUYER|INMUEBLE|PROPERTY|FORMALIZ\w+|BENEFICIARI[OA]?|FIDEICOMISO)(?:S)?(?:"|")?|(?:FECHA DE FORMALIZACIÓN|TÉRMINO DE VIGENCIA|TERM OF EFFECT|FORMALIZING DATE|GASTOS DE ESCRITURACIÓN|CLOSING COSTS|CUENTA ESCROW|ESCROW ACCOUNT|ANEXO [A-Z])|(?:[A-ZÁÉÍÓÚÑÜ]{2,}(?:\s+[A-ZÁÉÍÓÚÑÜ]{2,}){1,5})(?=,|\s+(?:quien|who|manifiesta|states|por|de|herein|y\s|en\s|a\s)))/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(texto)) !== null) {
    // Texto antes del match
    if (match.index > lastIndex) {
      runs.push(new TextRun({
        text: texto.substring(lastIndex, match.index),
        font: FONT,
        size: fontSize,
      }));
    }

    // El match en negrita
    runs.push(new TextRun({
      text: match[0],
      font: FONT,
      size: fontSize,
      bold: true,
    }));

    lastIndex = match.index + match[0].length;
  }

  // Texto después del último match
  if (lastIndex < texto.length) {
    runs.push(new TextRun({
      text: texto.substring(lastIndex),
      font: FONT,
      size: fontSize,
    }));
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text: texto, font: FONT, size: fontSize }));
  }

  return runs;
}

/**
 * Convierte texto con \n\n (párrafos) y \n (line breaks) en Paragraphs.
 */
function textoAParagrafos(texto, fontSize = FONT_SIZE_BODY, alignment = AlignmentType.JUSTIFIED) {
  if (!texto) return [new Paragraph({ children: [new TextRun({ text: '', font: FONT, size: fontSize })] })];

  const parrafos = texto.split('\n\n');
  const resultado = [];

  for (const parrafo of parrafos) {
    // Dentro de un párrafo, \n simples → line break
    const lineas = parrafo.split('\n');
    const runs = [];

    for (let i = 0; i < lineas.length; i++) {
      if (i > 0) {
        runs.push(new TextRun({ break: 1, font: FONT, size: fontSize }));
      }
      runs.push(...parseTextoConNegritas(lineas[i], fontSize));
    }

    resultado.push(new Paragraph({
      children: runs,
      alignment,
      spacing: { after: 80 },
    }));
  }

  return resultado;
}

// ============================================================
// CONSTRUCCIÓN DEL DOCUMENTO
// ============================================================

/**
 * Crea filas de la tabla bilingüe (una cláusula).
 * IMPORTANTE: Devuelve ARRAY de filas, no una sola fila.
 * Cada párrafo ES/EN se alinea en su propia fila para evitar descuadre.
 */
function crearFilasClausula(bloque) {
  const filas = [];
  
  // 1. FILA DE TÍTULO (si tiene)
  if (bloque.titulo || bloque.t) {
    const tituloEs = bloque.titulo?.es || bloque.t?.es || '';
    const tituloEn = bloque.titulo?.en || bloque.t?.en || '';
    const numPrefix = bloque.numero || bloque.n ? `${bloque.numero || bloque.n}.- ` : '';

    if (tituloEs || tituloEn) {
      filas.push(new TableRow({
        children: [
          new TableCell({
            borders: BORDERS_COL_ES,
            width: { size: COL_ES, type: WidthType.DXA },
            margins: CELL_MARGINS,
            verticalAlign: VerticalAlign.TOP,
            children: [new Paragraph({
              children: [new TextRun({
                text: `${numPrefix}${tituloEs}`,
                font: FONT,
                size: FONT_SIZE_TITLE,
                bold: true,
                underline: {},
              })],
              spacing: { after: 60 },
            })],
          }),
          new TableCell({
            borders: BORDERS_COL_EN,
            width: { size: COL_EN, type: WidthType.DXA },
            margins: CELL_MARGINS,
            verticalAlign: VerticalAlign.TOP,
            children: [new Paragraph({
              children: [new TextRun({
                text: `${numPrefix}${tituloEn}`,
                font: FONT,
                size: FONT_SIZE_TITLE,
                bold: true,
                underline: {},
              })],
              spacing: { after: 60 },
            })],
          }),
        ],
      }));
    }
  }

  // 2. FILA DE SUBTÍTULO (si tiene)
  if (bloque.subtitulo) {
    const subEs = bloque.subtitulo?.es || '';
    const subEn = bloque.subtitulo?.en || '';
    if (subEs || subEn) {
      filas.push(new TableRow({
        children: [
          new TableCell({
            borders: BORDERS_COL_ES,
            width: { size: COL_ES, type: WidthType.DXA },
            margins: CELL_MARGINS,
            verticalAlign: VerticalAlign.TOP,
            children: [new Paragraph({
              children: [new TextRun({
                text: subEs,
                font: FONT,
                size: FONT_SIZE_BODY,
                bold: true,
              })],
              spacing: { after: 60 },
            })],
          }),
          new TableCell({
            borders: BORDERS_COL_EN,
            width: { size: COL_EN, type: WidthType.DXA },
            margins: CELL_MARGINS,
            verticalAlign: VerticalAlign.TOP,
            children: [new Paragraph({
              children: [new TextRun({
                text: subEn,
                font: FONT,
                size: FONT_SIZE_BODY,
                bold: true,
              })],
              spacing: { after: 60 },
            })],
          }),
        ],
      }));
    }
  }

  // 3. FILAS DE CONTENIDO (una fila por párrafo)
  const textoEs = bloque.es || '';
  const textoEn = bloque.en || '';
  
  // Dividir por doble salto de línea (párrafos)
  const parrafosEs = textoEs.split('\n\n').filter(p => p.trim());
  const parrafosEn = textoEn.split('\n\n').filter(p => p.trim());
  
  // Tomar el máximo de párrafos entre ambos idiomas
  const maxParrafos = Math.max(parrafosEs.length, parrafosEn.length);
  
  for (let i = 0; i < maxParrafos; i++) {
    const pEs = parrafosEs[i] || '';
    const pEn = parrafosEn[i] || '';
    
    // Convertir \n simples a line breaks dentro del párrafo
    const crearContenidoCelda = (texto) => {
      if (!texto) return [new Paragraph({ children: [new TextRun({ text: '', font: FONT, size: FONT_SIZE_BODY })] })];
      
      const lineas = texto.split('\n');
      const runs = [];
      
      for (let j = 0; j < lineas.length; j++) {
        if (j > 0) {
          runs.push(new TextRun({ break: 1, font: FONT, size: FONT_SIZE_BODY }));
        }
        runs.push(...parseTextoConNegritas(lineas[j], FONT_SIZE_BODY));
      }
      
      return [new Paragraph({
        children: runs,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 80 },
      })];
    };
    
    filas.push(new TableRow({
      children: [
        new TableCell({
          borders: BORDERS_COL_ES,
          width: { size: COL_ES, type: WidthType.DXA },
          margins: CELL_MARGINS,
          verticalAlign: VerticalAlign.TOP,
          children: crearContenidoCelda(pEs),
        }),
        new TableCell({
          borders: BORDERS_COL_EN,
          width: { size: COL_EN, type: WidthType.DXA },
          margins: CELL_MARGINS,
          verticalAlign: VerticalAlign.TOP,
          children: crearContenidoCelda(pEn),
        }),
      ],
    }));
  }
  
  // Si no hay contenido, agregar fila vacía
  if (filas.length === 0) {
    filas.push(new TableRow({
      children: [
        new TableCell({
          borders: BORDERS_COL_ES,
          width: { size: COL_ES, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({ children: [] })],
        }),
        new TableCell({
          borders: BORDERS_COL_EN,
          width: { size: COL_EN, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({ children: [] })],
        }),
      ],
    }));
  }
  
  return filas;
}

/**
 * Crea la fila de firmas.
 */
function crearFilaFirmas(bloque) {
  const firmas = bloque.firmas || [];

  const celdas = firmas.map(firma => {
    return new TableCell({
      borders: BORDERS_NONE,
      width: { size: COL_ES, type: WidthType.DXA },
      margins: { top: 400, bottom: 200, left: 200, right: 200 },
      children: [
        new Paragraph({ spacing: { before: 600 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: '___________________________',
            font: FONT,
            size: FONT_SIZE_FIRMA,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 80 },
          children: [new TextRun({
            text: firma.nombre,
            font: FONT,
            size: FONT_SIZE_FIRMA,
            bold: true,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: firma.rol || firma.rol_es || '',
            font: FONT,
            size: FONT_SIZE_FIRMA,
          })],
        }),
      ],
    });
  });

  // Si solo hay una firma, agregar celda vacía
  while (celdas.length < 2) {
    celdas.push(new TableCell({
      borders: BORDERS_NONE,
      width: { size: COL_EN, type: WidthType.DXA },
      children: [new Paragraph({ children: [] })],
    }));
  }

  return new TableRow({ children: celdas });
}

/**
 * Genera el encabezado del documento.
 */
function crearEncabezado(meta) {
  const tituloEs = (meta.nombre || 'OFERTA DE INTENCIÓN DE COMPRA').toUpperCase();
  const tituloEn = (meta.nombre_en || 'OFFER INTENT TO PURCHASE').toUpperCase();
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: tituloEs,
          font: FONT,
          size: FONT_SIZE_HEADER,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: tituloEn,
          font: FONT,
          size: FONT_SIZE_HEADER,
          bold: true,
        }),
      ],
    }),
  ];
}

// ============================================================
// HELPERS: INICIALES
// ============================================================

/**
 * Extrae iniciales de un nombre. "DENNIS DREISBACH DOTY" → "DDD"
 */
function extraerIniciales(nombre) {
  if (!nombre) return '';
  return nombre.split(/\s+/).map(p => p.charAt(0)).join('');
}

/**
 * Genera las iniciales de todas las partes para el footer.
 * Ej: "DDD _____ KMP _____"
 */
function generarInicialesFooter(bloqueFirmas) {
  const firmas = bloqueFirmas?.firmas || [];
  return firmas.map(f => {
    const ini = extraerIniciales(f.nombre);
    return `${ini} _____`;
  }).join('          ');
}

// ============================================================
// HELPERS: TESTIGOS Y ACEPTACIÓN
// ============================================================

function crearTestigos() {
  return [
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    new Paragraph({
      children: [new TextRun({ text: 'TESTIGO 1 / WITNESS 1:', font: FONT, size: FONT_SIZE_FIRMA })],
    }),
    new Paragraph({
      spacing: { before: 300 },
      children: [new TextRun({ text: '___________________________________', font: FONT, size: FONT_SIZE_FIRMA })],
    }),
    new Paragraph({ spacing: { before: 200 }, children: [] }),
    new Paragraph({
      children: [new TextRun({ text: 'TESTIGO 2 / WITNESS 2:', font: FONT, size: FONT_SIZE_FIRMA })],
    }),
    new Paragraph({
      spacing: { before: 300 },
      children: [new TextRun({ text: '___________________________________', font: FONT, size: FONT_SIZE_FIRMA })],
    }),
  ];
}

function crearAceptacion() {
  return [
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'LUGAR, FECHA Y HORA DE ACEPTACIÓN / ACCEPTANCE PLACE, DATE AND TIME:', font: FONT, size: FONT_SIZE_FIRMA, bold: true }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [new TextRun({ text: '_____________________________________________________________', font: FONT, size: FONT_SIZE_FIRMA })],
    }),
  ];
}

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Genera un documento DOCX bilingüe a partir de los bloques renderizados.
 * 
 * @param {Array} bloques - Bloques renderizados por renderizarBloques()
 * @param {Object} meta - Metadata de la plantilla
 * @param {Object} opciones - { iniciales: true/false, logoBase64: string } — datos extra para formato
 * @returns {Promise<Buffer>} Buffer del archivo .docx
 */
export async function generarDocx(bloques, meta = {}, opciones = {}) {
  const { logoBase64 } = opciones;
  
  // Separar bloques normales de firmas
  const bloquesNormales = bloques.filter(b => (b.tipo || b.tipo) !== 'firmas');
  const bloqueFirmas = bloques.find(b => b.tipo === 'firmas');

  // Filas de la tabla principal (sin firmas)
  // crearFilasClausula devuelve ARRAY de filas, hay que aplanar
  const filas = bloquesNormales.flatMap(b => crearFilasClausula(b));

  // Tabla principal
  const tablaContrato = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [COL_ES, COL_EN],
    rows: filas,
  });

  // Contenido de la sección principal (con footer de iniciales)
  const contenidoPrincipal = [
    ...crearEncabezado(meta),
    tablaContrato,
  ];

  // Sección de firmas (página final, SIN footer de iniciales)
  const contenidoFirmas = [];
  if (bloqueFirmas) {
    const firmas = bloqueFirmas.firmas || [];

    // Firmas de las partes
    for (let i = 0; i < firmas.length; i++) {
      const firma = firmas[i];
      // Primera firma: más espacio (600), siguientes: menos (300)
      const spacingBefore = i === 0 ? 600 : 300;
      
      contenidoFirmas.push(
        new Paragraph({ spacing: { before: spacingBefore }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '___________________________', font: FONT, size: FONT_SIZE_FIRMA })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 80 },
          children: [new TextRun({ text: firma.nombre, font: FONT, size: FONT_SIZE_FIRMA, bold: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: firma.rol_es || '', font: FONT, size: FONT_SIZE_FIRMA })],
        }),
      );
    }

    // Testigos opcionales
    if (bloqueFirmas.testigos) {
      contenidoFirmas.push(...crearTestigos());
    }

    // Aceptación
    if (bloqueFirmas.aceptacion !== false) {
      contenidoFirmas.push(...crearAceptacion());
    }
  }

  // Footer con iniciales
  const inicialesText = generarInicialesFooter(bloqueFirmas);

  // Preparar logo para header (solo si hay logo real)
  const tieneLogoReal = logoBase64 && logoBase64 !== LOGO_PLACEHOLDER;
  
  // Detectar tipo de imagen por magic bytes
  const detectImageType = (base64) => {
    if (!base64) return 'png';
    // JPG empieza con /9j/ en base64
    if (base64.startsWith('/9j/')) return 'jpg';
    // PNG empieza con iVBOR en base64
    if (base64.startsWith('iVBOR')) return 'png';
    return 'png'; // default
  };

  // Crear children del header
  const headerChildren = [];
  
  if (tieneLogoReal) {
    const logoBuffer = Buffer.from(logoBase64, 'base64');
    const logoType = detectImageType(logoBase64);
    headerChildren.push(
      new ImageRun({
        data: logoBuffer,
        transformation: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
        type: logoType,
      })
    );
    headerChildren.push(new TextRun({ children: [new Tab()] }));
  }
  
  // Paginación (siempre presente, a la derecha si hay logo, centrada si no)
  headerChildren.push(
    new TextRun({ text: 'Página ', font: FONT, size: 14, color: '888888' }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 14, color: '888888' }),
    new TextRun({ text: ' de ', font: FONT, size: 14, color: '888888' }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 14, color: '888888' }),
    new TextRun({ text: '  |  Page ', font: FONT, size: 14, color: '888888' }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 14, color: '888888' }),
    new TextRun({ text: ' of ', font: FONT, size: 14, color: '888888' }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 14, color: '888888' })
  );

  // Header: Logo izquierda + Paginación derecha (usando TabStops)
  const headerDefault = new Header({
    children: [
      new Paragraph({
        tabStops: tieneLogoReal ? [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }] : [],
        alignment: tieneLogoReal ? undefined : AlignmentType.RIGHT,
        children: headerChildren,
      }),
    ],
  });

  // Footer con iniciales (sección principal)
  const footerIniciales = new Footer({
    children: [
      new Paragraph({
        children: [new TextRun({ text: inicialesText, font: FONT, size: 14, color: '888888' })],
        alignment: AlignmentType.CENTER,
      }),
    ],
  });

  // Footer vacío (sección de firmas)
  const footerVacio = new Footer({
    children: [new Paragraph({ children: [] })],
  });

  const pageProps = {
    page: {
      size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
      margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
    },
  };

  // Documento con 2 secciones: contenido (con iniciales) + firmas (sin iniciales)
  const sections = [
    {
      properties: {
        ...pageProps,
      },
      headers: { default: headerDefault },
      footers: { default: footerIniciales },
      children: contenidoPrincipal,
    },
  ];

  // Solo agregar sección de firmas si hay contenido
  if (contenidoFirmas.length > 0) {
    sections.push({
      properties: {
        ...pageProps,
        type: SectionType.CONTINUOUS,
      },
      headers: { default: headerDefault },
      footers: { default: footerVacio },
      children: contenidoFirmas,
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FONT_SIZE_BODY },
        },
      },
    },
    sections,
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Genera un Blob para descarga en browser.
 */
export async function generarDocxBlob(bloques, meta = {}, opciones = {}) {
  const buffer = await generarDocx(bloques, meta, opciones);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
