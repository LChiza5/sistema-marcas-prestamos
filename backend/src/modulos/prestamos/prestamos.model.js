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

/**
 * Punto 19 — Devolución individual de un equipo asociado a un préstamo.
 * Si todos los equipos del préstamo han sido devueltos, el estado del préstamo
 * cambia automáticamente a FINALIZADO.
 */
export async function devolverEquipoIndividual(idPrestamo, idEquipo) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [detalle] = await conexion.query(
      `SELECT id, estado_devolucion FROM prestamo_detalle
        WHERE id_prestamo = ? AND id_equipo = ? FOR UPDATE`,
      [idPrestamo, idEquipo]
    );

    if (detalle.length === 0) {
      await conexion.rollback();
      return { error: 'El equipo no pertenece a este préstamo' };
    }

    if (detalle[0].estado_devolucion === 'DEVUELTO') {
      await conexion.rollback();
      return { error: 'El equipo ya fue devuelto previamente' };
    }

    // Marcar el ítem como DEVUELTO
    await conexion.query(
      `UPDATE prestamo_detalle
          SET estado_devolucion = 'DEVUELTO', fecha_devolucion = NOW()
        WHERE id_prestamo = ? AND id_equipo = ?`,
      [idPrestamo, idEquipo]
    );

    // Cambiar el estado del equipo a DISPONIBLE
    await conexion.query(`UPDATE equipos SET estado = 'DISPONIBLE' WHERE id = ?`, [idEquipo]);

    // Verificar si quedan equipos pendientes en este préstamo
    const [pendientes] = await conexion.query(
      `SELECT COUNT(*) AS total FROM prestamo_detalle
        WHERE id_prestamo = ? AND estado_devolucion = 'PENDIENTE'`,
      [idPrestamo]
    );

    if (pendientes[0].total === 0) {
      await conexion.query(`UPDATE prestamos SET estado = 'FINALIZADO' WHERE id = ?`, [idPrestamo]);
    }

    await conexion.commit();
    return { ok: true };
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

/**
 * Punto 19 — Devolución completa de todos los equipos pendientes de un préstamo.
 * Todos los equipos regresan a DISPONIBLE y el préstamo pasa a FINALIZADO.
 */
export async function devolverPrestamoCompleto(idPrestamo) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [pendientes] = await conexion.query(
      `SELECT id_equipo FROM prestamo_detalle
        WHERE id_prestamo = ? AND estado_devolucion = 'PENDIENTE' FOR UPDATE`,
      [idPrestamo]
    );

    if (pendientes.length === 0) {
      await conexion.rollback();
      return { error: 'El préstamo no tiene equipos pendientes por devolver' };
    }

    const idsEquipos = pendientes.map((p) => p.id_equipo);

    // Marcar todas las líneas como DEVUELTO
    await conexion.query(
      `UPDATE prestamo_detalle
          SET estado_devolucion = 'DEVUELTO', fecha_devolucion = NOW()
        WHERE id_prestamo = ? AND estado_devolucion = 'PENDIENTE'`,
      [idPrestamo]
    );

    // Cambiar los equipos a DISPONIBLE
    await conexion.query(`UPDATE equipos SET estado = 'DISPONIBLE' WHERE id IN (?)`, [idsEquipos]);

    // Cambiar préstamo a FINALIZADO
    await conexion.query(`UPDATE prestamos SET estado = 'FINALIZADO' WHERE id = ?`, [idPrestamo]);

    await conexion.commit();
    return { ok: true };
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

/**
 * Punto 20 — Historial de préstamos con filtros combinables.
 * Filtros soportados: usuario, fecha (YYYY-MM-DD), anio, mes, estado (ACTIVO/FINALIZADO), equipo (código o id).
 */
export async function obtenerHistorial({ usuario, fecha, anio, mes, estado, equipo }) {
  const condiciones = [];
  const parametros = [];

  if (usuario) {
    const val = String(usuario).trim();
    if (/^\d+$/.test(val)) {
      condiciones.push('(p.id_usuario = ? OR u.nombre_completo LIKE ? OR u.usuario LIKE ?)');
      parametros.push(Number(val), `%${val}%`, `%${val}%`);
    } else {
      condiciones.push('(u.nombre_completo LIKE ? OR u.usuario LIKE ?)');
      parametros.push(`%${val}%`, `%${val}%`);
    }
  }
  if (fecha) {
    condiciones.push('DATE(p.fecha) = ?');
    parametros.push(fecha);
  }
  if (anio) {
    condiciones.push('YEAR(p.fecha) = ?');
    parametros.push(Number(anio));
  }
  if (mes) {
    condiciones.push('MONTH(p.fecha) = ?');
    parametros.push(Number(mes));
  }
  if (estado) {
    condiciones.push('p.estado = ?');
    parametros.push(String(estado).toUpperCase());
  }
  if (equipo) {
    condiciones.push('(pd.id_equipo = ? OR eq.codigo LIKE ?)');
    parametros.push(Number(equipo) || 0, `%${equipo}%`);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [prestamos] = await pool.query(
    `SELECT DISTINCT
        p.id,
        p.numero,
        p.id_usuario,
        u.nombre_completo AS usuario,
        p.fecha,
        p.id_encargado,
        e.nombre_completo AS encargado,
        p.estado
      FROM prestamos p
      JOIN usuarios u ON u.id = p.id_usuario
      JOIN usuarios e ON e.id = p.id_encargado
      LEFT JOIN prestamo_detalle pd ON pd.id_prestamo = p.id
      LEFT JOIN equipos eq ON eq.id = pd.id_equipo
      ${where}
      ORDER BY p.fecha DESC`,
    parametros
  );

  if (prestamos.length === 0) return [];

  // Adjuntar el detalle de equipos a cada préstamo
  const idsPrestamos = prestamos.map((p) => p.id);
  const [detalles] = await pool.query(
    `SELECT pd.id, pd.id_prestamo, pd.id_equipo, eq.codigo, eq.descripcion AS descripcion_equipo,
            pd.descripcion AS nota, pd.estado_devolucion, pd.fecha_devolucion
       FROM prestamo_detalle pd
       JOIN equipos eq ON eq.id = pd.id_equipo
      WHERE pd.id_prestamo IN (?)`,
    [idsPrestamos]
  );

  const detallesPorPrestamo = new Map();
  detalles.forEach((d) => {
    if (!detallesPorPrestamo.has(d.id_prestamo)) {
      detallesPorPrestamo.set(d.id_prestamo, []);
    }
    detallesPorPrestamo.get(d.id_prestamo).push(d);
  });

  return prestamos.map((p) => ({
    ...p,
    detalle: detallesPorPrestamo.get(p.id) ?? [],
  }));
}