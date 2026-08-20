import { creado, error, exito } from '../../utils/respuesta.js';
import { validarRegistro, validarActualizacion } from './equipos.validaciones.js';
import * as modelo from './equipos.model.js';

/** Lista el inventario completo de equipos. */
export async function listar(req, res, next) {
  try {
    const equipos = await modelo.listar();
    return exito(res, equipos, 'Equipos obtenidos');
  } catch (err) {
    next(err);
  }
}

/** Registra un equipo nuevo en el inventario. Sólo el administrador/encargado. */
export async function registrar(req, res, next) {
  try {
    const errores = validarRegistro(req.body);
    if (errores.length > 0) return error(res, 'Los datos enviados no son válidos', 400, errores);

    const codigo = req.body.codigo.trim().toUpperCase();
    const descripcion = req.body.descripcion.trim();

    const existente = await modelo.buscarPorCodigo(codigo);
    if (existente) return error(res, 'Ya existe un equipo registrado con ese código', 409);

    const id = await modelo.insertar({ codigo, descripcion });
    return creado(res, { id, codigo }, 'Equipo registrado correctamente');
  } catch (err) {
    next(err);
  }
}

/** Modifica la descripción y el estado de un equipo. Sólo el administrador/encargado. */
export async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return error(res, 'El identificador del equipo no es válido', 400);

    const equipo = await modelo.buscarPorId(id);
    if (!equipo) return error(res, 'El equipo no existe', 404);

    const errores = validarActualizacion(req.body);
    if (errores.length > 0) return error(res, 'Los datos enviados no son válidos', 400, errores);

    await modelo.actualizar(id, {
      descripcion: req.body.descripcion.trim(),
      estado: req.body.estado,
    });

    return exito(res, null, 'Equipo actualizado correctamente');
  } catch (err) {
    next(err);
  }
}

/** Elimina un equipo del inventario. Sólo el administrador/encargado. */
export async function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return error(res, 'El identificador del equipo no es válido', 400);

    const equipo = await modelo.buscarPorId(id);
    if (!equipo) return error(res, 'El equipo no existe', 404);

    const enPrestamo = await modelo.tienePrestamosPendientes(id);
    if (enPrestamo) {
      return error(res, 'No se puede eliminar un equipo con préstamos pendientes de devolución', 409);
    }

    await modelo.eliminar(id);
    return exito(res, null, 'Equipo eliminado correctamente');
  } catch (err) {
    next(err);
  }
}