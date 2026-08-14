import { Router } from 'express';

const router = Router();

// =====================================================================
// PUNTOS 8 y 10
//
// Punto 8 — Registro de marcas
//   POST /api/marcas          Registra la marca del usuario en sesión.
//   GET  /api/marcas/hoy      Marcas del día del usuario en sesión.
//
//   Cada marca guarda: usuario, fecha, hora, tipo, dirección IP y dispositivo.
//   El servidor determina automáticamente si corresponde ENTRADA o SALIDA
//   consultando la última marca del día.
//   No se permiten marcas inconsistentes (dos ENTRADA seguidas sin SALIDA).
//   La IP se obtiene en el backend, nunca se recibe desde el frontend.
//
// Punto 10 — Validación de ubicación de red
//   Middleware que compara la IP de la solicitud contra los rangos
//   guardados en la tabla configuracion (clave rangos_ip_permitidos).
//   Si no cumple, responder 403 con el mensaje:
//   "No es posible realizar la marca desde la red actual."
//   Esta validación se hace en el backend.
//
// Crear también: marcas.controller.js, marcas.model.js, marcas.validaciones.js
// y el middleware de validación de red.
// =====================================================================

export default router;
