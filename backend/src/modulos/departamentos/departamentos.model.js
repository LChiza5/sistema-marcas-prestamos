import { pool } from '../../config/db.js';

/** Lista todos los departamentos o carreras. */
export async function listar() {
  const [filas] = await pool.query(
    'SELECT id, nombre, descripcion, encargado FROM departamentos ORDER BY nombre'
  );
  return filas;
}

// TODO (punto 7): agregar aquí las consultas de registrar, modificar y eliminar.
// Antes de eliminar se debe verificar que ningún usuario esté asociado al departamento.
/** Busca un departamento por su id. */

export async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT id, nombre, descripcion, encargado
       FROM departamentos
      WHERE id = ?
      LIMIT 1`,
    [id]
  );

  return filas[0] ?? null;
}

/** Busca un departamento por nombre. */
export async function buscarPorNombre(nombre) {
  const [filas] = await pool.query(
    `SELECT id, nombre, descripcion, encargado
       FROM departamentos
      WHERE nombre = ?
      LIMIT 1`,
    [nombre]
  );

  return filas[0] ?? null;
}

/** Registra un departamento nuevo y devuelve su id. */
export async function insertar({
  nombre,
  descripcion,
  encargado,
}) {
  const [resultado] = await pool.query(
    `INSERT INTO departamentos
       (nombre, descripcion, encargado)
     VALUES (?, ?, ?)`,
    [
      nombre,
      descripcion ?? null,
      encargado ?? null,
    ]
  );

  return resultado.insertId;
}

/** Modifica un departamento existente. */
export async function actualizar(
  id,
  {
    nombre,
    descripcion,
    encargado,
  }
) {
  await pool.query(
    `UPDATE departamentos
        SET nombre = ?,
            descripcion = ?,
            encargado = ?
      WHERE id = ?`,
    [
      nombre,
      descripcion ?? null,
      encargado ?? null,
      id,
    ]
  );
}

/** Cuenta los usuarios asociados con un departamento. */
export async function contarUsuarios(idDepartamento) {
  const [filas] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM usuarios
      WHERE id_departamento = ?`,
    [idDepartamento]
  );

  return Number(filas[0].total);
}

/** Elimina un departamento. */
export async function eliminar(id) {
  await pool.query(
    'DELETE FROM departamentos WHERE id = ?',
    [id]
  );
}