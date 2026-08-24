import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/cliente.js';

/** Punto 6 — Solicitud de recuperación de contraseña. */
export default function RecuperarContrasena() {
  const [identificador, setIdentificador] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [enlace, setEnlace] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setMensaje('');
    setMensajeError('');
    setEnlace('');
    setEnviando(true);

    try {
      const res = await api.post('/usuarios/recuperar', { identificador });
      setMensaje(res.mensaje);
      setEnlace(res.datos?.enlace ?? '');
    } catch (err) {
      setMensajeError(err.errores?.join(', ') ?? err.message);
    } finally {
      setEnviando(false);
    }
  }

  function rutaDelEnlace() {
    if (!enlace) return '/recuperar-contrasena';

    try {
      const url = new URL(enlace);
      const token = url.searchParams.get('token');

      return token
        ? `/restablecer-contrasena?token=${encodeURIComponent(token)}`
        : '/recuperar-contrasena';
    } catch {
      return '/recuperar-contrasena';
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: '30rem' }}>
      <h1 className="h4 mb-2 text-center">Recuperar contraseña</h1>
      <p className="text-secondary text-center mb-4">
        Ingrese su correo electrónico o nombre de usuario.
      </p>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {mensajeError && <div className="alert alert-danger">{mensajeError}</div>}

      {enlace && (
        <div className="alert alert-info">
          <div className="fw-semibold mb-2">
            Solicitud de recuperación procesada
          </div>
          <p className="small mb-2">
            Puede continuar para establecer una nueva contraseña.
          </p>
          <Link className="btn btn-sm btn-primary" to={rutaDelEnlace()}>
            Continuar
          </Link>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={enviar}>
            <div className="mb-3">
              <label className="form-label">Usuario o correo</label>
              <input
                className="form-control"
                value={identificador}
                onChange={(evento) => setIdentificador(evento.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary w-100" disabled={enviando}>
              {enviando ? 'Generando…' : 'Recuperar contraseña'}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center mt-3 mb-0 small">
        <Link to="/login">Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}
