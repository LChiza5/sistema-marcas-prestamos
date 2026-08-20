import { pool } from '../../config/db.js';

/**
 * Acceso a datos del módulo de inventario de equipos (punto 14).
 * Todas las consultas son parametrizadas para prevenir inyección SQL.
 */

/** Lista todos los equipos registrados. */
export async function listar() {
  const [filas] = await pool.query(
    `SELECT id, codigo, descripcion, imagen, estado
       FROM equipos
      ORDER BY codigo`
  );
  return filas;
}

/** Busca un equipo por su id. */
export async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT id, codigo, descripcion, imagen, estado
       FROM equipos
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return filas[0] ?? null;
}

/** Busca un equipo por su código (para validar que no se repita). */
export async function buscarPorCodigo(codigo) {
  const [filas] = await pool.query(
    `SELECT id, codigo, descripcion, imagen, estado
       FROM equipos
      WHERE codigo = ?
      LIMIT 1`,
    [codigo]
  );
  return filas[0] ?? null;
}

/** Inserta un equipo nuevo y devuelve su id. La imagen se agrega después (punto 15). */
export async function insertar({ codigo, descripcion, imagen = null }) {
  const [resultado] = await pool.query(
    `INSERT INTO equipos (codigo, descripcion, imagen, estado)
     VALUES (?, ?, ?, 'DISPONIBLE')`,
    [codigo, descripcion, imagen]
  );
  return resultado.insertId;
}

/** Actualiza descripción y estado de un equipo. */
export async function actualizar(id, { descripcion, estado }) {
  await pool.query(
    `UPDATE equipos
        SET descripcion = ?, estado = ?
      WHERE id = ?`,
    [descripcion, estado, id]
  );
}

/** Reemplaza el nombre de archivo de la imagen asociada (usado en el punto 15). */
export async function actualizarImagen(id, imagen) {
  await pool.query('UPDATE equipos SET imagen = ? WHERE id = ?', [imagen, id]);
}

/** Elimina un equipo. */
export async function eliminar(id) {
  await pool.query('DELETE FROM equipos WHERE id = ?', [id]);
}

/** Verifica si el equipo tiene algún préstamo con devolución pendiente (para bloquear el borrado). */
export async function tienePrestamosPendientes(id) {
  const [filas] = await pool.query(
    `SELECT id FROM prestamo_detalle
      WHERE id_equipo = ? AND estado_devolucion = 'PENDIENTE'
      LIMIT 1`,
    [id]
  );
  return filas.length > 0;
}