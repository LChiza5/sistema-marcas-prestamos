const FORMATOS_VALIDOS = ['json', 'xml', 'pdf'];

/**
 * Valida los filtros enviados como parámetros de consulta (punto 12).
 * Todos son opcionales, pero si vienen deben ser numéricos y coherentes.
 */
export function validarFiltros(query) {
  const errores = [];
  const { usuario, anio, mes, dia, departamento } = query;

  if (usuario !== undefined && usuario !== '' && !Number.isInteger(Number(usuario))) {
    errores.push('El filtro de usuario no es válido');
  }
  if (departamento !== undefined && !Number.isInteger(Number(departamento))) {
    errores.push('El filtro de departamento no es válido');
  }
  if (anio !== undefined && !/^\d{4}$/.test(String(anio))) {
    errores.push('El filtro de año no es válido');
  }
  if (mes !== undefined && (!Number.isInteger(Number(mes)) || mes < 1 || mes > 12)) {
    errores.push('El filtro de mes no es válido');
  }
  if (dia !== undefined && (!Number.isInteger(Number(dia)) || dia < 1 || dia > 31)) {
    errores.push('El filtro de día no es válido');
  }
  // El día y el mes sin el año producirían un reporte ambiguo entre años distintos.
  if (mes !== undefined && anio === undefined) {
    errores.push('Para filtrar por mes también debe indicar el año');
  }

  return errores;
}

/** Punto 13 — Valida que el formato de exportación solicitado exista. */
export function validarFormato(formato) {
  if (!formato || !FORMATOS_VALIDOS.includes(String(formato).toLowerCase())) {
    return [`El formato de exportación debe ser uno de: ${FORMATOS_VALIDOS.join(', ')}`];
  }
  return [];
}
