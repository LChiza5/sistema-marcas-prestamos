import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ACCESOS_USUARIO = [
  {
    a: '/marcas',
    icono: 'bi-fingerprint',
    color: 'icono-azul',
    titulo: 'Registrar marca',
    descripcion: 'Marque su entrada o salida del día',
  },
  {
    a: '/dispositivos',
    icono: 'bi-laptop',
    color: 'icono-morado',
    titulo: 'Mis dispositivos',
    descripcion: 'Administre los dispositivos autorizados',
  },
  {
    a: '/perfil',
    icono: 'bi-person-circle',
    color: 'icono-verde',
    titulo: 'Mi perfil',
    descripcion: 'Actualice su información personal',
  },
];

const ACCESOS_ADMIN = [
  {
    a: '/equipos',
    icono: 'bi-box-seam',
    color: 'icono-ambar',
    titulo: 'Inventario de equipos',
    descripcion: 'Consulte y administre los equipos',
  },
  {
    a: '/prestamos',
    icono: 'bi-arrow-left-right',
    color: 'icono-azul',
    titulo: 'Préstamos',
    descripcion: 'Registre y gestione préstamos y devoluciones',
  },
  {
    a: '/reportes',
    icono: 'bi-bar-chart-line',
    color: 'icono-morado',
    titulo: 'Reportes',
    descripcion: 'Consulte, filtre y exporte las marcas',
  },
  {
    a: '/departamentos',
    icono: 'bi-diagram-3',
    color: 'icono-verde',
    titulo: 'Departamentos',
    descripcion: 'Administre los departamentos o carreras',
  },
  {
    a: '/configuracion',
    icono: 'bi-gear',
    color: 'icono-ambar',
    titulo: 'Configuración',
    descripcion: 'Ajuste los parámetros generales del sistema',
  },
];

function TarjetaAcceso({ a, icono, color, titulo, descripcion }) {
  return (
    <Link to={a} className="superficie tarjeta-acceso aparecer">
      <span className={`icono ${color}`}>
        <i className={`bi ${icono}`}></i>
      </span>
      <div>
        <h3>{titulo}</h3>
        <p>{descripcion}</p>
      </div>
    </Link>
  );
}

export default function Inicio() {
  const { usuario, esAdministrador } = useAuth();
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const primerNombre = usuario.nombreCompleto.split(' ')[0];

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1>{saludo}, {primerNombre}</h1>
          <p>
            <span className={`insignia-estado ${esAdministrador ? 'insignia-azul' : 'insignia-verde'} me-2`}>
              {esAdministrador ? 'Administrador' : 'Usuario'}
            </span>
            Esto es lo que puede hacer hoy
          </p>
        </div>
      </div>

      <h2 className="h6 text-uppercase text-secondary fw-bold mb-3" style={{ letterSpacing: '0.04em' }}>
        Mis accesos
      </h2>
      <div className="row g-3 mb-4">
        {ACCESOS_USUARIO.map((acceso) => (
          <div className="col-sm-6 col-lg-4" key={acceso.a}>
            <TarjetaAcceso {...acceso} />
          </div>
        ))}
      </div>

      {esAdministrador && (
        <>
          <h2 className="h6 text-uppercase text-secondary fw-bold mb-3" style={{ letterSpacing: '0.04em' }}>
            Administración
          </h2>
          <div className="row g-3">
            {ACCESOS_ADMIN.map((acceso) => (
              <div className="col-sm-6 col-lg-3" key={acceso.a}>
                <TarjetaAcceso {...acceso} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
