const ESTADOS_VALIDOS = ['ACTIVO', 'INACTIVO'];

/** Valida los datos para registrar un dispositivo nuevo. */
export function validarRegistro({ nombre, descripcion }) {
  const errores = [];

  if (!nombre?.trim()) errores.push('El nombre del dispositivo es requerido');
  else if (nombre.trim().length > 100) errores.push('El nombre del dispositivo excede los 100 caracteres');

  if (descripcion && descripcion.length > 255) {
    errores.push('La descripción excede los 255 caracteres');
  }

  return errores;
}

/** Valida los datos para modificar un dispositivo existente. */
export function validarActualizacion({ nombre, descripcion, estado }) {
  const errores = [];

  if (!nombre?.trim()) errores.push('El nombre del dispositivo es requerido');
  else if (nombre.trim().length > 100) errores.push('El nombre del dispositivo excede los 100 caracteres');

  if (descripcion && descripcion.length > 255) {
    errores.push('La descripción excede los 255 caracteres');
  }

  if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
    errores.push('El estado del dispositivo no es válido');
  }

  return errores;
}
