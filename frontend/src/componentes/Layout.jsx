import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SelectorTema from './SelectorTema.jsx';

const enlaceClase = ({ isActive }) => `nav-link${isActive ? ' activo' : ''}`;

export default function Layout() {
  const { usuario, logout, esAdministrador } = useAuth();
  const navegar = useNavigate();

  async function cerrarSesion() {
    await logout();
    navegar('/login');
  }

  const iniciales = (usuario?.nombreCompleto ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');

  return (
    <>
      <nav className="navbar navbar-expand-lg navegacion-app">
        <div className="container">
          <Link className="navbar-brand text-white" to="/">
            <span className="d-inline-flex align-items-center justify-content-center rounded-2 bg-white bg-opacity-10" style={{ width: '2rem', height: '2rem' }}>
              <i className="bi bi-clipboard2-check-fill"></i>
            </span>
            Marcas y Préstamos
          </Link>

          <button
            className="navbar-toggler border-0 text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navegacionPrincipal"
          >
            <i className="bi bi-list text-white fs-3"></i>
          </button>

          <div className="collapse navbar-collapse" id="navegacionPrincipal">
            <div className="navbar-nav me-auto gap-1 mt-3 mt-lg-0">
              <NavLink className={enlaceClase} to="/marcas">
                <i className="bi bi-fingerprint me-1"></i>
                Marcas
              </NavLink>
              <NavLink className={enlaceClase} to="/dispositivos">
                <i className="bi bi-laptop me-1"></i>
                Dispositivos
              </NavLink>

              {esAdministrador && (
                <>
                  <NavLink className={enlaceClase} to="/equipos">
                    <i className="bi bi-box-seam me-1"></i>
                    Equipos
                  </NavLink>
                  <NavLink className={enlaceClase} to="/prestamos">
                    <i className="bi bi-arrow-left-right me-1"></i>
                    Préstamos
                  </NavLink>
                  <NavLink className={enlaceClase} to="/reportes">
                    <i className="bi bi-bar-chart-line me-1"></i>
                    Reportes
                  </NavLink>
                  <NavLink className={enlaceClase} to="/departamentos">
                    <i className="bi bi-diagram-3 me-1"></i>
                    Departamentos
                  </NavLink>
                  <NavLink className={enlaceClase} to="/configuracion">
                    <i className="bi bi-gear me-1"></i>
                    Configuración
                  </NavLink>
                </>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
              <SelectorTema />

              <div className="dropdown">
                <button
                  className="btn d-flex align-items-center gap-2 text-white border-0"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <span className="avatar-usuario">{iniciales || '?'}</span>
                  <span className="d-none d-md-inline small fw-semibold">
                    {usuario?.nombreCompleto}
                  </span>
                  <i className="bi bi-chevron-down small opacity-75"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" style={{ borderRadius: 'var(--radius-md)' }}>
                  <li>
                    <span className="dropdown-item-text small text-secondary">
                      {esAdministrador ? 'Administrador' : 'Usuario'}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/perfil">
                      <i className="bi bi-person-circle me-2"></i>
                      Mi perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/cambiar-contrasena">
                      <i className="bi bi-shield-lock me-2"></i>
                      Cambiar contraseña
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={cerrarSesion}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4 aparecer">
        <Outlet />
      </main>
    </>
  );
}
