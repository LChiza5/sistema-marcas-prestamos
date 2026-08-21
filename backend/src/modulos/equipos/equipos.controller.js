import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { creado, error, exito } from '../../utils/respuesta.js';
import { validarRegistro, validarActualizacion } from './equipos.validaciones.js';
import { CARPETA_DESTINO } from './equipos.upload.js';
import * as modelo from './equipos.model.js';
import * as configuracionModelo from '../configuracion/configuracion.model.js';

const MB_POR_DEFECTO = 2;

/** Borra un archivo de la carpeta de imágenes de equipos, ignorando si ya no existe. */
async function eliminarArchivo(nombre) {
  if (!nombre) return;
  await unlink(path.join(CARPETA_DESTINO, nombre)).catch(() => {});
}

/** Obtiene el tamaño máximo permitido (en bytes) desde la configuración del sistema. */
async function obtenerLimiteBytes() {
  const parametro = await configuracionModelo.obtenerPorClave('tamano_max_archivo_mb');
  const mb = Number(parametro?.valor ?? MB_POR_DEFECTO);
  return { mb, bytes: mb * 1024 * 1024 };
}

/** Lista el inventario completo de equipos. */
export async function listar(req, res, next) {
  try {
    const equipos = await modelo.listar();
    return exito(res, equipos, 'Equipos obtenidos');
  } catch (err) {
    next(err);
  }
}

/** Registra un equipo nuevo en el inventario, con imagen opcional. Sólo el administrador/encargado. */
export async function registrar(req, res, next) {
  try {
    const errores = validarRegistro(req.body);
    if (errores.length > 0) {
      await eliminarArchivo(req.file?.filename);
      return error(res, 'Los datos enviados no son válidos', 400, errores);
    }

    const codigo = req.body.codigo.trim().toUpperCase();
    const descripcion = req.body.descripcion.trim();

    const existente = await modelo.buscarPorCodigo(codigo);
    if (existente) {
      await eliminarArchivo(req.file?.filename);
      return error(res, 'Ya existe un equipo registrado con ese código', 409);
    }

    if (req.file) {
      const { mb, bytes } = await obtenerLimiteBytes();
      if (req.file.size > bytes) {
        await eliminarArchivo(req.file.filename);
        return error(res, `La imagen no debe superar los ${mb} MB`, 400);
      }
    }

    const id = await modelo.insertar({ codigo, descripcion, imagen: req.file?.filename ?? null });
    return creado(res, { id, codigo, imagen: req.file?.filename ?? null }, 'Equipo registrado correctamente');
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

/** Reemplaza la imagen de un equipo existente. Sólo el administrador/encargado. */
export async function actualizarImagen(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return error(res, 'El identificador del equipo no es válido', 400);

    const equipo = await modelo.buscarPorId(id);
    if (!equipo) {
      await eliminarArchivo(req.file?.filename);
      return error(res, 'El equipo no existe', 404);
    }

    if (!req.file) return error(res, 'Debe adjuntar una imagen', 400);

    const { mb, bytes } = await obtenerLimiteBytes();
    if (req.file.size > bytes) {
      await eliminarArchivo(req.file.filename);
      return error(res, `La imagen no debe superar los ${mb} MB`, 400);
    }

    await modelo.actualizarImagen(id, req.file.filename);
    await eliminarArchivo(equipo.imagen); // ya se guardó la nueva; se borra la anterior para no dejar archivos huérfanos

    return exito(res, { imagen: req.file.filename }, 'Imagen actualizada correctamente');
  } catch (err) {
    next(err);
  }
}

/** Elimina un equipo del inventario (y su imagen asociada). Sólo el administrador/encargado. */
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
    await eliminarArchivo(equipo.imagen);

    return exito(res, null, 'Equipo eliminado correctamente');
  } catch (err) {
    next(err);
  }
}