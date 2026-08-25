import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/cliente.js';
import SelectorTema from '../componentes/SelectorTema.jsx';

const DATOS_INICIALES = {
  nombreCompleto: '',
  fechaNacimiento: '',
  correo: '',
  idDepartamento: '',
  usuario: '',
  password: '',
  confirmacion: '',
};

/** Punto 1 — Registro de usuario. */
export default function Registro() {
  const navegar = useNavigate();
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [departamentos, setDepartamentos] = useState([]);
  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api
      .get('/departamentos')
      .then((res) => setDepartamentos(res.datos))
      .catch(() => setDepartamentos([]));
  }, []);

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErrores([]);
    setEnviando(true);
    try {
      await api.post('/auth/registro', datos);
      navegar('/login');
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="envoltorio-publico">
      <SelectorTema className="selector-tema-flotante" />

      <div className="tarjeta-publica aparecer" style={{ maxWidth: '34rem' }}>
        <div className="marca-app">
          <span className="icono">
            <i className="bi bi-clipboard2-check-fill"></i>
          </span>
          <span className="texto">
            <small>Sistema institucional</small>
            Marcas y Préstamos
          </span>
        </div>

        <h1 className="h5 mb-1 text-center fw-bold">Crear una cuenta</h1>
        <p className="text-center text-secondary small mb-4">
          Complete sus datos para registrarse en el sistema
        </p>

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
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Nombre completo</label>
              <input className="form-control" name="nombreCompleto" value={datos.nombreCompleto} onChange={cambiar} required />
            </div>

            <div className="col-md-4">
              <label className="form-label">Fecha de nacimiento</label>
              <input className="form-control" type="date" name="fechaNacimiento" value={datos.fechaNacimiento} onChange={cambiar} required />
            </div>

            <div className="col-12">
              <label className="form-label">Correo electrónico</label>
              <input className="form-control" type="email" name="correo" value={datos.correo} onChange={cambiar} required />
            </div>

            <div className="col-12">
              <label className="form-label">Departamento o carrera</label>
              <select className="form-select" name="idDepartamento" value={datos.idDepartamento} onChange={cambiar} required>
                <option value="">Seleccione una opción</option>
                {departamentos.map((departamento) => (
                  <option key={departamento.id} value={departamento.id}>
                    {departamento.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Nombre de usuario</label>
              <input className="form-control" name="usuario" value={datos.usuario} onChange={cambiar} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Contraseña</label>
              <input className="form-control" type="password" name="password" value={datos.password} onChange={cambiar} required />
              <div className="form-text">Mínimo 8 caracteres, mayúscula, minúscula y número.</div>
            </div>

            <div className="col-md-6">
              <label className="form-label">Confirmar contraseña</label>
              <input className="form-control" type="password" name="confirmacion" value={datos.confirmacion} onChange={cambiar} required />
            </div>
          </div>

          <button className="btn btn-primary w-100 py-2 mt-4" disabled={enviando}>
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Registrando…
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 small text-secondary">
          ¿Ya tiene cuenta? <Link to="/login" className="fw-semibold">Inicie sesión</Link>
        </p>
      </div>
    </div>
  );
}
