import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la aplicación se consulta si ya existe una sesión activa.
  useEffect(() => {
    api
      .get('/auth/sesion')
      .then((res) => setUsuario(res.datos))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  async function login(identificador, password) {
    const res = await api.post('/auth/login', { identificador, password });
    setUsuario(res.datos);
    return res.datos;
  }

  async function logout() {
    await api.post('/auth/logout');
    setUsuario(null);
  }

  const valor = { usuario, cargando, login, logout, esAdministrador: usuario?.rol === 'ADMINISTRADOR' };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
