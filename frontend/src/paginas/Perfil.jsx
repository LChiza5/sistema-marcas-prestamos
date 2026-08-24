import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/cliente.js';
import { useAuth } from '../context/AuthContext.jsx';

const DATOS_INICIALES = {
  nombreCompleto: '',
  fechaNacimiento: '',
  correo: '',
  usuario: '',
  idDepartamento: '',
};

/** Punto 4 — Consulta y modificación del perfil del usuario. */
export default function Perfil() {
  const { actualizarUsuario } = useAuth();

  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [departamentos, setDepartamentos] = useState([]);
  const [errores, setErrores] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/usuarios/perfil'),
      api.get('/departamentos'),
    ])
      .then(([resPerfil, resDepartamentos]) => {
        setDatos({
          nombreCompleto: resPerfil.datos.nombreCompleto ?? '',
          fechaNacimiento: resPerfil.datos.fechaNacimiento ?? '',
          correo: resPerfil.datos.correo ?? '',
          usuario: resPerfil.datos.usuario ?? '',
          idDepartamento: String(resPerfil.datos.idDepartamento ?? ''),
        });

        setDepartamentos(resDepartamentos.datos ?? []);
      })
      .catch((err) => setErrores([err.message]))
      .finally(() => setCargando(false));
  }, []);

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  async function guardar(evento) {
    evento.preventDefault();
    setErrores([]);
    setMensajeExito('');
    setEnviando(true);

    try {
      const res = await api.put('/usuarios/perfil', {
        nombreCompleto: datos.nombreCompleto,
        fechaNacimiento: datos.fechaNacimiento,
        idDepartamento: datos.idDepartamento,
      });

      actualizarUsuario({
        nombreCompleto: datos.nombreCompleto.trim(),
      });

      setMensajeExito(res.mensaje);
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return <p className="text-secondary">Cargando perfil…</p>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h4 mb-1">
            <i className="bi bi-person-circle me-2"></i>
            Mi perfil
          </h1>
          <p className="text-secondary mb-0">
            Consulte y actualice su información personal.
          </p>
        </div>

        <Link className="btn btn-outline-primary" to="/cambiar-contrasena">
          <i className="bi bi-key me-1"></i>
          Cambiar contraseña
        </Link>
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
          <form onSubmit={guardar}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre completo</label>
                <input
                  className="form-control"
                  name="nombreCompleto"
                  value={datos.nombreCompleto}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Fecha de nacimiento</label>
                <input
                  className="form-control"
                  type="date"
                  name="fechaNacimiento"
                  value={datos.fechaNacimiento}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo electrónico</label>
                <input
                  className="form-control"
                  type="email"
                  value={datos.correo}
                  disabled
                />
                <div className="form-text">
                  El correo no se puede modificar desde el perfil.
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Nombre de usuario</label>
                <input
                  className="form-control"
                  value={datos.usuario}
                  disabled
                />
                <div className="form-text">
                  El nombre de usuario no se puede modificar.
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Departamento o carrera</label>
                <select
                  className="form-select"
                  name="idDepartamento"
                  value={datos.idDepartamento}
                  onChange={cambiar}
                  required
                >
                  <option value="">Seleccione una opción</option>
                  {departamentos.map((departamento) => (
                    <option key={departamento.id} value={departamento.id}>
                      {departamento.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <button className="btn btn-primary" disabled={enviando}>
                  <i className="bi bi-floppy me-1"></i>
                  {enviando ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
