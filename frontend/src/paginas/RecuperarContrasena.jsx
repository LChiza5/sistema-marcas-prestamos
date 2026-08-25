import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/cliente.js';
import SelectorTema from '../componentes/SelectorTema.jsx';

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

        <h1 className="h5 mb-1 text-center fw-bold">Recuperar contraseña</h1>
        <p className="text-center text-secondary small mb-4">
          Ingrese su correo electrónico o nombre de usuario
        </p>

        {mensaje && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 small">
            <i className="bi bi-check-circle-fill"></i>
            {mensaje}
          </div>
        )}
        {mensajeError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small">
            <i className="bi bi-exclamation-circle-fill"></i>
            {mensajeError}
          </div>
        )}

        {enlace && (
          <div className="alert alert-info small">
            <div className="fw-semibold mb-2">Solicitud procesada</div>
            <p className="mb-2">Puede continuar para establecer una nueva contraseña.</p>
            <Link className="btn btn-sm btn-primary" to={rutaDelEnlace()}>
              Continuar
            </Link>
          </div>
        )}

        <form onSubmit={enviar}>
          <div className="mb-3">
            <label className="form-label">Usuario o correo</label>
            <input
              className="form-control"
              value={identificador}
              onChange={(evento) => setIdentificador(evento.target.value)}
              autoFocus
              required
            />
          </div>

          <button className="btn btn-primary w-100 py-2" disabled={enviando}>
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Generando…
              </>
            ) : (
              'Recuperar contraseña'
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small text-secondary">
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}
