const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_USUARIO = /^[a-zA-Z0-9_.]+$/;
// Mínimo 8 caracteres, una minúscula, una mayúscula y un número.
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Valida los datos del registro de usuario (punto 1).
 * Devuelve un arreglo de errores. Vacío significa que los datos son válidos.
 */
export function validarRegistro(datos) {
  const errores = [];
  const {
    nombreCompleto,
    fechaNacimiento,
    correo,
    idDepartamento,
    usuario,
    password,
    confirmacion,
  } = datos;

  if (!nombreCompleto?.trim()) errores.push('El nombre completo es requerido');
  else if (nombreCompleto.trim().length > 120) errores.push('El nombre completo excede los 120 caracteres');

  if (!fechaNacimiento) errores.push('La fecha de nacimiento es requerida');
  else if (Number.isNaN(Date.parse(fechaNacimiento))) errores.push('La fecha de nacimiento no es válida');

  if (!correo?.trim()) errores.push('El correo electrónico es requerido');
  else if (!REGEX_CORREO.test(correo.trim())) errores.push('El correo electrónico no tiene un formato válido');
  else if (correo.trim().length > 150) errores.push('El correo electrónico excede los 150 caracteres');

  if (!idDepartamento) errores.push('El departamento o carrera es requerido');
  else if (!Number.isInteger(Number(idDepartamento))) errores.push('El departamento o carrera no es válido');

  if (!usuario?.trim()) errores.push('El nombre de usuario es requerido');
  else if (usuario.trim().length < 4 || usuario.trim().length > 50) errores.push('El nombre de usuario debe tener entre 4 y 50 caracteres');
  else if (!REGEX_USUARIO.test(usuario.trim())) errores.push('El nombre de usuario sólo admite letras, números, punto y guion bajo');

  if (!password) errores.push('La contraseña es requerida');
  else if (!REGEX_PASSWORD.test(password)) errores.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');

  if (password !== confirmacion) errores.push('La contraseña y su confirmación no coinciden');

  return errores;
}

/** Valida los datos del inicio de sesión (punto 2). */
export function validarLogin({ identificador, password }) {
  const errores = [];
  if (!identificador?.trim()) errores.push('Debe indicar su usuario o correo electrónico');
  if (!password) errores.push('La contraseña es requerida');
  return errores;
}
