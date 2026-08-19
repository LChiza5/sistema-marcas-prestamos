import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { error, exito } from '../../utils/respuesta.js';
import {
  validarPerfil,
  validarCambioPassword,
  validarSolicitudRecuperacion,
  validarRestablecimiento,
} from './usuarios.validaciones.js';
import * as modelo from './usuarios.model.js';

const RONDAS_HASH = 10;
const MINUTOS_EXPIRACION_TOKEN = 30;

/** Punto 4 — Devuelve los datos del usuario en sesión. */
export async function obtenerPerfil(req, res, next) {
  try {
    const perfil = await modelo.obtenerPerfil(req.session.usuario.id);

    if (!perfil) return error(res, 'El usuario no existe', 404);

    const datos = {
      id: perfil.id,
      nombreCompleto: perfil.nombre_completo,
      fechaNacimiento: perfil.fecha_nacimiento,
      correo: perfil.correo,
      usuario: perfil.usuario,
      idDepartamento: perfil.id_departamento,
      departamento: perfil.departamento,
    };

    return exito(res, datos, 'Perfil obtenido correctamente');
  } catch (err) {
    next(err);
  }
}

/** Punto 4 — Modifica nombre, fecha de nacimiento y departamento. */
export async function actualizarPerfil(req, res, next) {
  try {
    const errores = validarPerfil(req.body);

    if (errores.length > 0) {
      return error(
        res,
        'Los datos enviados no son válidos',
        400,
        errores
      );
    }

    const idDepartamento = Number(req.body.idDepartamento);

    if (!(await modelo.existeDepartamento(idDepartamento))) {
      return error(
        res,
        'El departamento o carrera seleccionado no existe',
        400
      );
    }

    await modelo.actualizarPerfil(
      req.session.usuario.id,
      {
        nombreCompleto: req.body.nombreCompleto.trim(),
        fechaNacimiento: req.body.fechaNacimiento,
        idDepartamento,
      }
    );

    req.session.usuario.nombreCompleto =
      req.body.nombreCompleto.trim();

    return exito(
      res,
      null,
      'Perfil actualizado correctamente'
    );
  } catch (err) {
    next(err);
  }
}

/** Punto 5 — Cambia la contraseña del usuario en sesión. */
export async function cambiarPassword(req, res, next) {
  try {
    const errores = validarCambioPassword(req.body);

    if (errores.length > 0) {
      return error(
        res,
        'Los datos enviados no son válidos',
        400,
        errores
      );
    }

    const registro = await modelo.obtenerPassword(
      req.session.usuario.id
    );

    if (!registro) {
      return error(res, 'El usuario no existe', 404);
    }

    const passwordValida = await bcrypt.compare(
      req.body.passwordActual,
      registro.password_hash
    );

    if (!passwordValida) {
      return error(
        res,
        'La contraseña actual es incorrecta',
        401
      );
    }

    const passwordHash = await bcrypt.hash(
      req.body.passwordNueva,
      RONDAS_HASH
    );

    await modelo.actualizarPassword(
      req.session.usuario.id,
      passwordHash
    );

    return exito(
      res,
      null,
      'Contraseña actualizada correctamente'
    );
  } catch (err) {
    next(err);
  }
}

/** Punto 6 — Genera un token temporal para recuperar la contraseña. */
export async function solicitarRecuperacion(req, res, next) {
  try {
    const errores = validarSolicitudRecuperacion(req.body);

    if (errores.length > 0) {
      return error(
        res,
        'Los datos enviados no son válidos',
        400,
        errores
      );
    }

    const identificador = req.body.identificador.trim();

    const usuario =
      await modelo.buscarUsuarioRecuperacion(identificador);

    // No se indica si la cuenta existe para evitar revelar usuarios registrados.
    if (!usuario) {
      return exito(
        res,
        null,
        'Si la cuenta existe, se generaron las instrucciones de recuperación'
      );
    }

    const token = crypto.randomBytes(32).toString('hex');

    const expiraEn = new Date(
      Date.now() + MINUTOS_EXPIRACION_TOKEN * 60 * 1000
    );

    await modelo.crearTokenRecuperacion({
      idUsuario: usuario.id,
      token,
      expiraEn,
    });

    const origenFrontend =
      process.env.ORIGEN_FRONTEND ?? 'http://localhost:5173';

    const enlace =
      `${origenFrontend}/restablecer-password?token=${token}`;

    // Temporalmente se muestra el enlace para poder probar la recuperación.
    console.log(`Enlace de recuperación: ${enlace}`);

    return exito(
      res,
      { enlace },
      'Token de recuperación generado correctamente'
    );
  } catch (err) {
    next(err);
  }
}

/** Punto 6 — Valida el token y restablece la contraseña. */
export async function restablecerPassword(req, res, next) {
  try {
    const errores = validarRestablecimiento(req.body);

    if (errores.length > 0) {
      return error(
        res,
        'Los datos enviados no son válidos',
        400,
        errores
      );
    }

    const registroToken = await modelo.buscarToken(
      req.body.token.trim()
    );

    if (!registroToken) {
      return error(
        res,
        'El token de recuperación no es válido',
        400
      );
    }

    if (registroToken.usado) {
      return error(
        res,
        'El token de recuperación ya fue utilizado',
        400
      );
    }

    if (new Date(registroToken.expira_en) <= new Date()) {
      return error(
        res,
        'El token de recuperación ha expirado',
        400
      );
    }

    const passwordHash = await bcrypt.hash(
      req.body.passwordNueva,
      RONDAS_HASH
    );

    await modelo.actualizarPassword(
      registroToken.id_usuario,
      passwordHash
    );

    await modelo.marcarTokenUsado(registroToken.id);

    return exito(
      res,
      null,
      'Contraseña restablecida correctamente'
    );
  } catch (err) {
    next(err);
  }
}