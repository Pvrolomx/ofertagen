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

const MARGIN_TOP = 45;
const MARGIN_SIDE = 36;
const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_SIDE * 2);
const COL_WIDTH = CONTENT_WIDTH / 2 - 4;
const FONT_SIZE_BODY = 8;
const FONT_SIZE_TITLE = 9;
const FONT_SIZE_HEADER = 7;
const LINE_HEIGHT = 11; // Puntos entre líneas

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
 * Limpia texto de undefined y caracteres problemáticos.
 */
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
  
  let y = MARGIN_TOP;
  
  // Función para verificar espacio y agregar página si necesario
  const checkSpace = (needed) => {
    if (y + needed > PAGE_HEIGHT - 50) {
      doc.addPage();
      y = MARGIN_TOP;
      return true;
    }
    return false;
  };
  
  // Renderizar cada bloque
  for (const bloque of bloquesNormales) {
    const tituloEs = bloque.titulo?.es || bloque.t?.es || '';
    const tituloLang2 = bloque.titulo?.[lang2] || bloque.titulo?.en || bloque.t?.[lang2] || bloque.t?.en || '';
    const textoEs = limpiarTexto(bloque.es || '', 'es');
    const textoLang2 = limpiarTexto(bloque[lang2] || bloque.en || '', lang2);
    const num = bloque.numero || bloque.n || '';
    
    // Wrap texto para ambas columnas
    doc.setFontSize(FONT_SIZE_BODY);
    doc.setFont('helvetica', 'normal');
    const linesEs = doc.splitTextToSize(textoEs, COL_WIDTH - 8);
    const linesLang2 = doc.splitTextToSize(textoLang2, COL_WIDTH - 8);
    const maxLines = Math.max(linesEs.length, linesLang2.length);
    
    // Calcular altura del bloque
    const titleHeight = (tituloEs || tituloLang2) ? 14 : 0;
    const textHeight = maxLines * LINE_HEIGHT;
    const blockHeight = titleHeight + textHeight + 8;
    
    // Nueva página si no cabe
    checkSpace(blockHeight);
    
    const blockStartY = y;
    
    // Títulos
    if (tituloEs || tituloLang2) {
      doc.setFontSize(FONT_SIZE_TITLE);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      if (tituloEs) {
        const t = num ? `${num}.- ${tituloEs}` : tituloEs;
        doc.text(t, MARGIN_SIDE + 4, y + 10, { maxWidth: COL_WIDTH - 8 });
      }
      if (tituloLang2) {
        const t = num ? `${num}.- ${tituloLang2}` : tituloLang2;
        doc.text(t, MARGIN_SIDE + COL_WIDTH + 12, y + 10, { maxWidth: COL_WIDTH - 8 });
      }
      y += titleHeight;
    }
    
    // Contenido
    doc.setFontSize(FONT_SIZE_BODY);
    doc.setFont('helvetica', 'normal');
    
    // Columna ES
    doc.setTextColor(0, 0, 0);
    let lineY = y + 10;
    for (const line of linesEs) {
      if (lineY > PAGE_HEIGHT - 50) {
        doc.addPage();
        lineY = MARGIN_TOP + 10;
      }
      doc.text(line, MARGIN_SIDE + 4, lineY);
      lineY += LINE_HEIGHT;
    }
    
    // Columna EN/FR
    doc.setTextColor(60, 60, 60);
    lineY = y + 10;
    for (const line of linesLang2) {
      if (lineY > PAGE_HEIGHT - 50) {
        // Ya se hizo addPage en ES si era necesario
      }
      doc.text(line, MARGIN_SIDE + COL_WIDTH + 12, lineY);
      lineY += LINE_HEIGHT;
    }
    
    y += textHeight + 4;
    
    // Línea divisoria vertical (centro)
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_SIDE + COL_WIDTH + 4, blockStartY, MARGIN_SIDE + COL_WIDTH + 4, y);
    
    // Línea horizontal separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_SIDE, y + 2, PAGE_WIDTH - MARGIN_SIDE, y + 2);
    
    y += 10;
  }
  
  // Firmas
  if (bloqueFirmas?.firmas) {
    checkSpace(100);
    y += 20;
    
    const firmas = bloqueFirmas.firmas;
    const firmaWidth = CONTENT_WIDTH / firmas.length;
    
    doc.setTextColor(0, 0, 0);
    
    for (let i = 0; i < firmas.length; i++) {
      const firma = firmas[i];
      const x = MARGIN_SIDE + (i * firmaWidth) + (firmaWidth / 2);
      
      // Línea de firma
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(x - 50, y, x + 50, y);
      
      // Nombre
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(firma.nombre || '', x, y + 12, { align: 'center' });
      
      // Rol
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(firma.rol || firma.rol_es || '', x, y + 22, { align: 'center' });
    }
  }
  
  // Agregar headers/footers a todas las páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Header - paginación
    doc.setFontSize(FONT_SIZE_HEADER);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 85, 85);
    const headerText = `Página ${i} de ${totalPages} | ${paginaLang2} ${i} ${deLang2} ${totalPages}`;
    doc.text(headerText, PAGE_WIDTH - MARGIN_SIDE, 25, { align: 'right' });
    
    // Footer - iniciales
    if (iniciales) {
      doc.text(iniciales, PAGE_WIDTH / 2, PAGE_HEIGHT - 25, { align: 'center' });
    }
  }
  
  // Generar blob
  const blob = doc.output('blob');
  return blob;
}

export default { generarPdfBlob };
