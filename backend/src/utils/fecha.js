

export function fechaHoraActual() {
  const ahora = new Date();

  const fecha = ahora.toLocaleDateString('sv-SE'); 
  const hora = ahora.toLocaleTimeString('es-CR', { hour12: false });

  return { fecha, hora };
}
