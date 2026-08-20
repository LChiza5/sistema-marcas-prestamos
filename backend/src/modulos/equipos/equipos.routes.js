import { Router } from 'express';
import { requiereSesion, requiereRol } from '../../middlewares/auth.middleware.js';
import { procesarImagenEquipo } from './equipos.upload.js';
import * as controlador from './equipos.controller.js';

const router = Router();

// Punto 14 — Inventario de equipos.
// Punto 15 — Manejo de imágenes (procesarImagenEquipo usa multer).
// Cualquier usuario autenticado puede consultar el inventario;
// sólo el administrador/encargado puede registrar, modificar o eliminar.
router.get('/', requiereSesion, controlador.listar);
router.post('/', requiereSesion, requiereRol('ADMINISTRADOR'), procesarImagenEquipo, controlador.registrar);
router.put('/:id', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.actualizar);
router.put('/:id/imagen', requiereSesion, requiereRol('ADMINISTRADOR'), procesarImagenEquipo, controlador.actualizarImagen);
router.delete('/:id', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.eliminar);

export default router;