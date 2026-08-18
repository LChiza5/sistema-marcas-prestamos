import { Router } from 'express';
import { requiereSesion } from '../../middlewares/auth.middleware.js';
import { validarRedPermitida } from './marcas.middleware.js';
import * as controlador from './marcas.controller.js';

const router = Router();

router.post('/', requiereSesion, validarRedPermitida, controlador.registrar);

router.get('/hoy', requiereSesion, controlador.marcasDeHoy);

export default router;
