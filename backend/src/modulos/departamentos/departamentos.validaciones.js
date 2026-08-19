/** Valida los datos para registrar un departamento o carrera. */
export function validarRegistro({
  nombre,
  descripcion,
  encargado,
}) {
  const errores = [];

  if (!nombre?.trim()) {
    errores.push('El nombre del departamento es requerido');
  } else if (nombre.trim().length > 100) {
    errores.push('El nombre del departamento excede los 100 caracteres');
  }

  if (descripcion && descripcion.trim().length > 255) {
    errores.push('La descripción excede los 255 caracteres');
  }

  if (encargado && encargado.trim().length > 100) {
    errores.push('El nombre del encargado excede los 100 caracteres');
  }

  return errores;
}

/** Valida los datos para modificar un departamento o carrera. */
export function validarActualizacion({
  nombre,
  descripcion,
  encargado,
}) {
  const errores = [];

  if (!nombre?.trim()) {
    errores.push('El nombre del departamento es requerido');
  } else if (nombre.trim().length > 100) {
    errores.push('El nombre del departamento excede los 100 caracteres');
  }

  if (descripcion && descripcion.trim().length > 255) {
    errores.push('La descripción excede los 255 caracteres');
  }

  if (encargado && encargado.trim().length > 100) {
    errores.push('El nombre del encargado excede los 100 caracteres');
  }

  return errores;
}