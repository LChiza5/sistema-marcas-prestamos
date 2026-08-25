import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

const DATOS_INICIALES = {
  nombre: '',
  descripcion: '',
  encargado: '',
};

/** Punto 7 — Administración de departamentos o carreras. */
export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [idEdicion, setIdEdicion] = useState(null);
  const [errores, setErrores] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  function cargarDepartamentos() {
    setCargando(true);

    api
      .get('/departamentos')
      .then((res) => setDepartamentos(res.datos ?? []))
      .catch((err) => setErrores([err.message]))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  function limpiarFormulario() {
    setDatos(DATOS_INICIALES);
    setIdEdicion(null);
  }

  function seleccionarEdicion(departamento) {
    setDatos({
      nombre: departamento.nombre ?? '',
      descripcion: departamento.descripcion ?? '',
      encargado: departamento.encargado ?? '',
    });

    setIdEdicion(departamento.id);
    setErrores([]);
    setMensajeExito('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function guardar(evento) {
    evento.preventDefault();
    setErrores([]);
    setMensajeExito('');
    setEnviando(true);

    try {
      const res = idEdicion
        ? await api.put(`/departamentos/${idEdicion}`, datos)
        : await api.post('/departamentos', datos);

      setMensajeExito(res.mensaje);
      limpiarFormulario();
      cargarDepartamentos();
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(departamento) {
    const confirmado = window.confirm(
      `¿Desea eliminar el departamento "${departamento.nombre}"?`
    );

    if (!confirmado) return;

    setErrores([]);
    setMensajeExito('');

    try {
      const res = await api.delete(`/departamentos/${departamento.id}`);
      setMensajeExito(res.mensaje);

      if (idEdicion === departamento.id) {
        limpiarFormulario();
      }

      cargarDepartamentos();
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
    }
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div className="d-flex align-items-center gap-3">
          <span className="icono-encabezado">
            <i className="bi bi-diagram-3"></i>
          </span>
          <div>
            <h1>Departamentos o carreras</h1>
            <p>Administración de los departamentos disponibles en el sistema</p>
          </div>
        </div>
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

      <div className="superficie mb-4 aparecer">
        <div className="px-4 pt-4 fw-semibold">
          {idEdicion ? 'Modificar departamento' : 'Registrar departamento'}
        </div>

        <div className="p-4">
          <form onSubmit={guardar}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="nombre"
                  value={datos.nombre}
                  onChange={cambiar}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Encargado</label>
                <input
                  className="form-control"
                  name="encargado"
                  value={datos.encargado}
                  onChange={cambiar}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows="2"
                  name="descripcion"
                  value={datos.descripcion}
                  onChange={cambiar}
                />
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" disabled={enviando}>
                  <i className={`bi ${idEdicion ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                  {enviando
                    ? 'Guardando…'
                    : idEdicion
                      ? 'Guardar cambios'
                      : 'Registrar'}
                </button>

                {idEdicion && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={limpiarFormulario}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="superficie aparecer">
        {cargando ? (
          <p className="text-secondary p-4 mb-0">Cargando departamentos…</p>
        ) : departamentos.length === 0 ? (
          <p className="text-secondary p-4 mb-0">No hay departamentos registrados.</p>
        ) : (
          <div className="table-responsive">
            <table className="table tabla-limpia mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Nombre</th>
                  <th>Descripción</th>
                  <th>Encargado</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {departamentos.map((departamento) => (
                  <tr key={departamento.id}>
                    <td className="ps-4 fw-semibold">{departamento.nombre}</td>
                    <td className="text-secondary">{departamento.descripcion || '—'}</td>
                    <td className="text-secondary">{departamento.encargado || '—'}</td>
                    <td className="text-end pe-4">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => seleccionarEdicion(departamento)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn btn-outline-danger"
                          onClick={() => eliminar(departamento)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-secondary small mt-3">
        <i className="bi bi-info-circle me-1"></i>
        Un departamento con usuarios asociados no puede eliminarse.
      </p>
    </>
  );
}
