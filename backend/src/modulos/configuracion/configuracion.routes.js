import { Router } from 'express';
import { requiereSesion, requiereRol } from '../../middlewares/auth.middleware.js';
import * as controlador from './configuracion.controller.js';

const router = Router();

router.get('/', requiereSesion, controlador.listar);
router.put('/:clave', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.actualizar);

export default router;
