/**
 * Estructura consistente para todas las respuestas de la API.
 * Éxito: { exito: true,  mensaje, datos }
 * Error: { exito: false, mensaje, errores }
 */

export function exito(res, datos = null, mensaje = 'Operación realizada', estado = 200) {
  return res.status(estado).json({ exito: true, mensaje, datos });
}

export function creado(res, datos = null, mensaje = 'Registro creado') {
  return exito(res, datos, mensaje, 201);
}

export function error(res, mensaje = 'Solicitud inválida', estado = 400, errores = null) {
  return res.status(estado).json({ exito: false, mensaje, errores });
}
