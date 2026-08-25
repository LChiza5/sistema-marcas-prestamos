import { useEffect, useState } from 'react';
import { api, API_URL } from '../api/cliente.js';

export default function Reportes() {
  const [marcas, setMarcas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
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
    cargarUsuarios();
    cargarMarcas();
  }, []);

  function cargarDepartamentos() {
    api
      .get('/departamentos')
      .then((res) => setDepartamentos(res.datos || []))
      .catch(() => setDepartamentos([]));
  }

  function cargarUsuarios() {
    api
      .get('/reportes/usuarios')
      .then((res) => setUsuarios(res.datos || []))
      .catch(() => setUsuarios([]));
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
      <div className="encabezado-pagina">
        <div className="d-flex align-items-center gap-3">
          <span className="icono-encabezado">
            <i className="bi bi-bar-chart-line"></i>
          </span>
          <div>
            <h1>Reporte de marcas</h1>
            <p>Consulte, filtre y exporte las marcas registradas</p>
          </div>
        </div>

        <div className="btn-group">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => exportar('json')}>
            <i className="bi bi-filetype-json me-1"></i> JSON
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => exportar('xml')}>
            <i className="bi bi-filetype-xml me-1"></i> XML
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => exportar('pdf')}>
            <i className="bi bi-filetype-pdf me-1"></i> PDF
          </button>
        </div>
      </div>

      {/* Formulario de filtros */}
      <div className="superficie mb-4 p-4 aparecer">
        <form onSubmit={handleBuscar} className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Usuario</label>
            <select
              className="form-select form-select-sm"
              name="usuario"
              value={filtros.usuario}
              onChange={handleCambioFiltro}
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo} ({u.usuario})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Año</label>
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
            <label className="form-label">Mes</label>
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
            <label className="form-label">Día</label>
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
            <label className="form-label">Departamento</label>
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
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLimpiar}>
              <i className="bi bi-x-lg me-1"></i> Limpiar
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="bi bi-search me-1"></i> Filtrar
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="superficie aparecer">
        {cargando ? (
          <p className="text-secondary p-4 mb-0">Cargando reporte…</p>
        ) : marcas.length === 0 ? (
          <p className="text-secondary p-4 mb-0">No se encontraron marcas con los filtros especificados.</p>
        ) : (
          <div className="table-responsive">
            <table className="table tabla-limpia mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Usuario</th>
                  <th>Departamento</th>
                  <th>Fecha</th>
                  <th>Hora entrada</th>
                  <th>Hora salida</th>
                  <th>Dispositivo (E / S)</th>
                  <th className="pe-4">IP (E / S)</th>
                </tr>
              </thead>
              <tbody>
                {marcas.map((row, index) => (
                  <tr key={`${row.id_usuario}-${row.fecha}-${index}`}>
                    <td className="ps-4 fw-semibold">{row.usuario}</td>
                    <td className="text-secondary">{row.departamento || '—'}</td>
                    <td className="text-secondary">{row.fecha}</td>
                    <td>
                      {row.hora_entrada ? (
                        <span className="insignia-estado insignia-verde">{row.hora_entrada}</span>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
                    </td>
                    <td>
                      {row.hora_salida ? (
                        <span className="insignia-estado insignia-ambar">{row.hora_salida}</span>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
                    </td>
                    <td>
                      <small className="d-block text-secondary">In: {row.dispositivo_entrada || '—'}</small>
                      <small className="d-block text-secondary">Out: {row.dispositivo_salida || '—'}</small>
                    </td>
                    <td className="pe-4">
                      <small className="d-block text-secondary">In: {row.ip_entrada || '—'}</small>
                      <small className="d-block text-secondary">Out: {row.ip_salida || '—'}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
