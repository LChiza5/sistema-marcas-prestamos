import { useEffect, useState } from 'react';
import { api, API_URL } from '../api/cliente.js';

export default function Reportes() {
  const [marcas, setMarcas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    usuario: '',
    anio: '',
    mes: '',
    dia: '',
    departamento: '',
  });

  useEffect(() => {
    cargarDepartamentos();
    cargarMarcas();
  }, []);

  function cargarDepartamentos() {
    api
      .get('/departamentos')
      .then((res) => setDepartamentos(res.datos || []))
      .catch(() => setDepartamentos([]));
  }

  function cargarMarcas(filtrosAplicar = filtros) {
    setCargando(true);
    setError(null);

    const params = new URLSearchParams();
    if (filtrosAplicar.usuario) params.append('usuario', filtrosAplicar.usuario);
    if (filtrosAplicar.anio) params.append('anio', filtrosAplicar.anio);
    if (filtrosAplicar.mes) params.append('mes', filtrosAplicar.mes);
    if (filtrosAplicar.dia) params.append('dia', filtrosAplicar.dia);
    if (filtrosAplicar.departamento) params.append('departamento', filtrosAplicar.departamento);

    const queryStr = params.toString();
    const url = `/reportes/marcas${queryStr ? `?${queryStr}` : ''}`;

    api
      .get(url)
      .then((res) => setMarcas(res.datos || []))
      .catch((err) => setError(err.message || 'Error al obtener el reporte'))
      .finally(() => setCargando(false));
  }

  function handleCambioFiltro(e) {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }

  function handleBuscar(e) {
    e.preventDefault();
    cargarMarcas();
  }

  function handleLimpiar() {
    const limpios = { usuario: '', anio: '', mes: '', dia: '', departamento: '' };
    setFiltros(limpios);
    cargarMarcas(limpios);
  }

  async function exportar(formato) {
    try {
      const params = new URLSearchParams();
      params.append('formato', formato);
      if (filtros.usuario) params.append('usuario', filtros.usuario);
      if (filtros.anio) params.append('anio', filtros.anio);
      if (filtros.mes) params.append('mes', filtros.mes);
      if (filtros.dia) params.append('dia', filtros.dia);
      if (filtros.departamento) params.append('departamento', filtros.departamento);

      const downloadUrl = `${API_URL}/reportes/marcas/exportar?${params.toString()}`;
      const respuesta = await fetch(downloadUrl, { credentials: 'include' });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => null);
        alert(errorData?.mensaje || 'No fue posible exportar el reporte');
        return;
      }

      const blob = await respuesta.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = objectUrl;
      enlace.download = `reporte-marcas-${Date.now()}.${formato}`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      alert('Error de red al intentar exportar el reporte');
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0">
          <i className="bi bi-file-earmark-text me-2"></i>
          Reporte de Marcas
        </h1>
        <div className="btn-group">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => exportar('json')}>
            <i className="bi bi-filetype-json me-1"></i> Exportar JSON
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => exportar('xml')}>
            <i className="bi bi-filetype-xml me-1"></i> Exportar XML
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => exportar('pdf')}>
            <i className="bi bi-filetype-pdf me-1"></i> Exportar PDF
          </button>
        </div>
      </div>

      {/* Formulario de Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleBuscar} className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-bold">ID / Usuario</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="usuario"
                value={filtros.usuario}
                onChange={handleCambioFiltro}
                placeholder="ID de usuario"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-bold">Año</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="anio"
                value={filtros.anio}
                onChange={handleCambioFiltro}
                placeholder="Ej. 2026"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-bold">Mes</label>
              <select
                className="form-select form-select-sm"
                name="mes"
                value={filtros.mes}
                onChange={handleCambioFiltro}
              >
                <option value="">Todos los meses</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-bold">Día</label>
              <input
                type="number"
                min="1"
                max="31"
                className="form-control form-control-sm"
                name="dia"
                value={filtros.dia}
                onChange={handleCambioFiltro}
                placeholder="1 - 31"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Departamento</label>
              <select
                className="form-select form-select-sm"
                name="departamento"
                value={filtros.departamento}
                onChange={handleCambioFiltro}
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleLimpiar}>
                <i className="bi bi-x-circle me-1"></i> Limpiar
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <i className="bi bi-search me-1"></i> Filtrar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de Resultados */}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body p-0">
          {cargando ? (
            <p className="text-secondary p-3 mb-0">Cargando reporte…</p>
          ) : marcas.length === 0 ? (
            <p className="text-secondary p-3 mb-0">No se encontraron marcas con los filtros especificados.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Usuario</th>
                    <th>Departamento</th>
                    <th>Fecha</th>
                    <th>Hora Entrada</th>
                    <th>Hora Salida</th>
                    <th>Dispositivo (E / S)</th>
                    <th>IP (E / S)</th>
                  </tr>
                </thead>
                <tbody>
                  {marcas.map((row, index) => (
                    <tr key={`${row.id_usuario}-${row.fecha}-${index}`}>
                      <td className="fw-semibold">{row.usuario}</td>
                      <td>{row.departamento || '—'}</td>
                      <td>{row.fecha}</td>
                      <td>
                        {row.hora_entrada ? (
                          <span className="badge bg-success-subtle text-success border border-success">
                            {row.hora_entrada}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {row.hora_salida ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger">
                            {row.hora_salida}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <small className="d-block text-body-secondary">
                          In: {row.dispositivo_entrada || '—'}
                        </small>
                        <small className="d-block text-body-secondary">
                          Out: {row.dispositivo_salida || '—'}
                        </small>
                      </td>
                      <td>
                        <small className="d-block text-mono">In: {row.ip_entrada || '—'}</small>
                        <small className="d-block text-mono">Out: {row.ip_salida || '—'}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
