const API_URL = import.meta.env.VITE_API_URL;

// Los archivos estáticos (imágenes de equipos) NO están bajo /api,
// están montados en la raíz del servidor (ver app.use('/uploads', ...)).
// Por eso se necesita el origen sin el sufijo /api.
const API_ORIGEN = API_URL.replace(/\/api\/?$/, '');

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

/**
 * Igual que solicitar(), pero para enviar archivos (multipart/form-data).
 * No se debe fijar el Content-Type a mano: el navegador arma el boundary
 * correcto automáticamente cuando el body es un objeto FormData.
 */
async function solicitarFormData(ruta, metodo, formData) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    credentials: 'include',
    body: formData,
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
  postForm: (ruta, formData) => solicitarFormData(ruta, 'POST', formData),
  putForm: (ruta, formData) => solicitarFormData(ruta, 'PUT', formData),
};

export { API_URL, API_ORIGEN };