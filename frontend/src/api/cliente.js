const API_URL = import.meta.env.VITE_API_URL;

/**
 * Envoltura de fetch() para consumir la API.
 * Todos los módulos del frontend deben usar esta función.
 *
 * credentials: 'include' es indispensable para que el navegador envíe
 * la cookie de sesión en cada solicitud.
 */
async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opciones.headers },
    ...opciones,
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const error = new Error(cuerpo?.mensaje ?? 'No fue posible completar la solicitud');
    error.estado = respuesta.status;
    error.errores = cuerpo?.errores ?? null;
    throw error;
  }

  return cuerpo;
}

export const api = {
  get: (ruta) => solicitar(ruta),
  post: (ruta, datos) => solicitar(ruta, { method: 'POST', body: JSON.stringify(datos) }),
  put: (ruta, datos) => solicitar(ruta, { method: 'PUT', body: JSON.stringify(datos) }),
  delete: (ruta) => solicitar(ruta, { method: 'DELETE' }),
};
