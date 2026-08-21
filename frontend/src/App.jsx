import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './componentes/Layout.jsx';
import RutaProtegida from './componentes/RutaProtegida.jsx';
import Login from './paginas/Login.jsx';
import Registro from './paginas/Registro.jsx';
import Inicio from './paginas/Inicio.jsx';
import Equipos from './paginas/Equipos.jsx';

export default function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Páginas que requieren sesión activa */}
      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<Inicio />} />

        <Route
          path="/equipos"
          element={
            <RutaProtegida soloAdministrador>
              <Equipos />
            </RutaProtegida>
          }
        />

        {/* TODO: agregar aquí las páginas de cada módulo.
            Ejemplo:
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/marcas" element={<Marcas />} />
            Para las páginas del administrador, envolver con:
            <RutaProtegida soloAdministrador>…</RutaProtegida> */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
