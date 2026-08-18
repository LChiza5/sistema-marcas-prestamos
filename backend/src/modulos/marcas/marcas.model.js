import { pool } from '../../config/db.js';

/**
 * Acceso a datos del módulo de marcas (punto 8).
 * Todas las consultas son parametrizadas para prevenir inyección SQL.
 */

/** Devuelve la última marca del usuario en el día indicado, o null si no hay ninguna. */
export async function obtenerUltimaMarcaDeHoy(idUsuario, fecha) {
  const [filas] = await pool.query(
    `SELECT id, tipo, hora
       FROM marcas
      WHERE id_usuario = ? AND fecha = ?
      ORDER BY hora DESC, id DESC
      LIMIT 1`,
    [idUsuario, fecha]
  );
  return filas[0] ?? null;
}

/** Inserta una marca nueva y devuelve su id. */
export async function insertarMarca({ idUsuario, fecha, hora, tipo, ip, idDispositivo }) {
  const [resultado] = await pool.query(
    `INSERT INTO marcas (id_usuario, fecha, hora, tipo, ip, id_dispositivo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [idUsuario, fecha, hora, tipo, ip, idDispositivo]
  );
  return resultado.insertId;
}

/** Lista las marcas del usuario en el día indicado, de la más reciente a la más antigua. */
export async function listarMarcasDeUsuarioEnFecha(idUsuario, fecha) {
  const [filas] = await pool.query(
    `SELECT m.id, m.fecha, m.hora, m.tipo, m.ip, d.nombre AS dispositivo
       FROM marcas m
       LEFT JOIN dispositivos d ON d.id = m.id_dispositivo
      WHERE m.id_usuario = ? AND m.fecha = ?
      ORDER BY m.hora DESC, m.id DESC`,
    [idUsuario, fecha]
  );
  return filas;
}
