import crypto from 'node:crypto';
import { creado, error, exito } from '../../utils/respuesta.js';
import { validarRegistro, validarActualizacion } from './dispositivos.validaciones.js';
import * as modelo from './dispositivos.model.js';

const NOMBRE_COOKIE = 'id_dispositivo';
const MAX_EDAD_COOKIE_MS = 5 * 365 * 24 * 60 * 60 * 1000; // 5 años

/** Opciones de la cookie que identifica al dispositivo en el navegador. */
function opcionesCookieDispositivo() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_EDAD_COOKIE_MS,
  };
}

/** Lista los dispositivos del usuario en sesión. */
export async function listar(req, res, next) {
  try {
    const dispositivos = await modelo.listarPorUsuario(req.session.usuario.id);
    return exito(res, dispositivos, 'Dispositivos obtenidos');
  } catch (err) {
    next(err);
  }
}

/**
 * Registra un dispositivo nuevo para el usuario en sesión.
 * El identificador NO lo envía el cliente: lo genera el servidor
 * (no se usa dirección MAC porque el navegador no la expone) y se
 * guarda también en una cookie httpOnly para reconocer el dispositivo
 * en solicitudes futuras (por ejemplo, al registrar una marca).
 */
export async function registrar(req, res, next) {
  try {
    const errores = validarRegistro(req.body);
    if (errores.length > 0) return error(res, 'Los datos enviados no son válidos', 400, errores);

    const identificador = crypto.randomUUID();
    const id = await modelo.insertar({
      identificador,
      nombre: req.body.nombre.trim(),
      descripcion: req.body.descripcion?.trim(),
      idUsuario: req.session.usuario.id,
    });

    res.cookie(NOMBRE_COOKIE, identificador, opcionesCookieDispositivo());

    return creado(res, { id, identificador }, 'Dispositivo registrado correctamente');
  } catch (err) {
    next(err);
  }
}

/** Modifica nombre, descripción o estado de un dispositivo propio. */
export async function modificar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return error(res, 'El identificador del dispositivo no es válido', 400);

    const dispositivo = await modelo.buscarPorId(id);
    if (!dispositivo) return error(res, 'El dispositivo no existe', 404);
    if (dispositivo.id_usuario !== req.session.usuario.id) {
      return error(res, 'No cuenta con permisos para modificar este dispositivo', 403);
    }

    const errores = validarActualizacion(req.body);
    if (errores.length > 0) return error(res, 'Los datos enviados no son válidos', 400, errores);

    await modelo.actualizar(id, {
      nombre: req.body.nombre.trim(),
      descripcion: req.body.descripcion?.trim(),
      estado: req.body.estado,
    });

    return exito(res, null, 'Dispositivo actualizado correctamente');
  } catch (err) {
    next(err);
  }
}

/** Elimina un dispositivo propio. */
export async function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return error(res, 'El identificador del dispositivo no es válido', 400);

    const dispositivo = await modelo.buscarPorId(id);
    if (!dispositivo) return error(res, 'El dispositivo no existe', 404);
    if (dispositivo.id_usuario !== req.session.usuario.id) {
      return error(res, 'No cuenta con permisos para eliminar este dispositivo', 403);
    }

    await modelo.eliminar(id);
    return exito(res, null, 'Dispositivo eliminado correctamente');
  } catch (err) {
    next(err);
  }
}
