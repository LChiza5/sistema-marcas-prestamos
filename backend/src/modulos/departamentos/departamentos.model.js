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
