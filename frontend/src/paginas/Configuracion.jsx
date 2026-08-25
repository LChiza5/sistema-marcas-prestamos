import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

const ETIQUETAS = {
  nombre_institucion: { icono: 'bi-building', titulo: 'Nombre de la institución' },
  rangos_ip_permitidos: { icono: 'bi-hdd-network', titulo: 'Rangos de IP permitidos para marcar' },
  minutos_sesion: { icono: 'bi-hourglass-split', titulo: 'Minutos máximos de una sesión' },
  tamano_max_archivo_mb: { icono: 'bi-file-earmark-arrow-up', titulo: 'Tamaño máximo de archivo (MB)' },
};

/** Módulo de configuración — parámetros generales del sistema. */
export default function Configuracion() {
  const [parametros, setParametros] = useState([]);
  const [valores, setValores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState('');
  const [mensaje, setMensaje] = useState(null); // { tipo, texto }

  function cargar() {
    setCargando(true);
    api
      .get('/configuracion')
      .then((res) => {
        const datos = res.datos ?? [];
        setParametros(datos);
        setValores(Object.fromEntries(datos.map((p) => [p.clave, p.valor])));
      })
      .catch((err) => setMensaje({ tipo: 'danger', texto: err.message }))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardar(clave) {
    setGuardando(clave);
    setMensaje(null);
    try {
      await api.put(`/configuracion/${clave}`, { valor: valores[clave] });
      setMensaje({ tipo: 'success', texto: 'Parámetro actualizado correctamente' });
      cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.errores?.join(', ') ?? err.message });
    } finally {
      setGuardando('');
    }
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div className="d-flex align-items-center gap-3">
          <span className="icono-encabezado">
            <i className="bi bi-gear"></i>
          </span>
          <div>
            <h1>Configuración del sistema</h1>
            <p>Ajuste los parámetros generales que gobiernan el comportamiento de la plataforma</p>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} d-flex align-items-center gap-2`}>
          <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
          {mensaje.texto}
        </div>
      )}

      {cargando ? (
        <p className="text-secondary">Cargando configuración…</p>
      ) : (
        <div className="row g-3">
          {parametros.map((parametro) => {
            const meta = ETIQUETAS[parametro.clave] ?? { icono: 'bi-sliders', titulo: parametro.clave };

            return (
              <div className="col-md-6" key={parametro.clave}>
                <div className="superficie h-100 p-4 aparecer">
                  <div className="d-flex align-items-center gap-2 mb-1 fw-semibold">
                    <i className={`bi ${meta.icono} text-secondary`}></i>
                    {meta.titulo}
                  </div>
                  {parametro.descripcion && (
                    <p className="text-secondary small mb-3">{parametro.descripcion}</p>
                  )}

                  <div className="d-flex gap-2">
                    <input
                      className="form-control"
                      value={valores[parametro.clave] ?? ''}
                      onChange={(evento) =>
                        setValores({ ...valores, [parametro.clave]: evento.target.value })
                      }
                    />
                    <button
                      className="btn btn-outline-primary flex-shrink-0"
                      disabled={guardando === parametro.clave}
                      onClick={() => guardar(parametro.clave)}
                    >
                      {guardando === parametro.clave ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="bi bi-check-lg"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
