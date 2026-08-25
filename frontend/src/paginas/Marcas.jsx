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
      <div className="encabezado-pagina">
        <div className="d-flex align-items-center gap-3">
          <span className="icono-encabezado">
            <i className="bi bi-fingerprint"></i>
          </span>
          <div>
            <h1>Registro de marcas</h1>
            <p>El sistema determina automáticamente si corresponde una entrada o una salida</p>
          </div>
        </div>
      </div>

      {mensajeExito && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill"></i>
          {mensajeExito}
        </div>
      )}
      {mensajeError && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {mensajeError}
        </div>
      )}

      <div className="superficie-elevada text-center py-5 mb-4 aparecer">
        <p className="text-secondary small text-uppercase fw-bold mb-2" style={{ letterSpacing: '0.06em' }}>
          Próxima marca a registrar
        </p>
        <span className={`insignia-estado ${proximoTipo === 'ENTRADA' ? 'insignia-verde' : 'insignia-ambar'} fs-6 mb-4`}>
          {proximoTipo}
        </span>
        <div>
          <button
            className="btn btn-primary btn-lg px-5"
            onClick={registrarMarca}
            disabled={registrando}
          >
            {registrando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Registrando…
              </>
            ) : (
              <>
                <i className="bi bi-fingerprint me-2"></i>
                Marcar {proximoTipo.toLowerCase()}
              </>
            )}
          </button>
        </div>
        <p className="text-secondary small mt-3 mb-0">
          Si la marca es rechazada por la red actual, es la validación del rango de IP permitido.
        </p>
      </div>

      <div className="superficie aparecer">
        <div className="px-4 pt-3 pb-1 fw-semibold">Marcas de hoy</div>
        {cargando ? (
          <p className="text-secondary p-4 mb-0">Cargando marcas…</p>
        ) : marcas.length === 0 ? (
          <p className="text-secondary p-4 mb-0">Todavía no hay marcas registradas hoy.</p>
        ) : (
          <div className="table-responsive">
            <table className="table tabla-limpia mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Tipo</th>
                  <th>Hora</th>
                  <th>Dispositivo</th>
                  <th className="pe-4">Dirección IP</th>
                </tr>
              </thead>
              <tbody>
                {marcas.map((marca) => (
                  <tr key={marca.id}>
                    <td className="ps-4">
                      <span className={`insignia-estado ${marca.tipo === 'ENTRADA' ? 'insignia-verde' : 'insignia-ambar'}`}>
                        {marca.tipo}
                      </span>
                    </td>
                    <td>{marca.hora}</td>
                    <td>{marca.dispositivo || '—'}</td>
                    <td className="pe-4 text-secondary">{marca.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {esAdministrador && (
        <div className="superficie mt-4 p-4 aparecer">
          <div className="fw-semibold mb-1">
            <i className="bi bi-shield-lock me-1"></i>
            Configuración de red permitida
          </div>
          <p className="text-secondary small">
            IPs o rangos CIDR separados por coma (ej. <code>127.0.0.1, 192.168.1.0/24</code>).
            Use <code>0.0.0.0/0</code> para no restringir, o una IP distinta a la suya para
            forzar el rechazo y probar el mensaje de error.
          </p>

          {mensajeRango && <div className="alert alert-success py-2 small">{mensajeRango}</div>}
          {erroresRango.length > 0 && (
            <div className="alert alert-danger py-2 small">
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
      )}
    </>
  );
}
