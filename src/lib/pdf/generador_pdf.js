/**
 * OfertaGen — Generador PDF Bilingüe
 * 
 * Genera PDF con tabla lado a lado (ES | EN/FR)
 * usando pdfmake (layout engine declarativo).
 * 
 * Sprint PDF v2 — Abril 2026
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configurar fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs || pdfFonts;

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
  
  const bloquesNormales = bloques.filter(b => b.tipo !== 'firmas');
  const bloqueFirmas = bloques.find(b => b.tipo === 'firmas');
  
  // Texto de paginación según idioma
  const paginaLang2 = lang2 === 'fr' ? 'Page' : 'Page';
  const deLang2 = lang2 === 'fr' ? 'sur' : 'of';
  
  // Iniciales para footer
  const iniciales = bloqueFirmas?.firmas?.map(f => {
    const ini = extraerIniciales(f.nombre);
    return `${ini} _____`;
  }).join('          ') || '';
  
  // Construir filas de la tabla bilingüe
  const tableBody = [];
  
  for (const bloque of bloquesNormales) {
    const tituloEs = bloque.titulo?.es || bloque.t?.es || '';
    const tituloLang2 = bloque.titulo?.[lang2] || bloque.titulo?.en || bloque.t?.[lang2] || bloque.t?.en || '';
    const textoEs = limpiarTexto(bloque.es || '', 'es');
    const textoLang2 = limpiarTexto(bloque[lang2] || bloque.en || '', lang2);
    const num = bloque.numero || bloque.n || '';
    
    // Construir contenido de cada celda
    const celdaEs = [];
    const celdaEn = [];
    
    // Título
    if (tituloEs) {
      celdaEs.push({ text: num ? `${num}.- ${tituloEs}` : tituloEs, bold: true, fontSize: 9, marginBottom: 3 });
    }
    if (tituloLang2) {
      celdaEn.push({ text: num ? `${num}.- ${tituloLang2}` : tituloLang2, bold: true, fontSize: 9, marginBottom: 3 });
    }
    
    // Texto
    if (textoEs) {
      celdaEs.push({ text: textoEs, fontSize: 8, lineHeight: 1.2 });
    }
    if (textoLang2) {
      celdaEn.push({ text: textoLang2, fontSize: 8, lineHeight: 1.2 });
    }
    
    tableBody.push([
      { stack: celdaEs, margin: [4, 4, 4, 4] },
      { stack: celdaEn, margin: [4, 4, 4, 4] }
    ]);
  }
  
  // Construir sección de firmas
  const firmasContent = [];
  if (bloqueFirmas?.firmas) {
    const firmasColumns = bloqueFirmas.firmas.map(firma => ({
      width: '*',
      stack: [
        { text: '', margin: [0, 20, 0, 0] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 0.5 }], alignment: 'center', margin: [0, 0, 0, 5] },
        { text: firma.nombre || '', bold: true, fontSize: 9, alignment: 'center' },
        { text: firma.rol || firma.rol_es || '', fontSize: 8, color: '#555555', alignment: 'center' }
      ],
      alignment: 'center'
    }));
    
    firmasContent.push({
      columns: firmasColumns,
      margin: [0, 30, 0, 0]
    });
  }
  
  // Definición del documento
  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 50, 40, 50],
    
    // Header con paginación bilingüe
    header: (currentPage, pageCount) => ({
      text: `Página ${currentPage} de ${pageCount}  |  ${paginaLang2} ${currentPage} ${deLang2} ${pageCount}`,
      alignment: 'right',
      fontSize: 7,
      color: '#555555',
      margin: [0, 20, 40, 0]
    }),
    
    // Footer con iniciales
    footer: (currentPage, pageCount) => ({
      text: iniciales,
      alignment: 'center',
      fontSize: 8,
      color: '#555555',
      margin: [0, 10, 0, 0]
    }),
    
    // Contenido principal
    content: [
      // Tabla bilingüe
      {
        table: {
          headerRows: 0,
          widths: ['50%', '50%'],
          body: tableBody
        },
        layout: {
          hLineWidth: (i, node) => 0.3,
          vLineWidth: (i, node) => (i === 1) ? 0.7 : 0.3, // Línea central más gruesa
          hLineColor: () => '#cccccc',
          vLineColor: () => '#555555',
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      },
      // Firmas
      ...firmasContent,
      // Footer de Colmena
      {
        text: 'Hecho por Colmena 2026',
        alignment: 'center',
        fontSize: 7,
        color: '#555555',
        margin: [0, 40, 0, 0]
      }
    ],
    
    // Estilos por defecto
    defaultStyle: {
      font: 'Roboto'
    }
  };
  
  // Generar PDF como blob
  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        resolve(blob);
      });
    } catch (err) {
      reject(err);
    }
  });
}

export default { generarPdfBlob };
