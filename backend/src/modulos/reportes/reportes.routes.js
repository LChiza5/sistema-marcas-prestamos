import { Router } from 'express';
import { requiereSesion, requiereRol } from '../../middlewares/auth.middleware.js';
import * as controlador from './reportes.controller.js';

const router = Router();

// Usuarios disponibles para el selector del reporte de marcas
router.get('/usuarios', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.listarUsuarios);

// Punto 13 — Exportación del reporte de marcas en JSON, XML o PDF.
// IMPORTANTE: Definir /marcas/exportar antes de /marcas si hubiera rutas dinámicas.
router.get('/marcas/exportar', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.exportarMarcas);

// Punto 11 y 12 — Reporte de marcas con filtros combinables.
router.get('/marcas', requiereSesion, requiereRol('ADMINISTRADOR'), controlador.listarMarcas);

export default router;
