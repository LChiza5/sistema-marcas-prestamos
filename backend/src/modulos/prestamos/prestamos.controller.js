import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';

export async function obtenerPrestamos(req, res) {
  try {
    const { rol, id_usuario } = req.session.usuario;
    let filtro = {};

    if (rol !== 'ADMINISTRADOR') {
      filtro.id_usuario = id_usuario;
    }

    const prestamos = await pool('prestamos')
      .where(filtro)
      .select('*');

    return res.json({
      exito: true,
      datos: prestamos,
      mensaje: rol === 'ADMINISTRADOR' 
        ? 'Historial completo de préstamos' 
        : 'Tus préstamos'
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener préstamos',
      error: error.message
    });
  }
}

export async function obtenerPrestamo(req, res) {
  try {
    const { id } = req.params;
    const { rol, id_usuario } = req.session.usuario;

    const prestamo = await pool('prestamos').where('id', id).first();

    if (!prestamo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    if (rol !== 'ADMINISTRADOR' && prestamo.id_usuario !== id_usuario) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para ver este préstamo'
      });
    }

    return res.json({
      exito: true,
      datos: prestamo
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener préstamo',
      error: error.message
    });
  }
}

export async function crearPrestamo(req, res) {
  try {
    const { id_equipo, id_usuario_receptor, fecha_devolucion_esperada, descripcion } = req.body;
    const { id_usuario } = req.session.usuario;

    if (!id_equipo || !id_usuario_receptor) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Faltan datos requeridos'
      });
    }

    const equipo = await pool('equipos').where('id', id_equipo).first();
    if (!equipo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    const [id] = await pool('prestamos').insert({
      id_equipo,
      id_usuario,
      id_usuario_receptor,
      fecha_prestamo: pool.raw('NOW()'),
      fecha_devolucion_esperada: fecha_devolucion_esperada || null,
      descripcion: descripcion || null,
      estado: 'ACTIVO'
    });

    return res.status(201).json({
      exito: true,
      datos: { id },
      mensaje: 'Préstamo creado correctamente'
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al crear préstamo',
      error: error.message
    });
  }
}

export async function actualizarPrestamo(req, res) {
  try {
    const { id } = req.params;
    const { estado, fecha_devolucion_real, descripcion } = req.body;
    const { rol, id_usuario } = req.session.usuario;

    const prestamo = await pool('prestamos').where('id', id).first();

    if (!prestamo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    if (rol !== 'ADMINISTRADOR' && prestamo.id_usuario !== id_usuario) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para actualizar este préstamo'
      });
    }

    await pool('prestamos').where('id', id).update({
      estado: estado || prestamo.estado,
      fecha_devolucion_real: fecha_devolucion_real || null,
      descripcion: descripcion !== undefined ? descripcion : prestamo.descripcion,
      updated_at: pool.raw('NOW()')
    });

    return res.json({
      exito: true,
      mensaje: 'Préstamo actualizado correctamente'
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar préstamo',
      error: error.message
    });
  }
}

export async function eliminarPrestamo(req, res) {
  try {
    const { id } = req.params;
    const { rol, id_usuario } = req.session.usuario;

    const prestamo = await pool('prestamos').where('id', id).first();

    if (!prestamo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    if (rol !== 'ADMINISTRADOR' && prestamo.id_usuario !== id_usuario) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para eliminar este préstamo'
      });
    }

    await pool('prestamos').where('id', id).del();

    return res.json({
      exito: true,
      mensaje: 'Préstamo eliminado correctamente'
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar préstamo',
      error: error.message
    });
  }
}