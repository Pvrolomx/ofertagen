/**
 * OfertaGen Core — Motor Lingüístico
 * 
 * Punto de entrada único para los tres módulos del motor core.
 * Estos módulos son independientes del tipo de contrato.
 * 
 * import { generarContextoParte, bloquePrecio, fechaBilingue } from './core';
 */

export {
  calcularClave,
  formatearNombres,
  generarContextoParte,
  registrarRol,
  registrarGramatica,
  rolesDisponibles,
  resolver,
} from './concordancia.js';

export {
  montoALetras,
  montoFormateado,
  bloquePrecio,
  registrarMoneda,
} from './num2words.js';

export {
  fechaEs,
  fechaEn,
  fechaBilingue,
  plazo,
  rangoDescriptivo,
  vencimiento,
} from './fechas.js';
