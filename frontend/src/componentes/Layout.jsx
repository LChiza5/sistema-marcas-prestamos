import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { usuario, logout, esAdministrador } = useAuth();
  const navegar = useNavigate();

  async function cerrarSesion() {
    await logout();
    navegar('/login');
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="bi bi-clipboard-check me-2"></i>
            Marcas y Préstamos
          </Link>

          <div className="navbar-nav me-auto">
            {esAdministrador && (
              <>
                <Link className="nav-link text-white" to="/equipos">
                  <i className="bi bi-box-seam me-1"></i>
                  Equipos
                </Link>
                <Link className="nav-link text-white" to="/prestamos">
                  <i className="bi bi-clipboard-check me-1"></i>
                  Préstamos
                </Link>
                <Link className="nav-link text-white" to="/reportes">
                  <i className="bi bi-file-earmark-text me-1"></i>
                  Reportes
                </Link>
              </>
            )}
          </div>

          {/* TODO: agregar aquí los enlaces de cada módulo conforme se completen. */}

          <div className="d-flex align-items-center gap-3">
            <span className="text-white small">
              <i className="bi bi-person-circle me-1"></i>
              {usuario?.nombreCompleto}
            </span>
            <button className="btn btn-sm btn-light" onClick={cerrarSesion}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>
    </>
  );
}
