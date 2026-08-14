import { Router } from 'express';
import * as controlador from './departamentos.controller.js';

const router = Router();

router.get('/', controlador.listar);

// TODO (punto 7): completar el CRUD de departamentos o carreras.
// Estas rutas son sólo para el administrador:
//   router.post('/',      requiereSesion, requiereRol('ADMINISTRADOR'), controlador.registrar);
//   router.put('/:id',    requiereSesion, requiereRol('ADMINISTRADOR'), controlador.modificar);
//   router.delete('/:id', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.eliminar);

export default router;
