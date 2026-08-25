import express from 'express';
import { requiereSesion, requiereRol } from '../../middlewares/auth.middleware.js';
import * as prestamosController from './prestamos.controller.js';

const router = express.Router();

router.get('/', requiereSesion, requiereRol('ADMINISTRADOR'), prestamosController.obtenerPrestamos);
router.get('/:id', requiereSesion, requiereRol('ADMINISTRADOR'), prestamosController.obtenerPrestamo);
router.post('/', requiereSesion, prestamosController.crearPrestamo);
router.put('/:id', requiereSesion, prestamosController.actualizarPrestamo);
router.delete('/:id', requiereSesion, prestamosController.eliminarPrestamo);

export default router;