import { Router } from 'express';

const router = Router();

// =====================================================================
// MÓDULO DE CONFIGURACIÓN
//
//   GET /api/configuracion        Lista los parámetros del sistema.
//   PUT /api/configuracion/:clave Modifica el valor de un parámetro.
//
// Parámetros ya creados en init.sql:
//   nombre_institucion      Nombre mostrado en la aplicación.
//   rangos_ip_permitidos    Rangos autorizados para marcar (punto 10).
//   minutos_sesion          Tiempo máximo de una sesión.
//   tamano_max_archivo_mb   Tamaño máximo de las imágenes (punto 15).
//
// Sólo el administrador puede modificarlos.
// Crear también: configuracion.controller.js y configuracion.model.js.
// =====================================================================

export default router;
