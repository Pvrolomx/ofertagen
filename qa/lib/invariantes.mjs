/**
 * Invariantes del documento.
 *
 * La diferencia con un test por caso: una assertion dice "en ESTA combinación
 * el texto sale bien". Un invariante dice "en CUALQUIER combinación legal, esto
 * nunca puede pasar". Lo primero escala linealmente con el esfuerzo humano; lo
 * segundo escala con el número de combinaciones que el generador produzca.
 *
 * Cada invariante lleva `porque` con el defecto real que lo motiva. Un invariante
 * sin historia detrás suele ser una opinión disfrazada de regla.
 */

import { PENDIENTE_MARK } from '../../src/lib/plantillas/ensamblador.js';

/** Palabras que delatan que algo se rompió al interpolar. */
const RE_FUGAS = /\bundefined\b|\bNaN\b|\[object Object\]|\$\{/;

/** Marcadores de fideicomiso: no deben existir en una operación entre mexicanos. */
const RE_FIDEICOMISO = /fideicomis\w*|fiduciari\w*|trust\b|trustee/i;

/** Condóminos como sujetos/cuotas — distinto de "régimen de condominio", que sí puede citarse. */
const RE_CONDOMINOS = /cond[óo]min[oa]s\b|Homeowner['’]s Administration|Administraci[óo]n de Cond[óo]minos/i;

/** Referencias cruzadas por número de cláusula: se rompen en cuanto un bloque se apaga. */
const RE_REF_NUMERICA = /punto n[úu]mero \d|point number \d|cl[áa]usula n[úu]mero \d/i;

/**
 * Sub-bloques que forman la serie de incisos de las CONDICIONES INDISPENSABLES (§15).
 * Es la misma lista que usa renderizarBloques() para decidir a quién le toca letra.
 *
 * Importa distinguirla: §4 tiene su PROPIA serie A)/B) para las formas de pago
 * (escrow y saldo). Son dos numeraciones independientes, y mezclarlas produce
 * un falso positivo — lo comprobé al escribir este archivo.
 */
const SERIE_CONDICIONES = new Set([
  'inspeccion', 'doc_fideicomiso', 'gravamen_por_cancelar', 'financiamiento',
  'inventario', 'arrendamientos', 'zona_federal', 'litigios_pendientes',
  'empleados_condicion', 'condicion_libre',
]);

/** Busca un patrón bloque por bloque y devuelve dónde apareció. Sin atribución no hay diagnóstico. */
function buscarEnBloques(bloques, re) {
  for (const b of bloques) {
    for (const [idioma, txt] of [['es', b.es], ['en', b.en]]) {
      const m = (txt || '').match(re);
      if (m) return { bloque: b.id, idioma, match: m[0], ctx: contexto(txt, m.index) };
    }
  }
  return null;
}

export const INVARIANTES = [
  {
    id: 'render_sin_excepcion',
    descripcion: 'Toda combinación legal se renderiza sin lanzar excepción',
    porque: 'Un render que truena en una combinación legal es un documento que no se puede emitir. Hoy nada lo garantiza fuera de los casos escritos a mano.',
    check: ({ error }) => ({ ok: !error, detalle: error ? String(error).slice(0, 160) : '' }),
  },
  {
    id: 'sin_fugas_de_plantilla',
    descripcion: 'El texto no contiene undefined / NaN / [object Object] / ${',
    porque: 'Son las fugas clásicas de interpolación. Salen a firma sin que nadie las note porque el resto de la cláusula se ve bien.',
    check: ({ texto }) => {
      const m = texto.match(RE_FUGAS);
      return { ok: !m, detalle: m ? `encontrado: "${m[0]}" · …${contexto(texto, m.index)}…` : '' };
    },
  },
  {
    id: 'sin_marcador_pendiente',
    descripcion: 'Con datos completos no queda ningún ⟦Pendiente⟧',
    porque: 'El marcador existe para señalar campos faltantes. Si aparece con la fixture completa, el bloque está pidiendo un campo que nadie sabe que debe llenar.',
    check: ({ texto }) => ({
      ok: !texto.includes(PENDIENTE_MARK),
      detalle: texto.includes(PENDIENTE_MARK) ? `…${contexto(texto, texto.indexOf(PENDIENTE_MARK))}…` : '',
    }),
  },
  {
    id: 'sin_fideicomiso_entre_mexicanos',
    descripcion: 'Operación entre mexicanos: cero menciones de fideicomiso o trust',
    porque: 'Es la generalización del defecto que motivó test_modalidad.mjs — la matriz de modalidad era correcta pero vivía en una rama, y toda oferta con precio compuesto la perdía EN SILENCIO. Ese test cubre un caso; esto cubre todos.',
    aplica: ({ datos }) => datos.partes.ofertante.nacionalidad === 'mexicano'
                        && datos.partes.propietario.nacionalidad === 'mexicano',
    check: ({ bloques }) => {
      const h = buscarEnBloques(bloques, RE_FIDEICOMISO);
      return { ok: !h, detalle: h ? `[${h.bloque}.${h.idioma}] "${h.match}" · …${h.ctx}…` : '' };
    },
  },
  {
    id: 'sin_condominos_fuera_de_regimen',
    descripcion: 'Inmueble fuera de régimen: no se mencionan condóminos ni sus cuotas',
    porque: 'Defecto 12 del análisis del 5-sep: obligaciones_vendedor pedía carta de no adeudo de la Administración de Condóminos y prorrateaba cuotas aunque es_condominio fuera false. Se corrigió en ese bloque; el invariante impide que reaparezca en otro.',
    aplica: ({ datos }) => datos.campos.inmueble.es_condominio === false,
    check: ({ bloques }) => {
      const h = buscarEnBloques(bloques, RE_CONDOMINOS);
      return { ok: !h, detalle: h ? `[${h.bloque}.${h.idioma}] "${h.match}" · …${h.ctx}…` : '' };
    },
  },
  {
    id: 'sin_referencias_numericas_a_clausulas',
    descripcion: 'Ninguna cláusula se refiere a otra por número',
    porque: 'La oferta de marzo decía "dentro del TÉRMINO DE VIGENCIA establecido en el punto número 6" cuando la vigencia es el punto 5. Se arregló quitando el número; el invariante lo mantiene arreglado cuando se adicione el bloque 58.',
    check: ({ texto }) => {
      const m = texto.match(RE_REF_NUMERICA);
      return { ok: !m, detalle: m ? `"${m[0]}" · …${contexto(texto, m.index)}…` : '' };
    },
  },
  {
    id: 'incisos_consecutivos',
    descripcion: 'Los incisos de condiciones indispensables son A, B, C… sin huecos ni repetidos',
    porque: 'La renumeración es dinámica según qué condiciones estén activas. Un hueco o un duplicado rompe las referencias del documento y delata que un bloque se coló o se perdió.',
    check: ({ bloques }) => {
      const letras = bloques
        .filter(b => SERIE_CONDICIONES.has(b.id))
        .map(b => (b.es || '').match(/^([A-Z])\) /))
        .filter(Boolean).map(m => m[1]);
      const esperado = letras.map((_, i) => String.fromCharCode(65 + i));
      const ok = letras.join('') === esperado.join('');
      return { ok, detalle: ok ? '' : `serie §15 emitida: ${letras.join('') || '(ninguna)'}` };
    },
  },
  {
    id: 'clausulas_numeradas_crecientes',
    descripcion: 'Los números de cláusula son estrictamente crecientes y sin duplicados',
    porque: 'Dos cláusulas con el mismo número, o un salto, es el síntoma visible de un bloque duplicado o de una numeración hardcodeada que dejó de corresponder.',
    check: ({ bloques }) => {
      const nums = bloques.map(b => b.numero).filter(n => typeof n === 'number');
      for (let i = 1; i < nums.length; i++) {
        if (nums[i] <= nums[i - 1]) {
          return { ok: false, detalle: `${nums[i - 1]} → ${nums[i]}` };
        }
      }
      return { ok: true, detalle: '' };
    },
  },
  {
    id: 'paridad_es_en',
    descripcion: 'Todo bloque que emite español emite también inglés',
    porque: 'La versión en inglés es cortesía, pero es la que lee el cliente extranjero. Un bloque que pierde su traducción en cierta combinación desaparece para él sin que nadie lo note.',
    check: ({ bloques }) => {
      const huerfanos = bloques
        .filter(b => (b.es || '').trim().length > 0 && (b.en || '').trim().length === 0)
        .map(b => b.id);
      return { ok: huerfanos.length === 0, detalle: huerfanos.join(', ') };
    },
  },
];

function contexto(texto, idx, radio = 45) {
  return texto.slice(Math.max(0, idx - radio), idx + radio).replace(/\s+/g, ' ');
}
