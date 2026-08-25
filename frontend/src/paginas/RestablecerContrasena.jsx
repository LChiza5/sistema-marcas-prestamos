import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/cliente.js';
import SelectorTema from '../componentes/SelectorTema.jsx';

const DATOS_INICIALES = {
  contrasenaNueva: '',
  confirmacion: '',
};

/** Punto 6 — Restablecimiento de contraseña mediante token temporal. */
export default function RestablecerContrasena() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') ?? '';

  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [errores, setErrores] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErrores([]);
    setMensajeExito('');
    setEnviando(true);

    try {
      const res = await api.post('/usuarios/restablecer', {
        token,
        passwordNueva: datos.contrasenaNueva,
        confirmacion: datos.confirmacion,
      });

      setMensajeExito(res.mensaje);
      setDatos(DATOS_INICIALES);
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
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

        <h1 className="h5 mb-1 text-center fw-bold">Restablecer contraseña</h1>
        <p className="text-center text-secondary small mb-4">
          Defina una nueva contraseña para su cuenta
        </p>

        {!token && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small">
            <i className="bi bi-exclamation-circle-fill"></i>
            El enlace no contiene un token de recuperación válido.
          </div>
        )}

        {mensajeExito && (
          <div className="alert alert-success small">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill"></i>
              {mensajeExito}
            </div>
            <Link className="alert-link d-inline-block mt-2" to="/login">
              Iniciar sesión
            </Link>
          </div>
        )}

        {errores.length > 0 && (
          <div className="alert alert-danger py-2 small">
            <ul className="mb-0 ps-3">
              {errores.map((mensaje) => (
                <li key={mensaje}>{mensaje}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={enviar}>
          <div className="mb-3">
            <label className="form-label">Nueva contraseña</label>
            <input
              className="form-control"
              type="password"
              name="contrasenaNueva"
              value={datos.contrasenaNueva}
              onChange={cambiar}
              required
              disabled={!token || Boolean(mensajeExito)}
            />
            <div className="form-text">
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Confirmar nueva contraseña</label>
            <input
              className="form-control"
              type="password"
              name="confirmacion"
              value={datos.confirmacion}
              onChange={cambiar}
              required
              disabled={!token || Boolean(mensajeExito)}
            />
          </div>

          <button
            className="btn btn-primary w-100 py-2"
            disabled={!token || enviando || Boolean(mensajeExito)}
          >
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Restableciendo…
              </>
            ) : (
              'Restablecer contraseña'
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small text-secondary">
          <Link to="/recuperar-contrasena">Solicitar otro enlace</Link>
        </p>
      </div>
    </div>
  );
}
