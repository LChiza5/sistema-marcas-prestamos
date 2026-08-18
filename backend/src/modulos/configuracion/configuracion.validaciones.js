/**
 * Reglas específicas por parámetro. Cada clave conocida valida su valor
 * de forma distinta; una clave desconocida simplemente exige texto no vacío.
 */

function validarRangosIp(valor) {
  const errores = [];
  const partes = valor.split(',').map((p) => p.trim()).filter(Boolean);

  if (partes.length === 0) errores.push('Debe indicar al menos una IP o rango');

  const REGEX_IP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  const REGEX_CIDR = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;

  for (const parte of partes) {
    if (!REGEX_IP.test(parte) && !REGEX_CIDR.test(parte)) {
      errores.push(`"${parte}" no es una IP ni un rango CIDR válido`);
    }
  }

  return errores;
}

function validarEnteroPositivo(valor, nombreCampo) {
  const errores = [];
  if (!/^\d+$/.test(valor) || Number(valor) <= 0) {
    errores.push(`${nombreCampo} debe ser un número entero mayor a cero`);
  }
  return errores;
}

/** Valida el nuevo valor de un parámetro según su clave. */
export function validarValorConfiguracion(clave, valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return ['El valor es requerido'];
  }
  if (String(valor).length > 255) {
    return ['El valor excede los 255 caracteres'];
  }

  switch (clave) {
    case 'rangos_ip_permitidos':
      return validarRangosIp(String(valor));
    case 'minutos_sesion':
      return validarEnteroPositivo(String(valor), 'El tiempo máximo de sesión');
    case 'tamano_max_archivo_mb':
      return validarEnteroPositivo(String(valor), 'El tamaño máximo de archivo');
    default:
      return [];
  }
}
