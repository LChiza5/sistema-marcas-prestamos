// Mínimo 8 caracteres, una minúscula, una mayúscula y un número.
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** Valida los datos permitidos al modificar el perfil. */
export function validarPerfil({
  nombreCompleto,
  fechaNacimiento,
  idDepartamento,
}) {
  const errores = [];

  if (!nombreCompleto?.trim()) {
    errores.push('El nombre completo es requerido');
  } else if (nombreCompleto.trim().length > 120) {
    errores.push('El nombre completo excede los 120 caracteres');
  }

  if (!fechaNacimiento) {
    errores.push('La fecha de nacimiento es requerida');
  } else if (Number.isNaN(Date.parse(fechaNacimiento))) {
    errores.push('La fecha de nacimiento no es válida');
  }

  if (!idDepartamento) {
    errores.push('El departamento o carrera es requerido');
  } else if (!Number.isInteger(Number(idDepartamento))) {
    errores.push('El departamento o carrera no es válido');
  }

  return errores;
}

/** Valida los datos necesarios para cambiar la contraseña. */
export function validarCambioPassword({
  passwordActual,
  passwordNueva,
  confirmacion,
}) {
  const errores = [];

  if (!passwordActual) {
    errores.push('La contraseña actual es requerida');
  }

  if (!passwordNueva) {
    errores.push('La nueva contraseña es requerida');
  } else if (!REGEX_PASSWORD.test(passwordNueva)) {
    errores.push(
      'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
    );
  }

  if (passwordNueva !== confirmacion) {
    errores.push('La nueva contraseña y su confirmación no coinciden');
  }

  return errores;
}

/** Valida la solicitud de recuperación de contraseña. */
export function validarSolicitudRecuperacion({ identificador }) {
  const errores = [];

  if (!identificador?.trim()) {
    errores.push('Debe indicar su usuario o correo electrónico');
  }

  return errores;
}

/** Valida los datos para restablecer una contraseña. */
export function validarRestablecimiento({
  token,
  passwordNueva,
  confirmacion,
}) {
  const errores = [];

  if (!token?.trim()) {
    errores.push('El token de recuperación es requerido');
  }

  if (!passwordNueva) {
    errores.push('La nueva contraseña es requerida');
  } else if (!REGEX_PASSWORD.test(passwordNueva)) {
    errores.push(
      'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
    );
  }

  if (passwordNueva !== confirmacion) {
    errores.push('La nueva contraseña y su confirmación no coinciden');
  }

  return errores;
}