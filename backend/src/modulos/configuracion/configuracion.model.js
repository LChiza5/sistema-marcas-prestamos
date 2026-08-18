import { pool } from '../../config/db.js';

/** Acceso a datos del módulo de configuración del sistema. */

/** Lista todos los parámetros de configuración. */
export async function listar() {
  const [filas] = await pool.query(
    'SELECT clave, valor, descripcion FROM configuracion ORDER BY clave'
  );
  return filas;
}

/** Obtiene un parámetro puntual por su clave. */
export async function obtenerPorClave(clave) {
  const [filas] = await pool.query(
    'SELECT clave, valor, descripcion FROM configuracion WHERE clave = ?',
    [clave]
  );
  return filas[0] ?? null;
}

/** Actualiza el valor de un parámetro existente. */
export async function actualizar(clave, valor) {
  await pool.query('UPDATE configuracion SET valor = ? WHERE clave = ?', [valor, clave]);
}
