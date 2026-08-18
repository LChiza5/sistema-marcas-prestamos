import { pool } from '../../config/db.js';

/**
 * Acceso a datos del módulo de dispositivos autorizados (punto 9).
 * Todas las consultas son parametrizadas para prevenir inyección SQL.
 */

/** Lista los dispositivos del usuario indicado. */
export async function listarPorUsuario(idUsuario) {
  const [filas] = await pool.query(
    `SELECT id, identificador, nombre, descripcion, fecha_registro, estado
       FROM dispositivos
      WHERE id_usuario = ?
      ORDER BY fecha_registro DESC`,
    [idUsuario]
  );
  return filas;
}

/** Busca un dispositivo por su identificador único (el que viaja en la cookie). */
export async function buscarPorIdentificador(identificador) {
  const [filas] = await pool.query(
    `SELECT id, identificador, nombre, descripcion, fecha_registro, id_usuario, estado
       FROM dispositivos
      WHERE identificador = ?
      LIMIT 1`,
    [identificador]
  );
  return filas[0] ?? null;
}

/** Busca un dispositivo por su id, sin importar el dueño (uso interno). */
export async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT id, identificador, nombre, descripcion, fecha_registro, id_usuario, estado
       FROM dispositivos
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return filas[0] ?? null;
}

/** Inserta un dispositivo nuevo y devuelve su id. */
export async function insertar({ identificador, nombre, descripcion, idUsuario }) {
  const [resultado] = await pool.query(
    `INSERT INTO dispositivos (identificador, nombre, descripcion, id_usuario, estado)
     VALUES (?, ?, ?, ?, 'ACTIVO')`,
    [identificador, nombre, descripcion ?? null, idUsuario]
  );
  return resultado.insertId;
}

/** Actualiza nombre, descripción y/o estado de un dispositivo. */
export async function actualizar(id, { nombre, descripcion, estado }) {
  await pool.query(
    `UPDATE dispositivos
        SET nombre = ?, descripcion = ?, estado = ?
      WHERE id = ?`,
    [nombre, descripcion ?? null, estado, id]
  );
}

/** Elimina un dispositivo. */
export async function eliminar(id) {
  await pool.query('DELETE FROM dispositivos WHERE id = ?', [id]);
}
