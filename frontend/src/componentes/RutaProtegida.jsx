import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Impide el acceso a las páginas internas si no hay sesión activa.
 * Con la propiedad soloAdministrador la página queda restringida al administrador.
 */
export default function RutaProtegida({ children, soloAdministrador = false }) {
  const { usuario, cargando, esAdministrador } = useAuth();

  if (cargando) {
    return <div className="container py-5 text-center text-secondary">Cargando…</div>;
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdministrador && !esAdministrador) return <Navigate to="/" replace />;

  return children;
}
