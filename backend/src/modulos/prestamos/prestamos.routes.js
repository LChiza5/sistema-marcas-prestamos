import { Router } from 'express';

const router = Router();

// =====================================================================
// PUNTOS 17, 18, 19 y 20
//
// Punto 17 — Registro de préstamo
//   POST /api/prestamos
//   Estructura de encabezado y detalle:
//     Encabezado (tabla prestamos):        número, usuario, fecha, encargado, estado.
//     Detalle    (tabla prestamo_detalle): equipo, descripción, estado de devolución.
//   Un préstamo puede incluir varios equipos.
//   La inserción del encabezado y del detalle debe hacerse dentro de una
//   transacción para que no queden datos a medias.
//
// Punto 18 — Validaciones del préstamo
//   Antes de guardar, el servidor verifica:
//     - que el usuario exista;
//     - que exista al menos un equipo;
//     - que el equipo esté DISPONIBLE;
//     - que el mismo equipo no aparezca dos veces;
//     - que ningún equipo esté actualmente prestado.
//   Al guardar, los equipos pasan automáticamente al estado PRESTADO.
//
// Punto 19 — Devolución de equipos
//   PUT /api/prestamos/:id/devolver/:idEquipo   Devolución individual.
//   PUT /api/prestamos/:id/devolver             Devolución completa.
//   El equipo devuelto vuelve al estado DISPONIBLE.
//   Cuando todos los equipos se devuelven, el préstamo pasa a FINALIZADO.
//
// Punto 20 — Historial de préstamos
//   GET /api/prestamos?usuario=&fecha=&estado=&equipo=
//   Filtros combinables mediante parámetros de consulta.
//
// Crear también: prestamos.controller.js, prestamos.model.js y
// prestamos.validaciones.js.
// =====================================================================

export default router;
