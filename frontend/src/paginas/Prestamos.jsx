import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

export default function Prestamos() {
  const [pestana, setPestana] = useState('nuevo'); // 'nuevo' | 'historial'

  // Estado para registrar préstamo (puntos 17 y 18 - Sebastián)
  const [equipos, setEquipos] = useState([]);
  const [cargandoEquipos, setCargandoEquipos] = useState(true);
  const [idUsuario, setIdUsuario] = useState('');
  const [seleccionados, setSeleccionados] = useState({});
  const [erroresRegistro, setErroresRegistro] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [ultimoPrestamo, setUltimoPrestamo] = useState(null);

  // Estado para historial y devoluciones (puntos 19 y 20 - Duvan)
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState(null);
  const [filtrosHistorial, setFiltrosHistorial] = useState({
    usuario: '',
    fecha: '',
    estado: '',
    equipo: '',
  });

  useEffect(() => {
    if (pestana === 'nuevo') {
      cargarEquiposDisponibles();
    } else {
      cargarHistorial();
    }
  }, [pestana]);

  function cargarEquiposDisponibles() {
    setCargandoEquipos(true);
    api
      .get('/equipos')
      .then((res) => setEquipos((res.datos || []).filter((equipo) => equipo.estado === 'DISPONIBLE')))
      .catch(() => setEquipos([]))
      .finally(() => setCargandoEquipos(false));
  }

  function cargarHistorial(filtros = filtrosHistorial) {
    setCargandoHistorial(true);
    setErrorHistorial(null);

    const params = new URLSearchParams();
    if (filtros.usuario) params.append('usuario', filtros.usuario.trim());
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.equipo) params.append('equipo', filtros.equipo);

    const queryStr = params.toString();
    api
      .get(`/prestamos${queryStr ? `?${queryStr}` : ''}`)
      .then((res) => setHistorial(res.datos || []))
      .catch((err) => setErrorHistorial(err.message || 'Error al obtener el historial de préstamos'))
      .finally(() => setCargandoHistorial(false));
  }

  function alternarSeleccion(idEquipo) {
    setSeleccionados((actual) => {
      const copia = { ...actual };
      if (idEquipo in copia) {
        delete copia[idEquipo];
      } else {
        copia[idEquipo] = '';
      }
      return copia;
    });
  }

  function cambiarDescripcion(idEquipo, texto) {
    setSeleccionados((actual) => ({ ...actual, [idEquipo]: texto }));
  }

  async function registrarPrestamo(evento) {
    evento.preventDefault();
    setErroresRegistro([]);
    setUltimoPrestamo(null);

    const idsSeleccionados = Object.keys(seleccionados);
    if (idsSeleccionados.length === 0) {
      setErroresRegistro(['Debe seleccionar al menos un equipo']);
      return;
    }

    setEnviando(true);
    try {
      const res = await api.post('/prestamos', {
        idUsuario: Number(idUsuario),
        equipos: idsSeleccionados.map((id) => ({
          id: Number(id),
          descripcion: seleccionados[id]?.trim() || undefined,
        })),
      });

      setUltimoPrestamo(res.datos);
      setIdUsuario('');
      setSeleccionados({});
      cargarEquiposDisponibles();
    } catch (err) {
      setErroresRegistro(err.errores ?? [err.message]);
    } finally {
      setEnviando(false);
    }
  }

  async function devolverEquipoIndividual(idPrestamo, idEquipo) {
    try {
      await api.put(`/prestamos/${idPrestamo}/devolver/${idEquipo}`);
      cargarHistorial();
    } catch (err) {
      alert(err.message || 'No fue posible devolver el equipo');
    }
  }

  async function devolverPrestamoCompleto(idPrestamo) {
    if (!confirm('¿Desea devolver todos los equipos de este préstamo?')) return;
    try {
      await api.put(`/prestamos/${idPrestamo}/devolver`);
      cargarHistorial();
    } catch (err) {
      alert(err.message || 'No fue posible devolver el préstamo completo');
    }
  }

  function handleCambioFiltroHistorial(e) {
    const { name, value } = e.target;
    setFiltrosHistorial((prev) => ({ ...prev, [name]: value }));
  }

  function handleBuscarHistorial(e) {
    e.preventDefault();
    cargarHistorial();
  }

  function handleLimpiarHistorial() {
    const limpios = { usuario: '', fecha: '', estado: '', equipo: '' };
    setFiltrosHistorial(limpios);
    cargarHistorial(limpios);
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div className="d-flex align-items-center gap-3">
          <span className="icono-encabezado">
            <i className="bi bi-arrow-left-right"></i>
          </span>
          <div>
            <h1>Préstamos</h1>
            <p>Registre préstamos de equipos y administre devoluciones</p>
          </div>
        </div>

        <ul className="nav nav-pills gap-2">
          <li className="nav-item">
            <button
              className={`btn btn-sm ${pestana === 'nuevo' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setPestana('nuevo')}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Registrar préstamo
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm ${pestana === 'historial' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setPestana('historial')}
            >
              <i className="bi bi-clock-history me-1"></i>
              Historial y devoluciones
            </button>
          </li>
        </ul>
      </div>

      {/* PESTAÑA 1: REGISTRAR PRÉSTAMO */}
      {pestana === 'nuevo' && (
        <>
          {ultimoPrestamo && (
            <div className="alert alert-success">
              <strong>Préstamo {ultimoPrestamo.numero} registrado correctamente.</strong>
              <ul className="mb-0 mt-2 ps-3">
                {ultimoPrestamo.detalle.map((linea) => (
                  <li key={linea.id}>{linea.codigo}</li>
                ))}
              </ul>
            </div>
          )}

          {erroresRegistro.length > 0 && (
            <div className="alert alert-danger">
              <ul className="mb-0 ps-3">
                {erroresRegistro.map((texto) => (
                  <li key={texto}>{texto}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={registrarPrestamo}>
            <div className="superficie mb-4 aparecer">
              <div className="p-4">
                <label className="form-label">ID del usuario</label>
                <input
                  className="form-control"
                  style={{ maxWidth: '12rem' }}
                  type="number"
                  min="1"
                  value={idUsuario}
                  onChange={(evento) => setIdUsuario(evento.target.value)}
                  required
                />
                <div className="form-text">
                  Ingrese el ID del usuario que solicita el préstamo.
                </div>
              </div>
            </div>

            <div className="superficie aparecer">
              <div className="px-4 pt-4 fw-bold h6">Equipos disponibles</div>

              <div className="p-4 pt-3">
                {cargandoEquipos ? (
                  <p className="text-secondary mb-0">Cargando…</p>
                ) : equipos.length === 0 ? (
                  <p className="text-secondary mb-0">No hay equipos disponibles en este momento.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table tabla-limpia mb-3">
                      <thead>
                        <tr>
                          <th style={{ width: '2.5rem' }}></th>
                          <th>Código</th>
                          <th>Descripción</th>
                          <th>Nota del préstamo (opcional)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipos.map((equipo) => {
                          const seleccionado = equipo.id in seleccionados;
                          return (
                            <tr key={equipo.id}>
                              <td>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={seleccionado}
                                  onChange={() => alternarSeleccion(equipo.id)}
                                />
                              </td>
                              <td className="fw-semibold">{equipo.codigo}</td>
                              <td className="text-secondary">{equipo.descripcion}</td>
                              <td>
                                <input
                                  className="form-control form-control-sm"
                                  disabled={!seleccionado}
                                  value={seleccionados[equipo.id] ?? ''}
                                  onChange={(evento) => cambiarDescripcion(equipo.id, evento.target.value)}
                                  placeholder="Ej. Para clase de física"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <button className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Registrando…' : 'Registrar préstamo'}
                </button>
              </div>
            </div>
          </form>
        </>
      )}

      {/* PESTAÑA 2: HISTORIAL Y DEVOLUCIONES */}
      {pestana === 'historial' && (
        <>
          <div className="superficie mb-4 p-4 aparecer">
            <form onSubmit={handleBuscarHistorial} className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Nombre o ID del usuario</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="usuario"
                  value={filtrosHistorial.usuario}
                  onChange={handleCambioFiltroHistorial}
                  placeholder="Ej. Victor o ID (1, 2)"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  name="fecha"
                  value={filtrosHistorial.fecha}
                  onChange={handleCambioFiltroHistorial}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Estado del préstamo</label>
                <select
                  className="form-select form-select-sm"
                  name="estado"
                  value={filtrosHistorial.estado}
                  onChange={handleCambioFiltroHistorial}
                >
                  <option value="">Todos los estados</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Código de equipo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="equipo"
                  value={filtrosHistorial.equipo}
                  onChange={handleCambioFiltroHistorial}
                  placeholder="Ej. EQ-001"
                />
              </div>
              <div className="col-12 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLimpiarHistorial}>
                  <i className="bi bi-x-lg me-1"></i> Limpiar
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <i className="bi bi-search me-1"></i> Buscar
                </button>
              </div>
            </form>
          </div>

          {errorHistorial && <div className="alert alert-danger">{errorHistorial}</div>}

          {cargandoHistorial ? (
            <p className="text-secondary">Cargando historial…</p>
          ) : historial.length === 0 ? (
            <div className="alert alert-info">No se encontraron préstamos con los filtros seleccionados.</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {historial.map((item) => {
                const tienePendientes = item.detalle.some((d) => d.estado_devolucion === 'PENDIENTE');

                return (
                  <div key={item.id} className="superficie aparecer">
                    <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <strong className="me-2">{item.numero}</strong>
                        <span className={`insignia-estado ${item.estado === 'ACTIVO' ? 'insignia-ambar' : 'insignia-gris'} me-2`}>
                          {item.estado}
                        </span>
                        <small className="text-secondary">
                          Usuario: <strong>{item.usuario}</strong> · Encargado: {item.encargado} · Fecha:{' '}
                          {new Date(item.fecha).toLocaleString('es-CR')}
                        </small>
                      </div>
                      {item.estado === 'ACTIVO' && tienePendientes && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => devolverPrestamoCompleto(item.id)}
                        >
                          <i className="bi bi-box-arrow-in-left me-1"></i> Devolver todo
                        </button>
                      )}
                    </div>
                    <div className="table-responsive">
                      <table className="table tabla-limpia mb-0">
                        <thead>
                          <tr>
                            <th className="ps-4" style={{ width: '15%' }}>Código</th>
                            <th style={{ width: '35%' }}>Descripción / Nota</th>
                            <th style={{ width: '20%' }}>Estado</th>
                            <th style={{ width: '15%' }}>Fecha devolución</th>
                            <th style={{ width: '15%' }} className="text-end pe-4">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.detalle.map((d) => (
                            <tr key={d.id}>
                              <td className="ps-4 fw-semibold">{d.codigo}</td>
                              <td className="text-secondary">{d.nota || d.descripcion_equipo || '—'}</td>
                              <td>
                                {d.estado_devolucion === 'PENDIENTE' ? (
                                  <span className="insignia-estado insignia-ambar">PENDIENTE</span>
                                ) : (
                                  <span className="insignia-estado insignia-verde">DEVUELTO</span>
                                )}
                              </td>
                              <td className="text-secondary">
                                {d.fecha_devolucion
                                  ? new Date(d.fecha_devolucion).toLocaleString('es-CR')
                                  : '—'}
                              </td>
                              <td className="text-end pe-4">
                                {d.estado_devolucion === 'PENDIENTE' && (
                                  <button
                                    className="btn btn-sm btn-outline-primary py-0"
                                    onClick={() => devolverEquipoIndividual(item.id, d.id_equipo)}
                                  >
                                    Devolver
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}
