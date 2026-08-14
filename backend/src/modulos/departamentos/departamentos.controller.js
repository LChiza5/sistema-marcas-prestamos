import { exito } from '../../utils/respuesta.js';
import * as modelo from './departamentos.model.js';

/**
 * Lista los departamentos o carreras.
 * Es una ruta pública porque el formulario de registro la necesita
 * para llenar el campo de selección.
 */
export async function listar(req, res, next) {
  try {
    return exito(res, await modelo.listar(), 'Departamentos obtenidos');
  } catch (err) {
    next(err);
  }
}

// TODO (punto 7): implementar registrar, modificar y eliminar.
