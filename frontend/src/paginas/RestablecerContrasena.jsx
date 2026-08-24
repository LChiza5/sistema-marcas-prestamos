import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/cliente.js';

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
    <div className="container py-5" style={{ maxWidth: '30rem' }}>
      <h1 className="h4 mb-2 text-center">Restablecer contraseña</h1>
      <p className="text-secondary text-center mb-4">
        Defina una nueva contraseña para su cuenta.
      </p>

      {!token && (
        <div className="alert alert-danger">
          El enlace no contiene un token de recuperación válido.
        </div>
      )}

      {mensajeExito && (
        <div className="alert alert-success">
          {mensajeExito}
          <div className="mt-2">
            <Link className="alert-link" to="/login">
              Iniciar sesión
            </Link>
          </div>
        </div>
      )}

      {errores.length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0 ps-3">
            {errores.map((mensaje) => (
              <li key={mensaje}>{mensaje}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-body">
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

            <div className="mb-3">
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
              className="btn btn-primary w-100"
              disabled={!token || enviando || Boolean(mensajeExito)}
            >
              {enviando ? 'Restableciendo…' : 'Restablecer contraseña'}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center mt-3 mb-0 small">
        <Link to="/recuperar-contrasena">Solicitar otro enlace</Link>
      </p>
    </div>
  );
}
