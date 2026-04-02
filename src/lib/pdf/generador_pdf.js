/**
 * OfertaGen — Generador PDF Bilingüe
 * 
 * Genera PDF con tabla lado a lado (ES | EN/FR)
 * usando jsPDF (100% browser, sin dependencias de Node).
 * 
 * Sprint PDF — Abril 2026
 */

import { jsPDF } from 'jspdf';

// ============================================================
// CONSTANTES
// ============================================================

const MARGIN = 40;
const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
const COL_WIDTH = CONTENT_WIDTH / 2;
const FONT_SIZE_BODY = 9;
const FONT_SIZE_TITLE = 10;
const FONT_SIZE_HEADER = 8;
const LINE_HEIGHT = 4;

// ============================================================
// HELPERS
// ============================================================

/**
 * Extrae iniciales de un nombre.
 */
function extraerIniciales(nombre) {
  if (!nombre) return '';
  return nombre.split(/\s+/).map(p => p.charAt(0)).join('');
}

/**
 * Divide texto en líneas que caben en un ancho dado.
 */
function wrapText(doc, text, maxWidth) {
  if (!text) return [];
  const lines = doc.splitTextToSize(text, maxWidth);
  return lines;
}

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Genera PDF y devuelve como Blob.
 */
export async function generarPdfBlob(bloques, meta = {}, opciones = {}) {
  const { idiomaSecundario = 'en' } = opciones;
  const lang2 = idiomaSecundario;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });
  
  // Separar bloques normales de firmas
  const bloquesNormales = bloques.filter(b => b.tipo !== 'firmas');
  const bloqueFirmas = bloques.find(b => b.tipo === 'firmas');
  
  // Paginación según idioma
  const paginaLang2 = lang2 === 'fr' ? 'Page' : 'Page';
  const deLang2 = lang2 === 'fr' ? 'sur' : 'of';
  
  // Iniciales para footer
  const iniciales = bloqueFirmas?.firmas?.map(f => {
    const ini = extraerIniciales(f.nombre);
    return `${ini} _____`;
  }).join('          ') || '';
  
  let y = MARGIN;
  let pageNum = 1;
  
  // Función para agregar header/footer
  const addHeaderFooter = () => {
    // Header - paginación
    doc.setFontSize(FONT_SIZE_HEADER);
    doc.setTextColor(85, 85, 85);
    const totalPages = doc.internal.getNumberOfPages();
    const headerText = `Página ${pageNum} de ${totalPages} | ${paginaLang2} ${pageNum} ${deLang2} ${totalPages}`;
    doc.text(headerText, PAGE_WIDTH - MARGIN, 25, { align: 'right' });
    
    // Footer - iniciales
    if (iniciales) {
      doc.text(iniciales, PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: 'center' });
    }
  };
  
  // Función para nueva página
  const newPage = () => {
    doc.addPage();
    pageNum++;
    y = MARGIN;
  };
  
  // Función para verificar espacio y agregar página si necesario
  const checkSpace = (needed) => {
    if (y + needed > PAGE_HEIGHT - MARGIN - 30) {
      newPage();
      return true;
    }
    return false;
  };
  
  // Dibujar línea divisoria central
  const drawDivider = (startY, endY) => {
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + COL_WIDTH, startY, MARGIN + COL_WIDTH, endY);
  };
  
  // Renderizar cada bloque
  for (const bloque of bloquesNormales) {
    const tituloEs = bloque.titulo?.es || bloque.t?.es || '';
    const tituloLang2 = bloque.titulo?.[lang2] || bloque.titulo?.en || bloque.t?.[lang2] || bloque.t?.en || '';
    const textoEs = (bloque.es || '').replace(/undefined/g, '[SIN DEFINIR]');
    const textoLang2 = (bloque[lang2] || bloque.en || '').replace(/undefined/g, '[UNDEFINED]');
    const num = bloque.numero || bloque.n || '';
    
    // Calcular altura del bloque
    doc.setFontSize(FONT_SIZE_BODY);
    const linesEs = wrapText(doc, textoEs, COL_WIDTH - 16);
    const linesLang2 = wrapText(doc, textoLang2, COL_WIDTH - 16);
    const maxLines = Math.max(linesEs.length, linesLang2.length);
    const titleHeight = (tituloEs || tituloLang2) ? 16 : 0;
    const blockHeight = titleHeight + (maxLines * LINE_HEIGHT) + 20;
    
    checkSpace(blockHeight);
    
    const blockStartY = y;
    
    // Títulos
    if (tituloEs || tituloLang2) {
      doc.setFontSize(FONT_SIZE_TITLE);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      if (tituloEs) {
        const tituloCompleto = num ? `${num}.- ${tituloEs}` : tituloEs;
        doc.text(tituloCompleto, MARGIN + 8, y + 12);
      }
      if (tituloLang2) {
        const tituloCompleto = num ? `${num}.- ${tituloLang2}` : tituloLang2;
        doc.text(tituloCompleto, MARGIN + COL_WIDTH + 8, y + 12);
      }
      y += titleHeight;
    }
    
    // Contenido
    doc.setFontSize(FONT_SIZE_BODY);
    doc.setFont('helvetica', 'normal');
    
    // Columna ES
    doc.setTextColor(0, 0, 0);
    if (linesEs.length > 0) {
      doc.text(linesEs, MARGIN + 8, y + 4);
    }
    
    // Columna EN/FR
    doc.setTextColor(68, 68, 68);
    if (linesLang2.length > 0) {
      doc.text(linesLang2, MARGIN + COL_WIDTH + 8, y + 4);
    }
    
    y += (maxLines * LINE_HEIGHT) + 12;
    
    // Línea divisoria
    drawDivider(blockStartY, y);
    
    // Línea horizontal separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    
    y += 8;
  }
  
  // Firmas
  if (bloqueFirmas?.firmas) {
    checkSpace(120);
    y += 30;
    
    const firmas = bloqueFirmas.firmas;
    const firmaWidth = CONTENT_WIDTH / firmas.length;
    
    for (let i = 0; i < firmas.length; i++) {
      const firma = firmas[i];
      const x = MARGIN + (i * firmaWidth) + (firmaWidth / 2);
      
      // Línea de firma
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(x - 60, y, x + 60, y);
      
      // Nombre
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(firma.nombre || '', x, y + 15, { align: 'center' });
      
      // Rol
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(85, 85, 85);
      doc.text(firma.rol || firma.rol_es || '', x, y + 26, { align: 'center' });
    }
  }
  
  // Agregar headers/footers a todas las páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(FONT_SIZE_HEADER);
    doc.setTextColor(85, 85, 85);
    const headerText = `Página ${i} de ${totalPages} | ${paginaLang2} ${i} ${deLang2} ${totalPages}`;
    doc.text(headerText, PAGE_WIDTH - MARGIN, 25, { align: 'right' });
    
    if (iniciales) {
      doc.text(iniciales, PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: 'center' });
    }
  }
  
  // Generar blob
  const blob = doc.output('blob');
  return blob;
}

export default { generarPdfBlob };
