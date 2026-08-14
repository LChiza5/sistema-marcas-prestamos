import { error } from '../utils/respuesta.js';

/** Bloquea el acceso a las rutas protegidas si no existe una sesión activa. */
export function requiereSesion(req, res, next) {
  if (!req.session?.usuario) {
    return error(res, 'Debe iniciar sesión para realizar esta acción', 401);
  }
  next();
}

/**
 * Verifica que el usuario tenga alguno de los roles indicados.
 * Uso: router.get('/', requiereSesion, requiereRol('ADMINISTRADOR'), controlador);
 */
export function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.session?.usuario?.rol)) {
      return error(res, 'No cuenta con permisos para realizar esta acción', 403);
    }
    next();
  };
}
