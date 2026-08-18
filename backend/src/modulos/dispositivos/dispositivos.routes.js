import { Router } from 'express';
import { requiereSesion } from '../../middlewares/auth.middleware.js';
import * as controlador from './dispositivos.controller.js';

const router = Router();

router.get('/', requiereSesion, controlador.listar);
router.post('/', requiereSesion, controlador.registrar);
router.put('/:id', requiereSesion, controlador.modificar);
router.delete('/:id', requiereSesion, controlador.eliminar);

export default router;
