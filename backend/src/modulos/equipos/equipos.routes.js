import { Router } from 'express';

const router = Router();

// =====================================================================
// PUNTOS 14, 15 y 16
//
// Punto 14 — Inventario de equipos
//   GET    /api/equipos       Lista los equipos.
//   POST   /api/equipos       Registra un equipo.
//   PUT    /api/equipos/:id   Modifica un equipo.
//   DELETE /api/equipos/:id   Elimina un equipo.
//
//   Cada equipo tiene: código (único), descripción, imagen y estado.
//   Estados: DISPONIBLE, PRESTADO, MANTENIMIENTO, INACTIVO.
//   Sólo el administrador o encargado puede administrarlos.
//
// Punto 15 — Manejo de imágenes
//   La carga se hace con multer hacia backend/uploads/equipos.
//   Se debe validar tipo de archivo y tamaño, generar un nombre seguro
//   (por ejemplo con crypto.randomUUID()) y no sobrescribir archivos.
//   El tamaño máximo se lee de la tabla configuracion.
//
// Punto 16 — Consulta del inventario
//   La tabla del frontend muestra código, descripción, estado y acciones.
//   Las acciones se habilitan o deshabilitan según el estado del equipo.
//
// Crear también: equipos.controller.js, equipos.model.js,
// equipos.validaciones.js y el middleware de carga de archivos.
// =====================================================================

export default router;
