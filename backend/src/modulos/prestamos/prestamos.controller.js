import { pool } from '../../config/db.js';
import { creado, error, exito } from '../../utils/respuesta.js';
import { validarRegistro } from './prestamos.validaciones.js';
import * as modelo from './prestamos.model.js';

/**
 * Punto 17 y 18 — Registro de préstamo.
 * Un encargado presta uno o varios equipos a un usuario. Todo se hace
 * dentro de una transacción: si cualquier validación de negocio falla,
 * no debe quedar nada a medias en la base de datos.
 */
export async function registrar(req, res, next) {
  try {
    const erroresFormato = validarRegistro(req.body);
    if (erroresFormato.length > 0) {
      return error(res, 'Los datos enviados no son válidos', 400, erroresFormato);
    }

    const idUsuario = Number(req.body.idUsuario);
    const equiposSolicitados = req.body.equipos.map((equipo) => ({
      id: Number(equipo.id),
      descripcion: equipo.descripcion?.trim() || null,
    }));
    const idsEquipos = equiposSolicitados.map((equipo) => equipo.id);

    // Punto 18 — el usuario debe existir antes de abrir la transacción.
    const usuarioExiste = await modelo.existeUsuarioActivo(idUsuario);
    if (!usuarioExiste) return error(res, 'El usuario indicado no existe', 400);

    const conexion = await pool.getConnection();

    try {
      await conexion.beginTransaction();

      // FOR UPDATE bloquea estas filas hasta el commit/rollback, evitando que
      // dos préstamos simultáneos tomen el mismo equipo (condición de carrera).
      const equiposEnBD = await modelo.bloquearEquiposParaPrestamo(conexion, idsEquipos);

      if (equiposEnBD.length !== idsEquipos.length) {
        await conexion.rollback();
        return error(res, 'Uno o más equipos indicados no existen', 400);
      }

      const equiposNoDisponibles = equiposEnBD.filter((equipo) => equipo.estado !== 'DISPONIBLE');
      if (equiposNoDisponibles.length > 0) {
        await conexion.rollback();
        const codigos = equiposNoDisponibles.map((equipo) => equipo.codigo).join(', ');
        return error(res, `Los siguientes equipos no están disponibles: ${codigos}`, 409);
      }

      // Número de préstamo legible y único, basado en marca de tiempo.
      const numero = `P-${Date.now()}`;

      const idPrestamo = await modelo.insertarEncabezado(conexion, {
        numero,
        idUsuario,
        idEncargado: req.session.usuario.id,
      });

      await modelo.insertarDetalle(conexion, idPrestamo, equiposSolicitados);
      await modelo.marcarEquiposPrestados(conexion, idsEquipos);

      await conexion.commit();

      const prestamo = await modelo.buscarConDetalle(idPrestamo);
      return creado(res, prestamo, 'Préstamo registrado correctamente');
    } catch (err) {
      await conexion.rollback();
      throw err;
    } finally {
      conexion.release();
    }
  } catch (err) {
    next(err);
  }
}

/** Consulta un préstamo puntual con su detalle. */
export async function obtenerPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return error(res, 'El identificador del préstamo no es válido', 400);

    const prestamo = await modelo.buscarConDetalle(id);
    if (!prestamo) return error(res, 'El préstamo no existe', 404);

    return exito(res, prestamo, 'Préstamo obtenido');
  } catch (err) {
    next(err);
  }
}