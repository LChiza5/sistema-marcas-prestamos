import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Impide el acceso a las páginas internas si no hay sesión activa.
 * Con la propiedad soloAdministrador la página queda restringida al administrador.
 */
export default function RutaProtegida({ children, soloAdministrador = false }) {
  const { usuario, cargando, esAdministrador } = useAuth();

  if (cargando) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center gap-3 text-secondary" style={{ minHeight: '100vh' }}>
        <span className="spinner-border" style={{ color: 'var(--color-primary)' }}></span>
        Cargando…
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdministrador && !esAdministrador) return <Navigate to="/" replace />;

  return children;
}
