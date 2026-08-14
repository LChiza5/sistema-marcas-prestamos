import { Router } from 'express';
import { requiereSesion } from '../../middlewares/auth.middleware.js';
import * as controlador from './auth.controller.js';

const router = Router();

router.post('/registro', controlador.registrar);          // Punto 1
router.post('/login', controlador.iniciarSesion);         // Punto 2
router.post('/logout', requiereSesion, controlador.cerrarSesion); // Punto 3
router.get('/sesion', requiereSesion, controlador.sesionActual);

export default router;
