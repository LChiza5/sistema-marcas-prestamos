import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
    <div className="container py-5" style={{ maxWidth: '26rem' }}>
      <h1 className="h4 mb-4 text-center">Iniciar sesión</h1>

      {mensajeError && <div className="alert alert-danger">{mensajeError}</div>}

      <form onSubmit={enviar}>
        <div className="mb-3">
          <label className="form-label">Usuario o correo</label>
          <input
            className="form-control"
            name="identificador"
            value={datos.identificador}
            onChange={cambiar}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            className="form-control"
            type="password"
            name="password"
            value={datos.password}
            onChange={cambiar}
            required
          />
        </div>

        <button className="btn btn-primary w-100" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="text-center mt-3 mb-0 small">
        ¿No tiene cuenta? <Link to="/registro">Registrarse</Link>
      </p>

      {/* TODO (punto 6): agregar el enlace de recuperación de contraseña. */}
    </div>
  );
}
