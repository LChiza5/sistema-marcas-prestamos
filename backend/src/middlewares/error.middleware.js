import { error } from '../utils/respuesta.js';

/** Ruta no encontrada. */
export function noEncontrado(req, res) {
  return error(res, 'El recurso solicitado no existe', 404);
}

/**
 * Manejo centralizado de errores.
 * El detalle técnico se registra en el servidor; al cliente sólo se le envía
 * un mensaje genérico para no revelar información de la base de datos.
 */
export function manejadorErrores(err, req, res, next) {
  console.error('[ERROR]', err);
  return error(res, 'Ocurrió un error al procesar la solicitud', 500);
}
