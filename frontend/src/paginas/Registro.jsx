import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/cliente.js';

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
    <div className="container py-5" style={{ maxWidth: '32rem' }}>
      <h1 className="h4 mb-4 text-center">Registro de usuario</h1>

      {errores.length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0 ps-3">
            {errores.map((mensaje) => (
              <li key={mensaje}>{mensaje}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={enviar}>
        <div className="mb-3">
          <label className="form-label">Nombre completo</label>
          <input className="form-control" name="nombreCompleto" value={datos.nombreCompleto} onChange={cambiar} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha de nacimiento</label>
          <input className="form-control" type="date" name="fechaNacimiento" value={datos.fechaNacimiento} onChange={cambiar} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input className="form-control" type="email" name="correo" value={datos.correo} onChange={cambiar} required />
        </div>

        <div className="mb-3">
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

        <div className="mb-3">
          <label className="form-label">Nombre de usuario</label>
          <input className="form-control" name="usuario" value={datos.usuario} onChange={cambiar} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input className="form-control" type="password" name="password" value={datos.password} onChange={cambiar} required />
          <div className="form-text">Mínimo 8 caracteres, una mayúscula, una minúscula y un número.</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Confirmar contraseña</label>
          <input className="form-control" type="password" name="confirmacion" value={datos.confirmacion} onChange={cambiar} required />
        </div>

        <button className="btn btn-primary w-100" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrarse'}
        </button>
      </form>

      <p className="text-center mt-3 mb-0 small">
        ¿Ya tiene cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </div>
  );
}
