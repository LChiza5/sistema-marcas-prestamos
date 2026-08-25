const CLAVE_ALMACENAMIENTO = 'mp-tema';

/** Tema guardado por el usuario, o la preferencia del sistema operativo si nunca eligió uno. */
export function obtenerTema() {
  const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
  if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

/** Aplica el tema al documento y lo recuerda para la próxima visita. */
export function aplicarTema(tema) {
  document.documentElement.setAttribute('data-bs-theme', tema === 'oscuro' ? 'dark' : 'light');
  localStorage.setItem(CLAVE_ALMACENAMIENTO, tema);
}

export function alternarTema() {
  const nuevo = obtenerTema() === 'oscuro' ? 'claro' : 'oscuro';
  aplicarTema(nuevo);
  return nuevo;
}

// Aplica el tema apenas se carga el módulo, antes de que React pinte nada.
aplicarTema(obtenerTema());
