import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/cliente.js';

const DATOS_INICIALES = {
  contrasenaActual: '',
  contrasenaNueva: '',
  confirmacion: '',
};

/** Punto 5 — Cambio de contraseña del usuario autenticado. */
export default function CambiarContrasena() {
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
      const res = await api.put('/usuarios/password', {
        passwordActual: datos.contrasenaActual,
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
    <div style={{ maxWidth: '36rem' }}>
      <div className="mb-4">
        <h1 className="h4 mb-1">
          <i className="bi bi-key me-2"></i>
          Cambiar contraseña
        </h1>
        <p className="text-secondary mb-0">
          Ingrese su contraseña actual antes de establecer una nueva.
        </p>
      </div>

      {mensajeExito && (
        <div className="alert alert-success">{mensajeExito}</div>
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
              <label className="form-label">Contraseña actual</label>
              <input
                className="form-control"
                type="password"
                name="contrasenaActual"
                value={datos.contrasenaActual}
                onChange={cambiar}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nueva contraseña</label>
              <input
                className="form-control"
                type="password"
                name="contrasenaNueva"
                value={datos.contrasenaNueva}
                onChange={cambiar}
                required
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
              />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary" disabled={enviando}>
                {enviando ? 'Actualizando…' : 'Cambiar contraseña'}
              </button>

              <Link className="btn btn-outline-secondary" to="/perfil">
                Volver al perfil
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
