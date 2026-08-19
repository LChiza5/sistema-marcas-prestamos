import { Router } from 'express';
import { requiereSesion } from '../../middlewares/auth.middleware.js';
import * as controlador from './usuarios.controller.js';

const router = Router();

// =====================================================================
// PUNTOS 4, 5 y 6
//
// Punto 4 — Perfil del usuario
//   GET  /api/usuarios/perfil    Devuelve los datos del usuario en sesión.
//   PUT  /api/usuarios/perfil    Modifica nombre, fecha y departamento.
//   El correo y el nombre de usuario NO se pueden modificar.
//
// Punto 5 — Cambio de contraseña
//   PUT  /api/usuarios/password
//   Recibe contraseña actual, nueva y confirmación.
//   El backend debe verificar primero la contraseña actual.
//
// Punto 6 — Recuperación de contraseña
//   POST /api/usuarios/recuperar     Recibe correo o usuario y genera un token.
//   POST /api/usuarios/restablecer   Recibe el token y la nueva contraseña.
//   El token se guarda en la tabla tokens_recuperacion, tiene fecha de
//   expiración, se usa una sola vez y se valida en el servidor.
//
// Crear también: usuarios.controller.js, usuarios.model.js y
// usuarios.validaciones.js, siguiendo el módulo auth como ejemplo.
// =====================================================================

// Punto 4 — Perfil
router.get(
  '/perfil',
  requiereSesion,
  controlador.obtenerPerfil
);

router.put(
  '/perfil',
  requiereSesion,
  controlador.actualizarPerfil
);

// Punto 5 — Cambio de contraseña
router.put(
  '/password',
  requiereSesion,
  controlador.cambiarPassword
);

// Punto 6 — Recuperación de contraseña
router.post(
  '/recuperar',
  controlador.solicitarRecuperacion
);

router.post(
  '/restablecer',
  controlador.restablecerPassword
);


export default router;
