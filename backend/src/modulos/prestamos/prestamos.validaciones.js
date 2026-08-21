/**
 * Valida la forma de los datos enviados para registrar un préstamo.
 * Las validaciones que dependen de la base de datos (que el usuario exista,
 * que los equipos estén disponibles, etc.) se hacen en el controlador,
 * porque requieren consultar la base de datos dentro de la transacción.
 */
export function validarRegistro({ idUsuario, equipos }) {
  const errores = [];

  if (!Number.isInteger(Number(idUsuario)) || Number(idUsuario) <= 0) {
    errores.push('Debe indicar un usuario válido');
  }

  if (!Array.isArray(equipos) || equipos.length === 0) {
    errores.push('El préstamo debe incluir al menos un equipo');
    return errores; // sin equipos no tiene sentido seguir validando el arreglo
  }

  const idsInvalidos = equipos.some((equipo) => !Number.isInteger(Number(equipo?.id)));
  if (idsInvalidos) {
    errores.push('Todos los equipos deben tener un identificador válido');
  }

  // Punto 18 — que el mismo equipo no aparezca dos veces en el mismo préstamo.
  const ids = equipos.map((equipo) => Number(equipo.id));
  const idsUnicos = new Set(ids);
  if (idsUnicos.size !== ids.length) {
    errores.push('El mismo equipo no puede aparecer más de una vez en el préstamo');
  }

  return errores;
}