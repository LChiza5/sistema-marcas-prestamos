import { Router } from 'express';
import { requiereSesion, requiereRol } from '../../middlewares/auth.middleware.js';
import * as controlador from './prestamos.controller.js';

const router = Router();

// Puntos 17 y 18 — Registro de préstamo (encabezado + detalle, con transacción
// y validaciones de negocio). Sólo el administrador/encargado puede prestar equipos.
router.post('/', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.registrar);
router.get('/:id', requiereSesion, controlador.obtenerPorId);

// =====================================================================
// PENDIENTE — Dubán agrega aquí las rutas de los puntos 19 y 20:
//
// Punto 19 — Devolución de equipos
//   PUT /api/prestamos/:id/devolver/:idEquipo   Devolución individual.
//   PUT /api/prestamos/:id/devolver             Devolución completa.
//
// Punto 20 — Historial de préstamos
//   GET /api/prestamos?usuario=&fecha=&estado=&equipo=
//
// Coordinar antes de subir para no pisar este archivo.
// =====================================================================

export default router;