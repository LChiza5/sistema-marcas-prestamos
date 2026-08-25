import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SelectorTema from '../componentes/SelectorTema.jsx';

/** Punto 2 — Inicio de sesión. */
export default function Login() {
  const { usuario, login } = useAuth();
  const navegar = useNavigate();

  const [datos, setDatos] = useState({ identificador: '', password: '' });
  const [mensajeError, setMensajeError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setMensajeError('');
    setEnviando(true);
    try {
      await login(datos.identificador, datos.password);
      navegar('/');
    } catch (err) {
      setMensajeError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="envoltorio-publico">
      <SelectorTema className="selector-tema-flotante" />

      <div className="tarjeta-publica aparecer" style={{ maxWidth: '26rem' }}>
        <div className="marca-app">
          <span className="icono">
            <i className="bi bi-clipboard2-check-fill"></i>
          </span>
          <span className="texto">
            <small>Sistema institucional</small>
            Marcas y Préstamos
          </span>
        </div>

        <h1 className="h5 mb-1 text-center fw-bold">Bienvenido de nuevo</h1>
        <p className="text-center text-secondary small mb-4">
          Ingresa tus credenciales para continuar
        </p>

        {mensajeError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small">
            <i className="bi bi-exclamation-circle-fill"></i>
            {mensajeError}
          </div>
        )}

        <form onSubmit={enviar}>
          <div className="mb-3">
            <label className="form-label">Usuario o correo</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-secondary">
                <i className="bi bi-person"></i>
              </span>
              <input
                className="form-control border-start-0"
                name="identificador"
                value={datos.identificador}
                onChange={cambiar}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-secondary">
                <i className="bi bi-lock"></i>
              </span>
              <input
                className="form-control border-start-0"
                type="password"
                name="password"
                value={datos.password}
                onChange={cambiar}
                required
              />
            </div>
          </div>

          <div className="text-end mb-3">
            <Link to="/recuperar-contrasena" className="small">
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <button className="btn btn-primary w-100 py-2" disabled={enviando}>
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Ingresando…
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small text-secondary">
          ¿No tiene cuenta? <Link to="/registro" className="fw-semibold">Regístrese aquí</Link>
        </p>
      </div>
    </div>
  );
}
