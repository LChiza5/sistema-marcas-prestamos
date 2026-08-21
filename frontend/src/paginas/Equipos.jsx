import { useEffect, useState } from 'react';
import { api, API_ORIGEN } from '../api/cliente.js';

const DATOS_INICIALES = { codigo: '', descripcion: '' };

const COLOR_ESTADO = {
  DISPONIBLE: 'success',
  PRESTADO: 'warning',
  MANTENIMIENTO: 'secondary',
  INACTIVO: 'dark',
};

const ESTADOS_EDITABLES = ['DISPONIBLE', 'MANTENIMIENTO', 'INACTIVO'];

/** Puntos 14, 15 y 16 — Inventario de equipos, carga de imágenes y consulta. */
export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [archivo, setArchivo] = useState(null);
  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const [mensaje, setMensaje] = useState(null); // { tipo: 'success' | 'danger', texto }

  useEffect(() => {
    cargarEquipos();
  }, []);

  function cargarEquipos() {
    setCargando(true);
    api
      .get('/equipos')
      .then((res) => setEquipos(res.datos))
      .catch(() => setEquipos([]))
      .finally(() => setCargando(false));
  }

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  /** Registro de un equipo nuevo (punto 14), con imagen opcional (punto 15). */
  async function registrar(evento) {
    evento.preventDefault();
    setErrores([]);
    setMensaje(null);
    setEnviando(true);

    const formData = new FormData();
    formData.append('codigo', datos.codigo);
    formData.append('descripcion', datos.descripcion);
    if (archivo) formData.append('imagen', archivo);

    try {
      await api.postForm('/equipos', formData);
      setDatos(DATOS_INICIALES);
      setArchivo(null);
      evento.target.reset(); // limpia el input file, que es un componente no controlado
      setMensaje({ tipo: 'success', texto: 'Equipo registrado correctamente' });
      cargarEquipos();
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
    } finally {
      setEnviando(false);
    }
  }

  /** Cambia únicamente el estado de un equipo, conservando su descripción actual. */
  async function cambiarEstado(equipo, nuevoEstado) {
    setMensaje(null);
    try {
      await api.put(`/equipos/${equipo.id}`, { descripcion: equipo.descripcion, estado: nuevoEstado });
      cargarEquipos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  }

  /** Reemplaza la imagen de un equipo existente (punto 15). */
  async function reemplazarImagen(equipo, evento) {
    const nuevoArchivo = evento.target.files[0];
    if (!nuevoArchivo) return;

    const formData = new FormData();
    formData.append('imagen', nuevoArchivo);

    setMensaje(null);
    try {
      await api.putForm(`/equipos/${equipo.id}/imagen`, formData);
      setMensaje({ tipo: 'success', texto: 'Imagen actualizada correctamente' });
      cargarEquipos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    } finally {
      evento.target.value = ''; // permite volver a elegir el mismo archivo si hace falta
    }
  }

  async function eliminar(equipo) {
    if (!confirm(`¿Eliminar el equipo ${equipo.codigo}?`)) return;

    setMensaje(null);
    try {
      await api.delete(`/equipos/${equipo.id}`);
      setMensaje({ tipo: 'success', texto: 'Equipo eliminado correctamente' });
      cargarEquipos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  }

  return (
    <>
      <h1 className="h4 mb-4">
        <i className="bi bi-box-seam me-2"></i>
        Inventario de equipos
      </h1>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo}`} role="alert">
          {mensaje.texto}
        </div>
      )}

      {/* Punto 14 y 15 — Registro de un equipo nuevo, con imagen opcional. */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h6 mb-3">Registrar equipo</h2>

          {errores.length > 0 && (
            <div className="alert alert-danger">
              <ul className="mb-0 ps-3">
                {errores.map((texto) => (
                  <li key={texto}>{texto}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={registrar} className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Código</label>
              <input className="form-control" name="codigo" value={datos.codigo} onChange={cambiar} required />
            </div>

            <div className="col-md-4">
              <label className="form-label">Descripción</label>
              <input className="form-control" name="descripcion" value={datos.descripcion} onChange={cambiar} required />
            </div>

            <div className="col-md-3">
              <label className="form-label">Imagen (opcional)</label>
              <input
                className="form-control"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(evento) => setArchivo(evento.target.files[0] ?? null)}
              />
            </div>

            <div className="col-md-2">
              <button className="btn btn-primary w-100" disabled={enviando}>
                {enviando ? 'Guardando…' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Punto 16 — Consulta del inventario. */}
      <div className="card">
        <div className="card-body">
          <h2 className="h6 mb-3">Equipos registrados</h2>

          {cargando ? (
            <p className="text-secondary mb-0">Cargando…</p>
          ) : equipos.length === 0 ? (
            <p className="text-secondary mb-0">Todavía no hay equipos registrados.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((equipo) => {
                    // El estado PRESTADO lo controla el módulo de préstamos:
                    // mientras un equipo está prestado no se puede cambiar
                    // manualmente su estado ni eliminarlo (punto 16).
                    const bloqueadoPorPrestamo = equipo.estado === 'PRESTADO';

                    return (
                      <tr key={equipo.id}>
                        <td>
                          {equipo.imagen ? (
                            <img
                              src={`${API_ORIGEN}/uploads/equipos/${equipo.imagen}`}
                              alt={equipo.codigo}
                              width={48}
                              height={48}
                              className="rounded object-fit-cover"
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center bg-light rounded text-secondary"
                              style={{ width: 48, height: 48 }}
                            >
                              <i className="bi bi-image"></i>
                            </div>
                          )}
                        </td>

                        <td>{equipo.codigo}</td>
                        <td>{equipo.descripcion}</td>

                        <td>
                          <span className={`badge text-bg-${COLOR_ESTADO[equipo.estado]}`}>{equipo.estado}</span>
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <select
                              className="form-select form-select-sm"
                              style={{ width: '9rem' }}
                              value={equipo.estado}
                              disabled={bloqueadoPorPrestamo}
                              onChange={(evento) => cambiarEstado(equipo, evento.target.value)}
                            >
                              {bloqueadoPorPrestamo && <option value="PRESTADO">PRESTADO</option>}
                              {ESTADOS_EDITABLES.map((estado) => (
                                <option key={estado} value={estado}>
                                  {estado}
                                </option>
                              ))}
                            </select>

                            <label
                              className={`btn btn-sm btn-outline-secondary mb-0 ${bloqueadoPorPrestamo ? 'disabled' : ''}`}
                              title="Reemplazar imagen"
                            >
                              <i className="bi bi-upload"></i>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                                disabled={bloqueadoPorPrestamo}
                                onChange={(evento) => reemplazarImagen(equipo, evento)}
                              />
                            </label>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              disabled={bloqueadoPorPrestamo}
                              title={bloqueadoPorPrestamo ? 'No se puede eliminar un equipo prestado' : 'Eliminar'}
                              onClick={() => eliminar(equipo)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}