import fs from 'fs';
import path from 'path';

import PLANTILLA_OFERTA_COMPRA from './src/lib/plantillas/oferta_compra.js';
import { ensamblarContexto, renderizarBloques } from './src/lib/plantillas/ensamblador.js';
import { generarDocx } from './src/lib/docx/generador.js';

const datosOferta = {
  idiomaSecundario: null,
  partes: {
    ofertante: {
      tipoPersona: 'fisica',
      nacionalidad: 'mexicana',
      domicilio: '[DOMICILIO CONVENCIONAL DEL COMPRADOR]',
      celular: '[TELÉFONO / CELULAR]',
      email: '[CORREO ELECTRÓNICO]',
      personas: [
        {
          nombre: '[NOMBRE DEL COMPRADOR]',
          genero: 'M',
          estado_civil: 'soltero',
          ocupacion: 'comerciante / inversionista'
        }
      ]
    },
    propietario: {
      tipoPersona: 'fisica',
      nacionalidad: 'mexicana',
      domicilio: 'Calle Valle de Aosta número 58, Fraccionamiento Valle Dorado, Municipio de Bahía de Banderas, Nayarit, C.P. 63735',
      celular: '[TELÉFONO DE LA PROPIETARIA]',
      email: '[EMAIL DE LA PROPIETARIA]',
      titulo_vendedor: 'propietario',
      personas: [
        {
          nombre: 'Alicia Nacinovich Cordova',
          genero: 'F',
          estado_civil: 'soltera',
          ocupacion: 'comerciante'
        }
      ]
    }
  },
  bloques: {
    precio_compuesto: true,
    mobiliario_separado: true,
    pacto_no_incluir_muebles: true,
    escrow: true,
    inspeccion: true,
    doc_fideicomiso: false,
    inventario: true,
    obligaciones_vendedor: true,
    obligaciones_vendedor_agua: true,
    derecho_deduccion: false,
    condicion_uso: true,
    condiciones_remocion: true,
    comision: false,
    aviso_fraude: true
  },
  campos: {
    inmueble: {
      descripcion_corta: 'Finca urbana y local comercial marcada con el número exterior 58 (cincuenta y ocho) de la Calle Valle de Aosta, edificada sobre el Lote 5 (cinco) de la Manzana 42 (cuarenta y dos)',
      ubicacion_completa: 'en el Fraccionamiento Valle Dorado, Localidad Mezcales, Municipio de Bahía de Banderas, Estado de Nayarit, C.P. 63735',
      nivel_torre: 'dos niveles (planta baja comercial y planta alta habitacional)',
      descripcion_interior: 'planta baja con local comercial (tienda de abarrotes), medio baño, jardín frontal, patio de servicio y cubo de escaleras; planta alta habitacional con sala, comedor, cocina, dos recámaras, baño completo y área de lavado',
      superficie_m2: 120.63,
      superficie_letras: 'ciento veinte metros sesenta y tres decímetros cuadrados de construcción sobre un terreno de ciento trece metros setenta y cinco decímetros cuadrados',
      indiviso: 'N/A (Finca unifamiliar privada)',
      tiene_uso_exclusivo: false,
      notas_uso_exclusivo: '',
      clave_catastral: '20-023-02-050-005-000',
      es_condominio: false
    },
    antecedente: {
      fecha_escritura: '2004-02-13',
      numero_escritura: '29808',
      notario_anterior: 'Lic. José Luis Bejar Fonseca',
      numero_notaria_anterior: '13',
      ciudad_notaria_anterior: 'Tepic, Nayarit',
      estado_registro: 'nayarit',
      tipo_registro: 'folio_real',
      folio_real: '74819',
      libro_rpp: '196',
      seccion_rpp: 'I',
      serie_rpp: 'A',
      partida_rpp: '35',
      cuenta_predial: 'U013260'
    },
    precio: {
      precio_total: 3300000,
      precio_inmueble: 2800000,
      precio_muebles: 500000,
      moneda: 'MXN',
      deposito_escrow: 330000,
      dias_deposito: 3,
      dias_saldo: 5,
      anticipo_gastos: '0'
    },
    muebles: {
      objeto_es: 'el negocio mercantil en operación denominado "Abarrotes La Esperanza", incluyendo anaqueles, refrigeradores, mobiliario, equipo comercial, inventario de mercancías en existencia y acreditamiento comercial',
      convenio_es: 'Contrato Privado de Compraventa de Negocio Mercantil, Inventario y Bienes Muebles'
    },
    escrow: {
      empresa_escrow: 'SECURE TITLE LATIN AMERICA INC',
      honorarios_escrow: 750
    },
    fechas: {
      fecha_presentacion: '2026-09-08',
      ciudad_presentacion: 'Bucerías, Bahía de Banderas, Nayarit',
      fecha_vigencia: '2026-09-15',
      hora_vigencia: '18:00 horas',
      fecha_formalizacion: 'cualquier día hábil dentro de las primeras dos semanas del mes de Octubre de 2026',
      fecha_extension: 'cualquier día hábil dentro de las primeras dos semanas del mes de Noviembre de 2026'
    },
    notario: {
      notario_seleccion: 'buc_29s',
      nombre_notario: 'Lic. Adán Gilberto Meza Espinosa (Notario Suplente en funciones, Notaría Titular a cargo del Lic. Adán Meza Barajas)',
      numero_notaria: '29',
      ciudad_notaria: 'Bucerías, Municipio de Bahía de Banderas, Nayarit'
    },
    jurisdiccion: {
      ciudad_jurisdiccion: 'Bucerías, Municipio de Bahía de Banderas, Nayarit, México'
    },
    condiciones_plazos: {
      inspeccion_inspeccionar_dias: 5,
      inspeccion_inspeccionar_tipo: 'habiles',
      inspeccion_revisar_dias: 3,
      inspeccion_revisar_tipo: 'habiles',
      inventario_entregar_dias: 5,
      inventario_entregar_tipo: 'habiles',
      inventario_revisar_dias: 3,
      inventario_revisar_tipo: 'habiles'
    },
    inventario: {
      exclusiones: 'Artículos personales de la vendedora, ropa y enseres domésticos de uso estrictamente privado'
    }
  }
};

async function main() {
  console.log('1. Ensamblando contexto con motor puro de OfertaGen...');
  const ctx = ensamblarContexto(PLANTILLA_OFERTA_COMPRA, datosOferta);

  console.log('2. Renderizando bloques nativos...');
  const bloques = renderizarBloques(PLANTILLA_OFERTA_COMPRA, ctx);

  const outputDir = 'D:/DITS/MIRAMONTES/Valle Dorado/Oferta';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generar DOCX
  console.log('3. Generando DOCX solo español con motor OfertaGen...');
  const bufferDocx = await generarDocx(bloques, PLANTILLA_OFERTA_COMPRA.meta, {
    idiomaSecundario: null,
    datos: datosOferta,
    firmasEnLinea: true
  });

  const docxPath = path.join(outputDir, 'OFERTA_OFERTAGEN_MOTOR_PURO.docx');
  fs.writeFileSync(docxPath, bufferDocx);
  console.log('DOCX_OK: ' + docxPath);

  // Generar Markdown puro
  let mdContent = '# OFERTA DE COMPRAVENTA (MOTOR PURO OFERTAGEN)\n';
  mdContent += '## Inmueble y Negocio Comercial · Valle de Aosta #58, Valle Dorado\n\n';
  mdContent += '> **Generador:** OfertaGen v4+ (Motor Nativo Post-Fix CC)\n';
  mdContent += '> **Modalidad:** Mexicano a Mexicano (Dominio Pleno)\n';
  mdContent += '> **Precio Total:** $3,300,000.00 M.N. ($2,800,000 Inmueble + $500,000 Negocio)\n\n---\n\n';

  for (const b of bloques) {
    const num = b.numero ? `CLÁUSULA ${b.numero}: ` : '';
    const tit = b.titulo?.es || b.titulo_es || b.etiqueta || b.id;
    mdContent += `### ${num}${tit}\n\n`;
    mdContent += `${b.es}\n\n---\n\n`;
  }

  const mdPath = path.join(outputDir, 'OFERTA_OFERTAGEN_MOTOR_PURO.md');
  fs.writeFileSync(mdPath, mdContent);
  console.log('MD_OK: ' + mdPath);
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
