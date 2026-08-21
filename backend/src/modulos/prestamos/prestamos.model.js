import { pool } from '../../config/db.js';

/**
 * Acceso a datos del módulo de préstamos.
 * El registro de un préstamo (puntos 17 y 18) usa una transacción porque
 * modifica varias tablas (prestamos, prestamo_detalle, equipos) y todas
 * las operaciones deben confirmarse juntas o ninguna debe quedar aplicada.
 */

/** Verifica que el usuario exista y esté activo. */
export async function existeUsuarioActivo(idUsuario) {
  const [filas] = await pool.query('SELECT id FROM usuarios WHERE id = ? AND activo = 1 LIMIT 1', [
    idUsuario,
  ]);
  return filas.length > 0;
}

/**
 * Trae los equipos indicados y BLOQUEA esas filas (FOR UPDATE) hasta que la
 * transacción termine. Esto evita que dos préstamos se registren al mismo
 * tiempo con el mismo equipo (condición de carrera): mientras esta
 * transacción no termine, cualquier otra que intente leer estas mismas
 * filas con FOR UPDATE debe esperar.
 */
export async function bloquearEquiposParaPrestamo(conexion, idsEquipos) {
  const [filas] = await conexion.query(
    `SELECT id, codigo, estado FROM equipos WHERE id IN (?) FOR UPDATE`,
    [idsEquipos]
  );
  return filas;
}

/** Inserta el encabezado del préstamo. Devuelve el id generado. */
export async function insertarEncabezado(conexion, { numero, idUsuario, idEncargado }) {
  const [resultado] = await conexion.query(
    `INSERT INTO prestamos (numero, id_usuario, id_encargado, estado)
     VALUES (?, ?, ?, 'ACTIVO')`,
    [numero, idUsuario, idEncargado]
  );
  return resultado.insertId;
}

/** Inserta las líneas de detalle de un préstamo (uno o varios equipos). */
export async function insertarDetalle(conexion, idPrestamo, equipos) {
  const filas = equipos.map((equipo) => [
    idPrestamo,
    equipo.id,
    equipo.descripcion ?? null,
    'PENDIENTE',
  ]);

  await conexion.query(
    `INSERT INTO prestamo_detalle (id_prestamo, id_equipo, descripcion, estado_devolucion)
     VALUES ?`,
    [filas]
  );
}

/** Cambia el estado de los equipos indicados a PRESTADO. */
export async function marcarEquiposPrestados(conexion, idsEquipos) {
  await conexion.query('UPDATE equipos SET estado = ? WHERE id IN (?)', ['PRESTADO', idsEquipos]);
}

/** Devuelve un préstamo con su encabezado y el detalle de equipos, para la respuesta al cliente. */
export async function buscarConDetalle(idPrestamo) {
  const [encabezado] = await pool.query(
    `SELECT p.id, p.numero, p.id_usuario, u.nombre_completo AS usuario,
            p.fecha, p.id_encargado, e.nombre_completo AS encargado, p.estado
       FROM prestamos p
       JOIN usuarios u ON u.id = p.id_usuario
       JOIN usuarios e ON e.id = p.id_encargado
      WHERE p.id = ?
      LIMIT 1`,
    [idPrestamo]
  );
  if (encabezado.length === 0) return null;

  const [detalle] = await pool.query(
    `SELECT pd.id, pd.id_equipo, eq.codigo, pd.descripcion, pd.estado_devolucion, pd.fecha_devolucion
       FROM prestamo_detalle pd
       JOIN equipos eq ON eq.id = pd.id_equipo
      WHERE pd.id_prestamo = ?`,
    [idPrestamo]
  );

  return { ...encabezado[0], detalle };
}