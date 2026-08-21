import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

/** Puntos 17 y 18 — Registro de préstamo (encabezado + detalle). */
export default function Prestamos() {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [idUsuario, setIdUsuario] = useState('');
  const [seleccionados, setSeleccionados] = useState({}); // { [idEquipo]: descripcion }

  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [ultimoPrestamo, setUltimoPrestamo] = useState(null);

  useEffect(() => {
    cargarEquiposDisponibles();
  }, []);

  function cargarEquiposDisponibles() {
    setCargando(true);
    api
      .get('/equipos')
      .then((res) => setEquipos(res.datos.filter((equipo) => equipo.estado === 'DISPONIBLE')))
      .catch(() => setEquipos([]))
      .finally(() => setCargando(false));
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
    setErrores([]);
    setUltimoPrestamo(null);

    const idsSeleccionados = Object.keys(seleccionados);
    if (idsSeleccionados.length === 0) {
      setErrores(['Debe seleccionar al menos un equipo']);
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
      cargarEquiposDisponibles(); // los equipos prestados ya no deben aparecer en la lista
    } catch (err) {
      setErrores(err.errores ?? [err.message]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <h1 className="h4 mb-4">
        <i className="bi bi-clipboard-check me-2"></i>
        Registrar préstamo
      </h1>

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

      {errores.length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0 ps-3">
            {errores.map((texto) => (
              <li key={texto}>{texto}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={registrarPrestamo}>
        <div className="card mb-4">
          <div className="card-body">
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
              {/* TODO: reemplazar por un buscador de usuarios cuando exista
                  GET /api/usuarios (módulo de Sander, puntos 4-7). Por ahora
                  se puede consultar el id del usuario en phpMyAdmin. */}
              Por ahora se ingresa manualmente; consulta el id en phpMyAdmin si no lo tienes a mano.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="h6 mb-3">Equipos disponibles</h2>

            {cargando ? (
              <p className="text-secondary mb-0">Cargando…</p>
            ) : equipos.length === 0 ? (
              <p className="text-secondary mb-0">No hay equipos disponibles en este momento.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
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
                          <td>{equipo.codigo}</td>
                          <td>{equipo.descripcion}</td>
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

            <button className="btn btn-primary mt-3" disabled={enviando}>
              {enviando ? 'Registrando…' : 'Registrar préstamo'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}