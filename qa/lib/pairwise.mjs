/**
 * Generador de cobertura por pares (all-pairs / pairwise).
 *
 * Con 39 interruptores booleanos el espacio exhaustivo es 2^39 ≈ 5.5×10^11.
 * La cobertura por pares garantiza que CADA par de estados de CADA par de
 * interruptores aparezca al menos una vez, y lo logra en decenas de casos.
 *
 * Es donde vive la mayoría de los defectos de interacción: un bloque que
 * desaparece en silencio cuando otro se enciende no necesita 39 condiciones
 * simultáneas para manifestarse, necesita dos.
 *
 * Algoritmo: greedy horizontal (estilo IPOG). No busca el mínimo teórico
 * —eso es NP-difícil— sino un conjunto pequeño y COMPLETO, verificado al final.
 */

/**
 * @param {string[]} ids          interruptores a cubrir
 * @param {Function} esLegal      (estado) => boolean; descarta combinaciones ilegales
 * @param {Object}   defaults     estado base para los interruptores no fijados
 * @returns {Object[]}            lista de estados
 */
export function generarPares(ids, esLegal, defaults = {}) {
  // Todos los pares que hay que cubrir: (i, j, vi, vj)
  const pendientes = new Set();
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      for (const vi of [true, false]) {
        for (const vj of [true, false]) {
          pendientes.add(`${i}|${j}|${vi ? 1 : 0}|${vj ? 1 : 0}`);
        }
      }
    }
  }

  const casos = [];
  let guardia = 0;

  while (pendientes.size > 0 && guardia++ < 5000) {
    // Semilla: el primer par pendiente.
    //
    // Ojo: la semilla NO parte de los defaults. Si lo hiciera, un par legal como
    // (precio_compuesto=true, inventario=true) se declararía irrealizable sólo
    // porque ad_corpus viene encendido por default y choca con precio_compuesto.
    // Se parte de todo apagado y se dejan crecer los interruptores libres; así
    // "irrealizable" significa lo que debe significar: prohibido por RELACIONES,
    // no incómodo para los defaults.
    const [si, sj, svi, svj] = [...pendientes][0].split('|');
    const fijos = new Set([ids[+si], ids[+sj]]);
    const estado = Object.fromEntries(ids.map(id => [id, false]));
    estado[ids[+si]] = svi === '1';
    estado[ids[+sj]] = svj === '1';

    if (!esLegal(estado)) {
      // Par irrealizable bajo las restricciones: no es un hueco, es una regla.
      pendientes.delete(`${si}|${sj}|${svi}|${svj}`);
      continue;
    }

    // Crecer el caso: por cada interruptor libre, elegir el valor que cubra más
    // pares pendientes sin volver ilegal el estado.
    for (let k = 0; k < ids.length; k++) {
      if (fijos.has(ids[k])) continue;
      let mejorValor = estado[ids[k]];
      let mejorGanancia = -1;

      // Orden de prueba: primero el valor por default. Con ganancia empatada gana
      // el default, así los casos generados se parecen a configuraciones reales
      // y no a esquinas artificiales del espacio.
      const porDefault = defaults[ids[k]] ?? false;
      for (const v of [porDefault, !porDefault]) {
        const tentativo = { ...estado, [ids[k]]: v };
        if (!esLegal(tentativo)) continue;
        const ganancia = contarNuevos(tentativo, ids, pendientes);
        if (ganancia > mejorGanancia) {
          mejorGanancia = ganancia;
          mejorValor = v;
        }
      }
      estado[ids[k]] = mejorValor;
    }

    if (!esLegal(estado)) continue;

    // Marcar como cubiertos todos los pares que este caso realiza
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        pendientes.delete(`${i}|${j}|${estado[ids[i]] ? 1 : 0}|${estado[ids[j]] ? 1 : 0}`);
      }
    }
    casos.push(estado);
  }

  return casos;
}

function contarNuevos(estado, ids, pendientes) {
  let n = 0;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (pendientes.has(`${i}|${j}|${estado[ids[i]] ? 1 : 0}|${estado[ids[j]] ? 1 : 0}`)) n++;
    }
  }
  return n;
}

/**
 * Verifica que el conjunto generado cubre de verdad todos los pares alcanzables.
 * Un generador que se cree completo y no lo esté es peor que no tenerlo.
 */
export function verificarCobertura(casos, ids, esLegal) {
  let alcanzables = 0, cubiertos = 0;
  const vistos = new Set();
  for (const c of casos) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        vistos.add(`${i}|${j}|${c[ids[i]] ? 1 : 0}|${c[ids[j]] ? 1 : 0}`);
      }
    }
  }
  const faltantes = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      for (const vi of [true, false]) {
        for (const vj of [true, false]) {
          const probe = {};
          for (const id of ids) probe[id] = false;
          probe[ids[i]] = vi; probe[ids[j]] = vj;
          if (!esLegal(probe)) continue;
          alcanzables++;
          const clave = `${i}|${j}|${vi ? 1 : 0}|${vj ? 1 : 0}`;
          if (vistos.has(clave)) cubiertos++;
          else faltantes.push(`${ids[i]}=${vi} & ${ids[j]}=${vj}`);
        }
      }
    }
  }
  return { alcanzables, cubiertos, faltantes };
}
