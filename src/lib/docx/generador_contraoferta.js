/**
 * ContraOfertaGen — Generador DOCX Bilingüe
 * 
 * Genera contraoferta en formato tabla lado a lado (ES | EN/FR).
 * Más simple que oferta — sin logo, sin iniciales en footer.
 * 
 * Sprint CA-3 — Abril 2026
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
  Header,
  Footer,
  PageNumber,
  VerticalAlign,
} from 'docx';

// ============================================================
// CONSTANTES DE FORMATO
// ============================================================

const PAGE_WIDTH = 12240;  // US Letter
const MARGIN = 1080;       // 0.75"
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
const COL_ES = Math.floor(CONTENT_WIDTH / 2);
const COL_EN = CONTENT_WIDTH - COL_ES;

const FONT = 'Arial';
const FONT_SIZE_BODY = 18;    // 9pt
const FONT_SIZE_TITLE = 22;   // 11pt
const FONT_SIZE_HEADER = 24;  // 12pt
const FONT_SIZE_FIRMA = 18;   // 9pt

const BORDER_THIN = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const BORDERS_COL_ES = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_THIN };
const BORDERS_COL_EN = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_THIN, right: BORDER_NONE };

const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

// ============================================================
// HELPERS
// ============================================================

/**
 * Parsea texto y pone en negrita los términos entre **asteriscos**.
 */
function parseTextoConNegritas(texto, fontSize = FONT_SIZE_BODY) {
  if (!texto) return [new TextRun({ text: '', font: FONT, size: fontSize })];
  
  const runs = [];
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  
  for (const parte of partes) {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      runs.push(new TextRun({
        text: parte.slice(2, -2),
        font: FONT,
        size: fontSize,
        bold: true,
      }));
    } else if (parte) {
      runs.push(new TextRun({
        text: parte,
        font: FONT,
        size: fontSize,
      }));
    }
  }
  
  return runs.length ? runs : [new TextRun({ text: '', font: FONT, size: fontSize })];
}

/**
 * Crea filas de tabla para un bloque.
 */
function crearFilasBloque(bloque, lang2 = 'en') {
  const filas = [];
  const textoEs = bloque.es || '';
  const textoLang2 = bloque[lang2] || bloque.en || '';
  
  // Dividir por doble salto de línea
  const parrafosEs = textoEs.split('\n\n').filter(p => p.trim());
  const parrafosLang2 = textoLang2.split('\n\n').filter(p => p.trim());
  const maxParrafos = Math.max(parrafosEs.length, parrafosLang2.length, 1);
  
  for (let i = 0; i < maxParrafos; i++) {
    const pEs = parrafosEs[i] || '';
    const pLang2 = parrafosLang2[i] || '';
    
    const crearContenido = (texto) => {
      if (!texto) return [new Paragraph({ children: [] })];
      
      const lineas = texto.split('\n');
      const runs = [];
      
      for (let j = 0; j < lineas.length; j++) {
        if (j > 0) runs.push(new TextRun({ break: 1, font: FONT, size: FONT_SIZE_BODY }));
        runs.push(...parseTextoConNegritas(lineas[j], FONT_SIZE_BODY));
      }
      
      return [new Paragraph({
        children: runs,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
      })];
    };
    
    filas.push(new TableRow({
      children: [
        new TableCell({
          borders: BORDERS_COL_ES,
          width: { size: COL_ES, type: WidthType.DXA },
          margins: CELL_MARGINS,
          verticalAlign: VerticalAlign.TOP,
          children: crearContenido(pEs),
        }),
        new TableCell({
          borders: BORDERS_COL_EN,
          width: { size: COL_EN, type: WidthType.DXA },
          margins: CELL_MARGINS,
          verticalAlign: VerticalAlign.TOP,
          children: crearContenido(pLang2),
        }),
      ],
    }));
  }
  
  return filas;
}

/**
 * Crea sección de firmas.
 */
function crearSeccionFirmas(firmas, lang2 = 'en') {
  const contenido = [];
  
  for (const firma of firmas) {
    contenido.push(
      new Paragraph({ spacing: { before: 400 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '___________________________', font: FONT, size: FONT_SIZE_FIRMA })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80 },
        children: [new TextRun({ text: firma.nombre || '', font: FONT, size: FONT_SIZE_FIRMA, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ 
          text: `${firma.etiqueta_es || ''} / ${firma.etiqueta_en || ''}`, 
          font: FONT, 
          size: FONT_SIZE_FIRMA 
        })],
      }),
    );
    
    // Línea de fecha si aplica
    if (firma.fecha_linea) {
      contenido.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: 'Fecha / Date: _______________', font: FONT, size: FONT_SIZE_FIRMA })],
        }),
      );
    }
  }
  
  return contenido;
}

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Genera documento DOCX de contraoferta.
 * 
 * @param {Array} bloques - Bloques renderizados
 * @param {Object} meta - Metadata
 * @param {Object} opciones - { idiomaSecundario: 'en'|'fr' }
 * @returns {Promise<Buffer>}
 */
export async function generarDocxContraoferta(bloques, meta = {}, opciones = {}) {
  const { idiomaSecundario = 'en' } = opciones;
  const lang2 = idiomaSecundario;
  const lang2Label = lang2 === 'fr' ? 'Français' : 'English';
  
  // Separar bloques normales de firmas
  const bloquesNormales = bloques.filter(b => b.tipo !== 'firmas');
  const bloqueFirmas = bloques.find(b => b.tipo === 'firmas');
  
  // Filas de tabla
  const filas = bloquesNormales.flatMap(b => crearFilasBloque(b, lang2));
  
  // Tabla principal
  const tablaContrato = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [COL_ES, COL_EN],
    rows: filas,
  });
  
  // Contenido
  const contenido = [
    // Encabezado bilingüe
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: 'CONTRAOFERTA / ', font: FONT, size: FONT_SIZE_HEADER, bold: true }),
        new TextRun({ text: lang2 === 'fr' ? 'CONTRE-OFFRE' : 'COUNTER-OFFER', font: FONT, size: FONT_SIZE_HEADER, bold: true }),
      ],
    }),
    // Nota de idioma
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({
        text: meta.nota_idioma?.[lang2] || meta.nota_idioma?.en || '',
        font: FONT,
        size: 16,
        italics: true,
      })],
    }),
    // Tabla
    tablaContrato,
  ];
  
  // Firmas
  if (bloqueFirmas?.firmas) {
    contenido.push(...crearSeccionFirmas(bloqueFirmas.firmas, lang2));
  }
  
  // Footer
  contenido.push(
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: 'Hecho por Colmena 2026', 
        font: FONT, 
        size: 14, 
        color: '888888' 
      })],
    }),
  );
  
  // Crear documento
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'Página ', font: FONT, size: 16, color: '666666' }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '666666' }),
              new TextRun({ text: ' de ', font: FONT, size: 16, color: '666666' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: '666666' }),
              new TextRun({ text: ` / Page `, font: FONT, size: 16, color: '666666' }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '666666' }),
              new TextRun({ text: ' of ', font: FONT, size: 16, color: '666666' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: '666666' }),
            ],
          })],
        }),
      },
      children: contenido,
    }],
  });
  
  return await Packer.toBuffer(doc);
}

/**
 * Genera DOCX y devuelve como Blob (para descarga en browser).
 */
export async function generarDocxBlobContraoferta(bloques, meta = {}, opciones = {}) {
  const buffer = await generarDocxContraoferta(bloques, meta, opciones);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

export default { generarDocxContraoferta, generarDocxBlobContraoferta };
