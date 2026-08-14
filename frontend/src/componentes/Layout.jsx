import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { usuario, logout } = useAuth();
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
