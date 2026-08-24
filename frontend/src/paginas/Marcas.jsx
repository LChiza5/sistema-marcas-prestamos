import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Punto 8 — Registro de marcas (entrada/salida automática).
 * Punto 10 — Validación de ubicación de red (el backend responde 403 si la
 * IP actual no está dentro de los rangos configurados).
 */
export default function Marcas() {
  const { esAdministrador } = useAuth();

  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Panel opcional para el administrador: permite configurar el rango de IP
  // permitido para poder probar el punto 10 sin tocar la base de datos.
  const [rangoIp, setRangoIp] = useState('');
  const [rangoIpGuardado, setRangoIpGuardado] = useState('');
  const [guardandoRango, setGuardandoRango] = useState(false);
  const [erroresRango, setErroresRango] = useState([]);
  const [mensajeRango, setMensajeRango] = useState('');

  function cargarMarcas() {
    setCargando(true);
    api
      .get('/marcas/hoy')
      .then((res) => setMarcas(res.datos ?? []))
      .catch((err) => setMensajeError(err.message))
      .finally(() => setCargando(false));
  }

  function cargarConfiguracion() {
    if (!esAdministrador) return;
    api
      .get('/configuracion')
      .then((res) => {
        const parametro = (res.datos ?? []).find((p) => p.clave === 'rangos_ip_permitidos');
        const valor = parametro?.valor ?? '';
        setRangoIp(valor);
        setRangoIpGuardado(valor);
      })
      .catch(() => {});
  }

  useEffect(() => {
    cargarMarcas();
    cargarConfiguracion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function registrarMarca() {
    setMensajeExito('');
    setMensajeError('');
    setRegistrando(true);

    try {
      const res = await api.post('/marcas', {});
      setMensajeExito(res.mensaje);
      cargarMarcas();
    } catch (err) {
      setMensajeError(err.message);
    } finally {
      setRegistrando(false);
    }
  }

  async function guardarRango(evento) {
    evento.preventDefault();
    setErroresRango([]);
    setMensajeRango('');
    setGuardandoRango(true);

    try {
      const res = await api.put('/configuracion/rangos_ip_permitidos', { valor: rangoIp });
      setMensajeRango(res.mensaje);
      setRangoIpGuardado(res.datos?.valor ?? rangoIp);
    } catch (err) {
      setErroresRango(err.errores ?? [err.message]);
    } finally {
      setGuardandoRango(false);
    }
  }

  const ultimaMarca = marcas[0] ?? null;
  const proximoTipo = !ultimaMarca || ultimaMarca.tipo === 'SALIDA' ? 'ENTRADA' : 'SALIDA';

  return (
    <>
      <div className="mb-4">
        <h1 className="h4 mb-1">
          <i className="bi bi-clock-history me-2"></i>
          Registro de marcas
        </h1>
        <p className="text-secondary mb-0">
          El servidor determina automáticamente si corresponde una entrada o una
          salida, según su última marca del día.
        </p>
      </div>

      {mensajeExito && <div className="alert alert-success">{mensajeExito}</div>}
      {mensajeError && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {mensajeError}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body text-center py-4">
          <p className="text-secondary mb-2">Próxima marca a registrar</p>
          <span
            className={`badge fs-6 mb-3 ${
              proximoTipo === 'ENTRADA' ? 'text-bg-success' : 'text-bg-warning'
            }`}
          >
            {proximoTipo}
          </span>
          <div>
            <button
              className="btn btn-primary btn-lg"
              onClick={registrarMarca}
              disabled={registrando}
            >
              <i className="bi bi-fingerprint me-2"></i>
              {registrando ? 'Registrando…' : `Marcar ${proximoTipo.toLowerCase()}`}
            </button>
          </div>
          <p className="text-secondary small mt-3 mb-0">
            Si la marca falla con un mensaje sobre la red actual, es la validación
            del punto 10 (rango de IP permitido) rechazando la solicitud.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header fw-semibold">Marcas de hoy</div>
        <div className="card-body p-0">
          {cargando ? (
            <p className="text-secondary p-3 mb-0">Cargando marcas…</p>
          ) : marcas.length === 0 ? (
            <p className="text-secondary p-3 mb-0">Todavía no hay marcas registradas hoy.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tipo</th>
                    <th>Hora</th>
                    <th>Dispositivo</th>
                    <th>Dirección IP</th>
                  </tr>
                </thead>
                <tbody>
                  {marcas.map((marca) => (
                    <tr key={marca.id}>
                      <td>
                        <span
                          className={`badge ${
                            marca.tipo === 'ENTRADA' ? 'text-bg-success' : 'text-bg-warning'
                          }`}
                        >
                          {marca.tipo}
                        </span>
                      </td>
                      <td>{marca.hora}</td>
                      <td>{marca.dispositivo || '—'}</td>
                      <td>{marca.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {esAdministrador && (
        <div className="card mt-4">
          <div className="card-header fw-semibold">
            <i className="bi bi-shield-lock me-1"></i>
            Configuración de red permitida (punto 10)
          </div>
          <div className="card-body">
            <p className="text-secondary small">
              IPs o rangos CIDR separados por coma (ej. <code>127.0.0.1, 192.168.1.0/24</code>).
              Déjelo vacío y guarde con un valor amplio como <code>0.0.0.0/0</code> para no
              restringir, o ponga una IP distinta a la suya para forzar el rechazo y probar
              el mensaje de error.
            </p>

            {mensajeRango && <div className="alert alert-success py-2">{mensajeRango}</div>}
            {erroresRango.length > 0 && (
              <div className="alert alert-danger py-2">
                <ul className="mb-0 ps-3">
                  {erroresRango.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <form className="row g-2 align-items-end" onSubmit={guardarRango}>
              <div className="col-md-8">
                <label className="form-label">Rangos permitidos</label>
                <input
                  className="form-control"
                  value={rangoIp}
                  onChange={(e) => setRangoIp(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button className="btn btn-outline-primary w-100" disabled={guardandoRango}>
                  {guardandoRango ? 'Guardando…' : 'Guardar rango'}
                </button>
              </div>
            </form>

            {rangoIpGuardado && (
              <p className="text-secondary small mt-2 mb-0">
                Valor actual guardado: <code>{rangoIpGuardado}</code>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
