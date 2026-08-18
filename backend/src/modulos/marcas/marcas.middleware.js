import { error } from '../../utils/respuesta.js';
import { obtenerIpCliente, ipPermitida } from '../../utils/red.js';
import * as configuracionModelo from '../configuracion/configuracion.model.js';

/**
 * Punto 10 — Validación de ubicación de red.
 * Compara la IP real de la solicitud (obtenida en el backend, nunca
 * enviada por el cliente) contra los rangos guardados en la tabla
 * configuracion (clave rangos_ip_permitidos).
 *
 * Si el administrador no ha configurado ningún rango, no se restringe
 * (se interpreta como "sin restricción configurada todavía").
 */
export async function validarRedPermitida(req, res, next) {
  try {
    const parametro = await configuracionModelo.obtenerPorClave('rangos_ip_permitidos');
    const rangos = (parametro?.valor ?? '')
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const ip = obtenerIpCliente(req);
    req.ipCliente = ip; // se reutiliza en el controlador para no calcularla dos veces

    if (!ipPermitida(ip, rangos)) {
      return error(res, 'No es posible realizar la marca desde la red actual.', 403);
    }

    next();
  } catch (err) {
    next(err);
  }
}
