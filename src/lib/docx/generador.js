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

// Márgenes de celda
const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

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
 * Crea una fila de la tabla bilingüe (una cláusula).
 */
function crearFilaClausula(bloque) {
  const paragrafosEs = [];
  const paragrafosEn = [];

  // Título de cláusula (si tiene)
  if (bloque.titulo || bloque.t) {
    const tituloEs = bloque.titulo?.es || bloque.t?.es || '';
    const tituloEn = bloque.titulo?.en || bloque.t?.en || '';
    const numPrefix = bloque.numero || bloque.n ? `${bloque.numero || bloque.n}.- ` : '';

    if (tituloEs) {
      paragrafosEs.push(new Paragraph({
        children: [new TextRun({
          text: `${numPrefix}${tituloEs}`,
          font: FONT,
          size: FONT_SIZE_TITLE,
          bold: true,
          underline: {},
        })],
        spacing: { after: 60 },
      }));
    }

    if (tituloEn) {
      paragrafosEn.push(new Paragraph({
        children: [new TextRun({
          text: `${numPrefix}${tituloEn}`,
          font: FONT,
          size: FONT_SIZE_TITLE,
          bold: true,
          underline: {},
        })],
        spacing: { after: 60 },
      }));
    }
  }

  // Contenido
  paragrafosEs.push(...textoAParagrafos(bloque.es));
  paragrafosEn.push(...textoAParagrafos(bloque.en));

  // Asegurar que haya al menos un párrafo por celda
  if (paragrafosEs.length === 0) paragrafosEs.push(new Paragraph({ children: [] }));
  if (paragrafosEn.length === 0) paragrafosEn.push(new Paragraph({ children: [] }));

  return new TableRow({
    children: [
      new TableCell({
        borders: BORDERS_VISIBLE,
        width: { size: COL_ES, type: WidthType.DXA },
        margins: CELL_MARGINS,
        children: paragrafosEs,
      }),
      new TableCell({
        borders: BORDERS_VISIBLE,
        width: { size: COL_EN, type: WidthType.DXA },
        margins: CELL_MARGINS,
        children: paragrafosEn,
      }),
    ],
  });
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
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'OFERTA DE INTENCIÓN DE COMPRA',
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
          text: 'OFFER INTENT TO PURCHASE',
          font: FONT,
          size: FONT_SIZE_HEADER,
          bold: true,
        }),
      ],
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
 * @returns {Promise<Buffer>} Buffer del archivo .docx
 */
export async function generarDocx(bloques, meta = {}) {
  // Separar bloques normales de firmas
  const bloquesNormales = bloques.filter(b => (b.tipo || b.tipo) !== 'firmas');
  const bloqueFirmas = bloques.find(b => b.tipo === 'firmas');

  // Filas de la tabla principal
  const filas = bloquesNormales.map(b => crearFilaClausula(b));

  // Agregar firmas como última fila
  if (bloqueFirmas) {
    filas.push(crearFilaFirmas(bloqueFirmas));
  }

  // Tabla principal
  const tablaContrato = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [COL_ES, COL_EN],
    rows: filas,
  });

  // Documento
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: FONT_SIZE_BODY,
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          },
          margin: {
            top: MARGIN,
            right: MARGIN,
            bottom: MARGIN,
            left: MARGIN,
          },
        },
      },
      children: [
        ...crearEncabezado(meta),
        tablaContrato,
      ],
    }],
  });

  // Generar buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Genera un Blob para descarga en browser.
 */
export async function generarDocxBlob(bloques, meta = {}) {
  const buffer = await generarDocx(bloques, meta);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
