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

const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 50;
const MARGIN_SIDE = 40;
const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_SIDE * 2);
const COL_WIDTH = (CONTENT_WIDTH - 8) / 2; // 8px gap en medio
const FONT_SIZE_BODY = 8;
const FONT_SIZE_TITLE = 9;
const FONT_SIZE_HEADER = 7;
const LINE_HEIGHT = 11;

// ============================================================
// HELPERS
// ============================================================

function extraerIniciales(nombre) {
  if (!nombre) return '';
  return nombre.split(/\s+/).map(p => p.charAt(0)).join('');
}

function limpiarTexto(texto, lang = 'es') {
  if (!texto) return '';
  const placeholder = lang === 'es' ? '[SIN DEFINIR]' : '[UNDEFINED]';
  return texto
    .replace(/undefined/g, placeholder)
    .replace(/\n\n+/g, '\n')
    .trim();
}

// ============================================================
// API PÚBLICA
// ============================================================

export async function generarPdfBlob(bloques, meta = {}, opciones = {}) {
  const { idiomaSecundario = 'en' } = opciones;
  const lang2 = idiomaSecundario;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });
  
  const bloquesNormales = bloques.filter(b => b.tipo !== 'firmas');
  const bloqueFirmas = bloques.find(b => b.tipo === 'firmas');
  
  const paginaLang2 = lang2 === 'fr' ? 'Page' : 'Page';
  const deLang2 = lang2 === 'fr' ? 'sur' : 'of';
  
  const iniciales = bloqueFirmas?.firmas?.map(f => {
    const ini = extraerIniciales(f.nombre);
    return `${ini} _____`;
  }).join('          ') || '';
  
  let y = MARGIN_TOP;
  const colEsX = MARGIN_SIDE;
  const colEnX = MARGIN_SIDE + COL_WIDTH + 8;
  const maxY = PAGE_HEIGHT - MARGIN_BOTTOM;
  
  // Track de líneas verticales por página (para dibujarlas al final)
  const verticalLines = []; // {page, startY, endY}
  let currentPageStartY = y;
  let currentPage = 1;
  
  const newPage = () => {
    // Guardar línea vertical de la página actual
    if (y > currentPageStartY) {
      verticalLines.push({ page: currentPage, startY: currentPageStartY, endY: y });
    }
    doc.addPage();
    currentPage++;
    y = MARGIN_TOP;
    currentPageStartY = y;
  };
  
  // Renderizar cada bloque
  for (const bloque of bloquesNormales) {
    const tituloEs = bloque.titulo?.es || bloque.t?.es || '';
    const tituloLang2 = bloque.titulo?.[lang2] || bloque.titulo?.en || bloque.t?.[lang2] || bloque.t?.en || '';
    const textoEs = limpiarTexto(bloque.es || '', 'es');
    const textoLang2 = limpiarTexto(bloque[lang2] || bloque.en || '', lang2);
    const num = bloque.numero || bloque.n || '';
    
    // Wrap texto
    doc.setFontSize(FONT_SIZE_BODY);
    doc.setFont('helvetica', 'normal');
    const linesEs = doc.splitTextToSize(textoEs, COL_WIDTH - 10);
    const linesLang2 = doc.splitTextToSize(textoLang2, COL_WIDTH - 10);
    const maxLines = Math.max(linesEs.length, linesLang2.length);
    
    // Título (si hay)
    if (tituloEs || tituloLang2) {
      // Verificar espacio para título
      if (y + 20 > maxY) {
        newPage();
      }
      
      doc.setFontSize(FONT_SIZE_TITLE);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      const tEs = num ? `${num}.- ${tituloEs}` : tituloEs;
      const tEn = num ? `${num}.- ${tituloLang2}` : tituloLang2;
      
      if (tituloEs) {
        doc.text(tEs, colEsX, y, { maxWidth: COL_WIDTH - 10 });
      }
      if (tituloLang2) {
        doc.text(tEn, colEnX, y, { maxWidth: COL_WIDTH - 10 });
      }
      
      y += 14;
    }
    
    // Contenido línea por línea
    doc.setFontSize(FONT_SIZE_BODY);
    doc.setFont('helvetica', 'normal');
    
    for (let i = 0; i < maxLines; i++) {
      // Verificar espacio
      if (y + LINE_HEIGHT > maxY) {
        newPage();
      }
      
      // Columna ES
      if (i < linesEs.length) {
        doc.setTextColor(0, 0, 0);
        doc.text(linesEs[i], colEsX, y);
      }
      
      // Columna EN/FR
      if (i < linesLang2.length) {
        doc.setTextColor(0, 0, 0);
        doc.text(linesLang2[i], colEnX, y);
      }
      
      y += LINE_HEIGHT;
    }
    
    // Separador horizontal
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_SIDE, y, PAGE_WIDTH - MARGIN_SIDE, y);
    y += 8;
  }
  
  // Firmas
  if (bloqueFirmas?.firmas) {
    if (y + 80 > maxY) {
      newPage();
    }
    y += 15;
    
    const firmas = bloqueFirmas.firmas;
    const firmaWidth = CONTENT_WIDTH / firmas.length;
    
    doc.setTextColor(0, 0, 0);
    
    for (let i = 0; i < firmas.length; i++) {
      const firma = firmas[i];
      const x = MARGIN_SIDE + (i * firmaWidth) + (firmaWidth / 2);
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(x - 50, y, x + 50, y);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(firma.nombre || '', x, y + 12, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(firma.rol || firma.rol_es || '', x, y + 22, { align: 'center' });
    }
  }
  
  // Guardar última línea vertical
  if (y > currentPageStartY) {
    verticalLines.push({ page: currentPage, startY: currentPageStartY, endY: y });
  }
  
  // Dibujar líneas verticales centrales en cada página
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  const centerX = MARGIN_SIDE + COL_WIDTH + 4;
  
  for (const vl of verticalLines) {
    doc.setPage(vl.page);
    doc.line(centerX, vl.startY - 5, centerX, vl.endY);
  }
  
  // Headers y footers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setFontSize(FONT_SIZE_HEADER);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 85, 85);
    const headerText = `Página ${i} de ${totalPages} | ${paginaLang2} ${i} ${deLang2} ${totalPages}`;
    doc.text(headerText, PAGE_WIDTH - MARGIN_SIDE, 30, { align: 'right' });
    
    if (iniciales) {
      doc.text(iniciales, PAGE_WIDTH / 2, PAGE_HEIGHT - 25, { align: 'center' });
    }
  }
  
  return doc.output('blob');
}

export default { generarPdfBlob };
