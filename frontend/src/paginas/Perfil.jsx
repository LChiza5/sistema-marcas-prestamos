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
    return (
      <div className="d-flex align-items-center gap-2 text-secondary">
        <span className="spinner-border spinner-border-sm"></span>
        Cargando perfil…
      </div>
    );
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div className="d-flex align-items-center gap-3">
          <span className="icono-encabezado">
            <i className="bi bi-person-circle"></i>
          </span>
          <div>
            <h1>Mi perfil</h1>
            <p>Consulte y actualice su información personal</p>
          </div>
        </div>

        <Link className="btn btn-outline-primary" to="/cambiar-contrasena">
          <i className="bi bi-shield-lock me-1"></i>
          Cambiar contraseña
        </Link>
      </div>

      {mensajeExito && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill"></i>
          {mensajeExito}
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

      <div className="superficie aparecer" style={{ maxWidth: '40rem' }}>
        <div className="p-4">
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
                <input className="form-control" type="email" value={datos.correo} disabled />
                <div className="form-text">No se puede modificar desde el perfil.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Nombre de usuario</label>
                <input className="form-control" value={datos.usuario} disabled />
                <div className="form-text">No se puede modificar.</div>
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

              <div className="col-12 pt-2">
                <button className="btn btn-primary" disabled={enviando}>
                  {enviando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Guardando…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
