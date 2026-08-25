import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './componentes/Layout.jsx';
import RutaProtegida from './componentes/RutaProtegida.jsx';
import Login from './paginas/Login.jsx';
import Registro from './paginas/Registro.jsx';
import Inicio from './paginas/Inicio.jsx';
import Equipos from './paginas/Equipos.jsx';
import Prestamos from './paginas/Prestamos.jsx';
import Reportes from './paginas/Reportes.jsx';
import Perfil from './paginas/Perfil.jsx';
import CambiarContrasena from './paginas/CambiarContrasena.jsx';
import RecuperarContrasena from './paginas/RecuperarContrasena.jsx';
import RestablecerContrasena from './paginas/RestablecerContrasena.jsx';
import Departamentos from './paginas/Departamentos.jsx';
import Marcas from './paginas/Marcas.jsx';
import Dispositivos from './paginas/Dispositivos.jsx';
import Configuracion from './paginas/Configuracion.jsx';

export default function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />

      {/* Páginas que requieren sesión activa */}
      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
        <Route path="/marcas" element={<Marcas />} />
        <Route path="/dispositivos" element={<Dispositivos />} />
        

        <Route
          path="/equipos"
          element={
            <RutaProtegida soloAdministrador>
              <Equipos />
            </RutaProtegida>
          }
        />

        <Route
          path="/prestamos"
          element={
            <RutaProtegida soloAdministrador>
              <Prestamos />
            </RutaProtegida>
          }
        />

        <Route
          path="/reportes"
          element={
            <RutaProtegida soloAdministrador>
              <Reportes />
            </RutaProtegida>
          }
        />
        
        <Route
          path="/departamentos"
          element={
            <RutaProtegida soloAdministrador>
              <Departamentos />
            </RutaProtegida>
          }
        />

        <Route
          path="/configuracion"
          element={
            <RutaProtegida soloAdministrador>
              <Configuracion />
            </RutaProtegida>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
