const ESTADOS_VALIDOS = ['DISPONIBLE', 'PRESTADO', 'MANTENIMIENTO', 'INACTIVO'];
const REGEX_CODIGO = /^[A-Za-z0-9-]+$/;

/** Valida los datos para registrar un equipo nuevo. */
export function validarRegistro({ codigo, descripcion }) {
  const errores = [];

  if (!codigo?.trim()) errores.push('El código del equipo es requerido');
  else if (codigo.trim().length > 50) errores.push('El código del equipo excede los 50 caracteres');
  else if (!REGEX_CODIGO.test(codigo.trim())) {
    errores.push('El código del equipo sólo puede contener letras, números y guiones');
  }

  if (!descripcion?.trim()) errores.push('La descripción del equipo es requerida');
  else if (descripcion.trim().length > 255) errores.push('La descripción excede los 255 caracteres');

  return errores;
}

/** Valida los datos para modificar un equipo existente. */
export function validarActualizacion({ descripcion, estado }) {
  const errores = [];

  if (!descripcion?.trim()) errores.push('La descripción del equipo es requerida');
  else if (descripcion.trim().length > 255) errores.push('La descripción excede los 255 caracteres');

  if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
    errores.push('El estado del equipo no es válido');
  }

  return errores;
}