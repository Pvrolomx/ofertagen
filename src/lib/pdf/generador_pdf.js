/**
 * OfertaGen — Generador PDF Bilingüe
 * 
 * Genera PDF con tabla lado a lado (ES | EN/FR)
 * usando pdfmake (layout engine declarativo).
 * 
 * Sprint PDF v2 — Abril 2026
 */

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
  try {
    // Import dinámico
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    
    // Configurar VFS (virtual file system con las fonts)
    const vfs = pdfFontsModule.pdfMake?.vfs || 
                pdfFontsModule.default?.pdfMake?.vfs || 
                pdfFontsModule.vfs ||
                pdfFontsModule.default?.vfs ||
                pdfFontsModule;
    
    pdfMake.vfs = vfs;
    
    // Definir fonts explícitamente (Roboto viene incluido en pdfmake)
    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };
    
    const { idiomaSecundario = 'en' } = opciones;
  const lang2 = idiomaSecundario;
  
  const bloquesNormales = bloques.filter(b => b.tipo !== 'firmas');
  const bloqueFirmas = bloques.find(b => b.tipo === 'firmas');
  
  const paginaLang2 = lang2 === 'fr' ? 'Page' : 'Page';
  const deLang2 = lang2 === 'fr' ? 'sur' : 'of';
  
  const iniciales = bloqueFirmas?.firmas?.map(f => {
    const ini = extraerIniciales(f.nombre);
    return `${ini} _____`;
  }).join('          ') || '';
  
  // Construir filas de la tabla
  const tableBody = [];
  
  for (const bloque of bloquesNormales) {
    const tituloEs = bloque.titulo?.es || bloque.t?.es || '';
    const tituloLang2 = bloque.titulo?.[lang2] || bloque.titulo?.en || bloque.t?.[lang2] || bloque.t?.en || '';
    const textoEs = limpiarTexto(bloque.es || '', 'es');
    const textoLang2 = limpiarTexto(bloque[lang2] || bloque.en || '', lang2);
    const num = bloque.numero || bloque.n || '';
    
    const celdaEs = [];
    const celdaEn = [];
    
    if (tituloEs) {
      celdaEs.push({ text: num ? `${num}.- ${tituloEs}` : tituloEs, bold: true, fontSize: 9, margin: [0, 0, 0, 3] });
    }
    if (tituloLang2) {
      celdaEn.push({ text: num ? `${num}.- ${tituloLang2}` : tituloLang2, bold: true, fontSize: 9, margin: [0, 0, 0, 3] });
    }
    
    if (textoEs) {
      celdaEs.push({ text: textoEs, fontSize: 8, lineHeight: 1.2 });
    }
    if (textoLang2) {
      celdaEn.push({ text: textoLang2, fontSize: 8, lineHeight: 1.2 });
    }
    
    tableBody.push([
      { stack: celdaEs.length ? celdaEs : [{ text: '' }], margin: [4, 4, 4, 4] },
      { stack: celdaEn.length ? celdaEn : [{ text: '' }], margin: [4, 4, 4, 4] }
    ]);
  }
  
  // Firmas
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
    
    // Aceptación (lugar, fecha y hora)
    if (bloqueFirmas.aceptacion !== false) {
      firmasContent.push(
        { text: '', margin: [0, 30, 0, 0] },
        { 
          text: 'LUGAR, FECHA Y HORA DE ACEPTACIÓN / ACCEPTANCE PLACE, DATE AND TIME:', 
          bold: true, 
          fontSize: 9, 
          alignment: 'center' 
        },
        { 
          text: '_____________________________________________________________', 
          fontSize: 9, 
          alignment: 'center',
          margin: [0, 15, 0, 0]
        }
      );
    }
  }
  
  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 50, 40, 50],
    
    header: function(currentPage, pageCount) {
      return {
        text: `Página ${currentPage} de ${pageCount}  |  ${paginaLang2} ${currentPage} ${deLang2} ${pageCount}`,
        alignment: 'right',
        fontSize: 7,
        color: '#555555',
        margin: [0, 20, 40, 0]
      };
    },
    
    footer: function(currentPage, pageCount) {
      return {
        text: iniciales,
        alignment: 'center',
        fontSize: 8,
        color: '#555555',
        margin: [0, 10, 0, 0]
      };
    },
    
    content: [
      {
        table: {
          headerRows: 0,
          widths: ['50%', '50%'],
          body: tableBody
        },
        layout: {
          hLineWidth: function(i, node) { return 0.3; },
          vLineWidth: function(i, node) { return (i === 1) ? 0.7 : 0.3; },
          hLineColor: function() { return '#cccccc'; },
          vLineColor: function() { return '#555555'; },
          paddingLeft: function() { return 5; },
          paddingRight: function() { return 5; },
          paddingTop: function() { return 4; },
          paddingBottom: function() { return 4; }
        }
      },
      ...firmasContent,
      {
        text: 'Hecho por Colmena 2026',
        alignment: 'center',
        fontSize: 7,
        color: '#555555',
        margin: [0, 40, 0, 0]
      }
    ],
    
    defaultStyle: {
      font: 'Roboto'
    }
  };
  
  // Usar download directo
  const pdfDoc = pdfMake.createPdf(docDefinition);
  
  // Nombre del archivo
  const nombreBase = opciones.nombre || 'OFERTA';
  const idiomaSufijo = lang2 === 'fr' ? '_FR' : '';
  const filename = `OFERTA_${nombreBase}${idiomaSufijo}.pdf`;
  
  pdfDoc.download(filename);
  return null;
  
  } catch (err) {
    console.error('Error generando PDF:', err);
    throw err;
  }
}

export default { generarPdfBlob };
