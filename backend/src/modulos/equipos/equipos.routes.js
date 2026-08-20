import { Router } from 'express';
import { requiereSesion, requiereRol } from '../../middlewares/auth.middleware.js';
import * as controlador from './equipos.controller.js';

const router = Router();

// Punto 14 — Inventario de equipos.
// Cualquier usuario autenticado puede consultar el inventario;
// sólo el administrador/encargado puede registrar, modificar o eliminar.
router.get('/', requiereSesion, controlador.listar);
router.post('/', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.registrar);
router.put('/:id', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.actualizar);
router.delete('/:id', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.eliminar);

export default router;