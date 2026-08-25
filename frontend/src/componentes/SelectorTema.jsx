import { useEffect, useState } from 'react';
import { alternarTema, obtenerTema } from '../estilos/tema.js';

/** Botón para alternar entre modo claro y oscuro. */
export default function SelectorTema({ className = '' }) {
  const [tema, setTema] = useState(obtenerTema());

  useEffect(() => {
    setTema(obtenerTema());
  }, []);

  return (
    <button
      type="button"
      className={`btn-selector-tema ${className}`}
      onClick={() => setTema(alternarTema())}
      title={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Alternar modo claro u oscuro"
    >
      <i className={`bi ${tema === 'oscuro' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
    </button>
  );
}
