import { pool } from '../../config/db.js';

/**
 * Acceso a datos del módulo de usuarios (puntos 4, 5 y 6).
 * Todas las consultas son parametrizadas para prevenir inyección SQL.
 */

/** Obtiene los datos del perfil del usuario indicado. */
export async function obtenerPerfil(idUsuario) {
  const [filas] = await pool.query(
    `SELECT u.id,
            u.nombre_completo,
            DATE_FORMAT(u.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
            u.correo,
            u.usuario,
            u.id_departamento,
            d.nombre AS departamento
       FROM usuarios u
       LEFT JOIN departamentos d ON d.id = u.id_departamento
      WHERE u.id = ?
      LIMIT 1`,
    [idUsuario]
  );

  return filas[0] ?? null;
}

/** Verifica que el departamento indicado exista. */
export async function existeDepartamento(idDepartamento) {
  const [filas] = await pool.query(
    'SELECT id FROM departamentos WHERE id = ?',
    [idDepartamento]
  );

  return filas.length > 0;
}

/** Actualiza únicamente los datos permitidos del perfil. */
export async function actualizarPerfil(
  idUsuario,
  { nombreCompleto, fechaNacimiento, idDepartamento }
) {
  await pool.query(
    `UPDATE usuarios
        SET nombre_completo = ?,
            fecha_nacimiento = ?,
            id_departamento = ?
      WHERE id = ?`,
    [
      nombreCompleto,
      fechaNacimiento,
      idDepartamento,
      idUsuario,
    ]
  );
}

/** Obtiene el hash de contraseña del usuario indicado. */
export async function obtenerPassword(idUsuario) {
  const [filas] = await pool.query(
    `SELECT password_hash
       FROM usuarios
      WHERE id = ?
      LIMIT 1`,
    [idUsuario]
  );

  return filas[0] ?? null;
}

/** Actualiza el hash de contraseña de un usuario. */
export async function actualizarPassword(idUsuario, passwordHash) {
  await pool.query(
    `UPDATE usuarios
        SET password_hash = ?
      WHERE id = ?`,
    [passwordHash, idUsuario]
  );
}

/** Busca un usuario por su correo o nombre de usuario. */
export async function buscarUsuarioRecuperacion(identificador) {
  const [filas] = await pool.query(
    `SELECT id, nombre_completo, correo, usuario
       FROM usuarios
      WHERE correo = ? OR usuario = ?
      LIMIT 1`,
    [identificador, identificador]
  );

  return filas[0] ?? null;
}

/** Guarda un token temporal de recuperación de contraseña. */
export async function crearTokenRecuperacion({
  idUsuario,
  token,
  expiraEn,
}) {
  const [resultado] = await pool.query(
    `INSERT INTO tokens_recuperacion
       (id_usuario, token, expira_en)
     VALUES (?, ?, ?)`,
    [idUsuario, token, expiraEn]
  );

  return resultado.insertId;
}

/** Busca un token de recuperación. */
export async function buscarToken(token) {
  const [filas] = await pool.query(
    `SELECT id, id_usuario, token, expira_en, usado
       FROM tokens_recuperacion
      WHERE token = ?
      LIMIT 1`,
    [token]
  );

  return filas[0] ?? null;
}

/** Marca un token de recuperación como utilizado. */
export async function marcarTokenUsado(id) {
  await pool.query(
    `UPDATE tokens_recuperacion
        SET usado = 1
      WHERE id = ?`,
    [id]
  );
}

/**
 * Elimina las sesiones activas de un usuario de la tabla de sesiones.
 * Si se pasa sessionIdActual, se excluye esa sesión (para no cerrar la propia).
 */
export async function eliminarSesionesUsuario(idUsuario, sessionIdActual = null) {
  if (sessionIdActual) {
    await pool.query(
      'DELETE FROM sesiones WHERE id_usuario = ? AND session_id != ?',
      [idUsuario, sessionIdActual]
    );
  } else {
    await pool.query(
      'DELETE FROM sesiones WHERE id_usuario = ?',
      [idUsuario]
    );
  }
}