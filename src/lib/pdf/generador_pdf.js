/**
 * OfertaGen — Generador PDF Bilingüe
 * 
 * Genera PDF con tabla lado a lado (ES | EN/FR)
 * usando @react-pdf/renderer.
 * 
 * Sprint PDF — Abril 2026
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    fontSize: 8,
    color: '#555555',
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
  },
  colEs: {
    width: '50%',
    padding: 8,
    borderRightWidth: 0.5,
    borderRightColor: '#999999',
    borderRightStyle: 'solid',
  },
  colEn: {
    width: '50%',
    padding: 8,
    color: '#444444',
  },
  titulo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 4,
    textDecoration: 'underline',
  },
  texto: {
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  negrita: {
    fontFamily: 'Helvetica-Bold',
  },
  firmasContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  firma: {
    alignItems: 'center',
    width: 200,
  },
  firmaLinea: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    width: 150,
    marginBottom: 5,
  },
  firmaNombre: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'center',
  },
  firmaRol: {
    fontSize: 8,
    color: '#555555',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 7,
    color: '#555555',
  },
  inicialesFooter: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#555555',
  },
});

// ============================================================
// HELPERS
// ============================================================

/**
 * Parsea texto y separa negritas marcadas con **texto**.
 */
function parseTexto(texto) {
  if (!texto) return null;
  
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  
  return partes.map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <Text key={i} style={styles.negrita}>{parte.slice(2, -2)}</Text>;
    }
    return <Text key={i}>{parte}</Text>;
  });
}

/**
 * Extrae iniciales de un nombre.
 */
function extraerIniciales(nombre) {
  if (!nombre) return '';
  return nombre.split(/\s+/).map(p => p.charAt(0)).join('');
}

// ============================================================
// COMPONENTE PDF
// ============================================================

function OfertaPDF({ bloques, meta, opciones = {} }) {
  const { idiomaSecundario = 'en' } = opciones;
  const lang2 = idiomaSecundario;
  
  // Separar bloques normales de firmas
  const bloquesNormales = bloques.filter(b => b.tipo !== 'firmas');
  const bloqueFirmas = bloques.find(b => b.tipo === 'firmas');
  
  // Generar iniciales para footer
  const iniciales = bloqueFirmas?.firmas?.map(f => {
    const ini = extraerIniciales(f.nombre);
    return `${ini} _____`;
  }).join('          ') || '';
  
  // Paginación según idioma
  const paginaLang2 = lang2 === 'fr' ? 'Page' : 'Page';
  const deLang2 = lang2 === 'fr' ? 'sur' : 'of';
  
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header con paginación */}
        <View style={styles.header} fixed>
          <Text render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages} | ${paginaLang2} ${pageNumber} ${deLang2} ${totalPages}`
          )} />
        </View>
        
        {/* Tabla de contenido */}
        <View style={styles.table}>
          {bloquesNormales.map((bloque, i) => {
            const tituloEs = bloque.titulo?.es || bloque.t?.es || '';
            const tituloLang2 = bloque.titulo?.[lang2] || bloque.titulo?.en || bloque.t?.[lang2] || bloque.t?.en || '';
            const textoEs = bloque.es || '';
            const textoLang2 = bloque[lang2] || bloque.en || '';
            const num = bloque.numero || bloque.n || '';
            
            return (
              <View key={i} style={styles.tableRow} wrap={false}>
                <View style={styles.colEs}>
                  {tituloEs && (
                    <Text style={styles.titulo}>
                      {num ? `${num}.- ` : ''}{tituloEs}
                    </Text>
                  )}
                  <Text style={styles.texto}>{textoEs}</Text>
                </View>
                <View style={styles.colEn}>
                  {tituloLang2 && (
                    <Text style={styles.titulo}>
                      {num ? `${num}.- ` : ''}{tituloLang2}
                    </Text>
                  )}
                  <Text style={styles.texto}>{textoLang2}</Text>
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Firmas */}
        {bloqueFirmas?.firmas && (
          <View style={styles.firmasContainer}>
            {bloqueFirmas.firmas.map((firma, i) => (
              <View key={i} style={styles.firma}>
                <View style={styles.firmaLinea} />
                <Text style={styles.firmaNombre}>{firma.nombre}</Text>
                <Text style={styles.firmaRol}>{firma.rol || firma.rol_es}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Footer con iniciales */}
        <Text style={styles.inicialesFooter} fixed>
          {iniciales}
        </Text>
      </Page>
    </Document>
  );
}

// ============================================================
// API PÚBLICA
// ============================================================

/**
 * Genera PDF y devuelve como Blob.
 */
export async function generarPdfBlob(bloques, meta = {}, opciones = {}) {
  const doc = <OfertaPDF bloques={bloques} meta={meta} opciones={opciones} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

export default { generarPdfBlob };
