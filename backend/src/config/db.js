import mysql from 'mysql2/promise';

/**
 * Pool de conexiones a MySQL.
 * Todos los módulos deben usar este pool. No se crean conexiones por aparte.
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

/** Verifica que la base de datos responda antes de levantar el servidor. */
export async function probarConexion() {
  const conexion = await pool.getConnection();
  await conexion.ping();
  conexion.release();
}
