import bcrypt from 'bcryptjs';
import { creado, error, exito } from '../../utils/respuesta.js';
import { validarLogin, validarRegistro } from './auth.validaciones.js';
import * as modelo from './auth.model.js';
import * as configuracionModelo from '../configuracion/configuracion.model.js';

const RONDAS_HASH = 10;
const MINUTOS_SESION_POR_DEFECTO = 60;

/** Punto 1 — Registro de usuario. */
export async function registrar(req, res, next) {
  try {
    const errores = validarRegistro(req.body);
    if (errores.length > 0) return error(res, 'Los datos enviados no son válidos', 400, errores);

    const nombreCompleto = req.body.nombreCompleto.trim();
    const correo = req.body.correo.trim().toLowerCase();
    const usuario = req.body.usuario.trim();
    const idDepartamento = Number(req.body.idDepartamento);

    if (!(await modelo.existeDepartamento(idDepartamento))) {
      return error(res, 'El departamento o carrera seleccionado no existe', 400);
    }

    const { usuarioRepetido, correoRepetido } = await modelo.buscarDuplicados(usuario, correo);
    if (usuarioRepetido) return error(res, 'El nombre de usuario ya está registrado', 409);
    if (correoRepetido) return error(res, 'El correo electrónico ya está registrado', 409);

    // La contraseña nunca se almacena en texto plano.
    const passwordHash = await bcrypt.hash(req.body.password, RONDAS_HASH);

    const id = await modelo.insertarUsuario({
      nombreCompleto,
      fechaNacimiento: req.body.fechaNacimiento,
      correo,
      usuario,
      passwordHash,
      idDepartamento,
    });

    return creado(res, { id, usuario }, 'Usuario registrado correctamente');
  } catch (err) {
    next(err);
  }
}

/** Punto 2 — Inicio de sesión. */
export async function iniciarSesion(req, res, next) {
  try {
    const errores = validarLogin(req.body);
    if (errores.length > 0) return error(res, 'Los datos enviados no son válidos', 400, errores);

    const registro = await modelo.buscarPorUsuarioOCorreo(req.body.identificador.trim());

    // Se responde igual si el usuario no existe o si la contraseña es incorrecta,
    // para no revelar cuáles usuarios están registrados.
    const passwordValida = registro
      ? await bcrypt.compare(req.body.password, registro.password_hash)
      : false;

    if (!registro || !passwordValida) {
      return error(res, 'Usuario o contraseña incorrectos', 401);
    }
    if (!registro.activo) {
      return error(res, 'La cuenta se encuentra inactiva', 403);
    }

    const usuario = {
      id: registro.id,
      nombreCompleto: registro.nombre_completo,
      usuario: registro.usuario,
      correo: registro.correo,
      rol: registro.rol,
    };

    // Se regenera el identificador de sesión para evitar fijación de sesión.
    req.session.regenerate(async (err) => {
      if (err) return next(err);
      req.session.usuario = usuario;

      // El tiempo máximo de sesión es configurable por el administrador
      // (tabla configuracion, clave minutos_sesion). Se aplica en cada
      // login para que un cambio reciente sí tenga efecto real.
      const parametro = await configuracionModelo.obtenerPorClave('minutos_sesion');
      const minutos = Number(parametro?.valor ?? MINUTOS_SESION_POR_DEFECTO);
      req.session.cookie.maxAge = minutos * 60 * 1000;

      return exito(res, usuario, 'Sesión iniciada correctamente');
    });
  } catch (err) {
    next(err);
  }
}

/** Punto 3 — Cierre de sesión. */
export function cerrarSesion(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sid');
    return exito(res, null, 'Sesión finalizada');
  });
}

/** Devuelve los datos del usuario de la sesión activa. */
export function sesionActual(req, res) {
  return exito(res, req.session.usuario, 'Sesión activa');
}
