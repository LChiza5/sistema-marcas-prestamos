import { useAuth } from '../context/AuthContext.jsx';

export default function Inicio() {
  const { usuario, esAdministrador } = useAuth();

  return (
    <>
      <h1 className="h4 mb-1">Bienvenido, {usuario.nombreCompleto}</h1>
      <p className="text-secondary">
        Rol: {esAdministrador ? 'Administrador' : 'Usuario'}
      </p>

      {/* TODO: reemplazar por el panel principal con los accesos a cada módulo
          conforme se vayan completando. */}
    </>
  );
}
