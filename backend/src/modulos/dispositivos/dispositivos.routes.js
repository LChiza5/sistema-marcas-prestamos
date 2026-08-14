import { Router } from 'express';

const router = Router();

// =====================================================================
// PUNTO 9 — Dispositivos autorizados
//
//   GET    /api/dispositivos       Lista los dispositivos del usuario en sesión.
//   POST   /api/dispositivos       Registra un dispositivo nuevo.
//   PUT    /api/dispositivos/:id   Modifica nombre, descripción o estado.
//   DELETE /api/dispositivos/:id   Elimina un dispositivo.
//
// El identificador del dispositivo lo genera el sistema (por ejemplo con
// crypto.randomUUID()) y se guarda del lado del cliente mediante una cookie.
// NO se utiliza la dirección MAC: los navegadores no permiten obtenerla.
//
// Todas las rutas requieren sesión activa.
// Crear también: dispositivos.controller.js, dispositivos.model.js y
// dispositivos.validaciones.js.
// =====================================================================

export default router;
