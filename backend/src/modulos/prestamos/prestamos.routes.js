import { Router } from 'express';
import { requiereSesion, requiereRol } from '../../middlewares/auth.middleware.js';
import * as controlador from './prestamos.controller.js';

const router = Router();

// Punto 20 — Historial de préstamos con filtros (usuario, fecha, estado, equipo).
// Solo el administrador/encargado puede ver el historial de todos los usuarios.
router.get('/', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.listarHistorial);

// Puntos 17 y 18 — Registro de préstamo (encabezado + detalle, con transacción
// y validaciones de negocio). Sólo el administrador/encargado puede prestar equipos.
router.post('/', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.registrar);

// Punto 19 — Devolución de equipos (sólo Administrador/Encargado)
router.put('/:id/devolver/:idEquipo', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.devolverEquipo);
router.put('/:id/devolver', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.devolverCompleto);

router.get('/:id', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.obtenerPorId);

export default router;