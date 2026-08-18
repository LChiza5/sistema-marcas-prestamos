import { error, exito } from '../../utils/respuesta.js';
import { validarValorConfiguracion } from './configuracion.validaciones.js';
import * as modelo from './configuracion.model.js';

/** Lista los parámetros de configuración del sistema. */
export async function listar(req, res, next) {
  try {
    const parametros = await modelo.listar();
    return exito(res, parametros, 'Configuración obtenida');
  } catch (err) {
    next(err);
  }
}

/** Modifica el valor de un parámetro. Sólo el administrador puede hacerlo. */
export async function actualizar(req, res, next) {
  try {
    const { clave } = req.params;
    const { valor } = req.body;

    const existente = await modelo.obtenerPorClave(clave);
    if (!existente) return error(res, 'El parámetro de configuración indicado no existe', 404);

    const errores = validarValorConfiguracion(clave, valor);
    if (errores.length > 0) return error(res, 'Los datos enviados no son válidos', 400, errores);

    await modelo.actualizar(clave, String(valor).trim());
    return exito(res, { clave, valor: String(valor).trim() }, 'Parámetro actualizado correctamente');
  } catch (err) {
    next(err);
  }
}
