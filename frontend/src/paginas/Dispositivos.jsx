import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

const DATOS_INICIALES = {
  nombre: '',
  descripcion: '',
};

/**
 * Punto 9 — Dispositivos autorizados.
 * El usuario en sesión administra los dispositivos desde los cuales puede
 * marcar. El identificador único NO se genera en el navegador: lo crea el
 * servidor al registrar el dispositivo y lo guarda en una cookie httpOnly,
 * que luego se usa (de forma transparente) al registrar una marca.
 */
export default function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [idEdicion, setIdEdicion] = useState(null);
  const [estadoEdicion, setEstadoEdicion] = useState('ACTIVO');
  const [errores, setErrores] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  function cargarDispositivos() {
    setCargando(true);

    api
      .get('/dispositivos')
      .then((res) => setDispositivos(res.datos ?? []))
      .catch((err) => setErrores([err.message]))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarDispositivos();
  }, []);

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  function limpiarFormulario() {
    setDatos(DATOS_INICIALES);
    setEstadoEdicion('ACTIVO');
    setIdEdicion(null);
  }

  function seleccionarEdicion(dispositivo) {
    setDatos({
      nombre: dispositivo.nombre ?? '',
      descripcion: dispositivo.descripcion ?? '',
    });
    setEstadoEdicion(dispositivo.estado);
    setIdEdicion(dispositivo.id);
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
        ? await api.put(`/dispositivos/${idEdicion}`, { ...datos, estado: estadoEdicion })
        : await api.post('/dispositivos', datos);

      setMensajeExito(res.mensaje);
      limpiarFormulario();
      cargarDispositivos();
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(dispositivo) {
    const confirmado = window.confirm(
      `¿Desea eliminar el dispositivo "${dispositivo.nombre}"?`
    );

    if (!confirmado) return;

    setErrores([]);
    setMensajeExito('');

    try {
      const res = await api.delete(`/dispositivos/${dispositivo.id}`);
      setMensajeExito(res.mensaje);

      if (idEdicion === dispositivo.id) {
        limpiarFormulario();
      }

      cargarDispositivos();
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h4 mb-1">
          <i className="bi bi-phone me-2"></i>
          Mis dispositivos autorizados
        </h1>
        <p className="text-secondary mb-0">
          Dispositivos desde los cuales puede registrar sus marcas de entrada y salida.
          El dispositivo registrado más reciente que siga activo es el que se asociará
          automáticamente a sus próximas marcas.
        </p>
      </div>

      {mensajeExito && <div className="alert alert-success">{mensajeExito}</div>}

      {errores.length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0 ps-3">
            {errores.map((mensaje) => (
              <li key={mensaje}>{mensaje}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header fw-semibold">
          {idEdicion ? 'Modificar dispositivo' : 'Registrar este dispositivo'}
        </div>

        <div className="card-body">
          <form onSubmit={guardar}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="nombre"
                  placeholder="Ej. Laptop personal"
                  value={datos.nombre}
                  onChange={cambiar}
                  maxLength={100}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Descripción</label>
                <input
                  className="form-control"
                  name="descripcion"
                  placeholder="Opcional"
                  value={datos.descripcion}
                  onChange={cambiar}
                  maxLength={255}
                />
              </div>

              {idEdicion && (
                <div className="col-md-4">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={estadoEdicion}
                    onChange={(e) => setEstadoEdicion(e.target.value)}
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              )}

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" disabled={enviando}>
                  <i className={`bi ${idEdicion ? 'bi-floppy' : 'bi-plus-circle'} me-1`}></i>
                  {enviando ? 'Guardando…' : idEdicion ? 'Guardar cambios' : 'Registrar dispositivo'}
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

      <div className="card">
        <div className="card-body p-0">
          {cargando ? (
            <p className="text-secondary p-3 mb-0">Cargando dispositivos…</p>
          ) : dispositivos.length === 0 ? (
            <p className="text-secondary p-3 mb-0">
              Aún no ha registrado ningún dispositivo.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Registrado</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dispositivos.map((dispositivo) => (
                    <tr key={dispositivo.id}>
                      <td className="fw-semibold">{dispositivo.nombre}</td>
                      <td>{dispositivo.descripcion || '—'}</td>
                      <td>{new Date(dispositivo.fecha_registro).toLocaleString('es-CR')}</td>
                      <td>
                        <span
                          className={`badge ${
                            dispositivo.estado === 'ACTIVO' ? 'text-bg-success' : 'text-bg-secondary'
                          }`}
                        >
                          {dispositivo.estado}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => seleccionarEdicion(dispositivo)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Editar
                          </button>

                          <button
                            className="btn btn-outline-danger"
                            onClick={() => eliminar(dispositivo)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Eliminar
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
      </div>

      <p className="text-secondary small mt-3">
        Nota: por seguridad del navegador no es posible leer la dirección MAC real del
        equipo; el identificador único de cada dispositivo lo genera el servidor y se
        guarda en una cookie <code>id_dispositivo</code>.
      </p>
    </>
  );
}
