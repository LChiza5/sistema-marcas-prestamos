import { pool } from '../../config/db.js';

/**
 * Acceso a datos del módulo de autenticación.
 * Todas las consultas son parametrizadas para prevenir inyección SQL.
 */

/** Busca un usuario por su nombre de usuario o por su correo. */
export async function buscarPorUsuarioOCorreo(identificador) {
  const [filas] = await pool.query(
    `SELECT u.id, u.nombre_completo, u.usuario, u.correo, u.password_hash,
            u.activo, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.id_rol
      WHERE u.usuario = ? OR u.correo = ?
      LIMIT 1`,
    [identificador, identificador]
  );
  return filas[0] ?? null;
}

/** Indica si el usuario o el correo ya están registrados. */
export async function buscarDuplicados(usuario, correo) {
  const [filas] = await pool.query(
    'SELECT usuario, correo FROM usuarios WHERE usuario = ? OR correo = ?',
    [usuario, correo]
  );
  return {
    usuarioRepetido: filas.some((f) => f.usuario === usuario),
    correoRepetido: filas.some((f) => f.correo === correo),
  };
}

/** Verifica que el departamento indicado exista. */
export async function existeDepartamento(idDepartamento) {
  const [filas] = await pool.query('SELECT id FROM departamentos WHERE id = ?', [idDepartamento]);
  return filas.length > 0;
}

/** Inserta un usuario nuevo con el rol USUARIO y devuelve su identificador. */
export async function insertarUsuario(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO usuarios
       (nombre_completo, fecha_nacimiento, correo, usuario, password_hash, id_departamento, id_rol)
     VALUES (?, ?, ?, ?, ?, ?, (SELECT id FROM roles WHERE nombre = 'USUARIO'))`,
    [
      datos.nombreCompleto,
      datos.fechaNacimiento,
      datos.correo,
      datos.usuario,
      datos.passwordHash,
      datos.idDepartamento,
    ]
  );
  return resultado.insertId;
}
