import { creado, error, exito } from '../../utils/respuesta.js';
import { validarRegistro, validarActualizacion,} from './departamentos.validaciones.js';
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

/** Registra un departamento o carrera nuevo. */
export async function registrar(req, res, next) {
  try {
    const errores = validarRegistro(req.body);

    if (errores.length > 0) {
      return error(
        res,
        'Los datos enviados no son válidos',
        400,
        errores
      );
    }

    const nombre = req.body.nombre.trim();

    const existente = await modelo.buscarPorNombre(nombre);

    if (existente) {
      return error(
        res,
        'Ya existe un departamento con ese nombre',
        409
      );
    }

    const id = await modelo.insertar({
      nombre,
      descripcion: req.body.descripcion?.trim(),
      encargado: req.body.encargado?.trim(),
    });

    return creado(
      res,
      { id },
      'Departamento registrado correctamente'
    );
  } catch (err) {
    next(err);
  }
}

/** Modifica un departamento o carrera existente. */
export async function modificar(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return error(
        res,
        'El identificador del departamento no es válido',
        400
      );
    }

    const departamento = await modelo.buscarPorId(id);

    if (!departamento) {
      return error(
        res,
        'El departamento no existe',
        404
      );
    }

    const errores = validarActualizacion(req.body);

    if (errores.length > 0) {
      return error(
        res,
        'Los datos enviados no son válidos',
        400,
        errores
      );
    }

    const nombre = req.body.nombre.trim();

    const existente = await modelo.buscarPorNombre(nombre);

    if (existente && existente.id !== id) {
      return error(
        res,
        'Ya existe un departamento con ese nombre',
        409
      );
    }

    await modelo.actualizar(id, {
      nombre,
      descripcion: req.body.descripcion?.trim(),
      encargado: req.body.encargado?.trim(),
    });

    return exito(
      res,
      null,
      'Departamento actualizado correctamente'
    );
  } catch (err) {
    next(err);
  }
}

/** Elimina un departamento si no tiene usuarios asociados. */
export async function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return error(
        res,
        'El identificador del departamento no es válido',
        400
      );
    }

    const departamento = await modelo.buscarPorId(id);

    if (!departamento) {
      return error(
        res,
        'El departamento no existe',
        404
      );
    }

    const usuariosAsociados =
      await modelo.contarUsuarios(id);

    if (usuariosAsociados > 0) {
      return error(
        res,
        'No se puede eliminar el departamento porque tiene usuarios asociados',
        409
      );
    }

    await modelo.eliminar(id);

    return exito(
      res,
      null,
      'Departamento eliminado correctamente'
    );
  } catch (err) {
    next(err);
  }
}