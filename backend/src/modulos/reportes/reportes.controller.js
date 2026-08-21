import { error, exito } from '../../utils/respuesta.js';
import { validarFiltros, validarFormato } from './reportes.validaciones.js';
import { generarPDF, generarXML } from './reportes.exportadores.js';
import * as modelo from './reportes.model.js';

/** Punto 11 y 12 — Reporte de marcas con filtros combinables. */
export async function listarMarcas(req, res, next) {
  try {
    const errores = validarFiltros(req.query);
    if (errores.length > 0) return error(res, 'Los filtros enviados no son válidos', 400, errores);

    const filas = await modelo.obtenerMarcas(req.query);
    return exito(res, filas, 'Reporte de marcas obtenido');
  } catch (err) {
    next(err);
  }
}

/** Punto 13 — Exportación del reporte de marcas en JSON, XML o PDF. */
export async function exportarMarcas(req, res, next) {
  try {
    const { formato } = req.query;

    const erroresFormato = validarFormato(formato);
    if (erroresFormato.length > 0) return error(res, 'El formato solicitado no es válido', 400, erroresFormato);

    const erroresFiltros = validarFiltros(req.query);
    if (erroresFiltros.length > 0) return error(res, 'Los filtros enviados no son válidos', 400, erroresFiltros);

    const filas = await modelo.obtenerMarcas(req.query);
    const nombreArchivo = `reporte-marcas-${Date.now()}`;

    switch (String(formato).toLowerCase()) {
      case 'json': {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.json"`);
        return res.send(JSON.stringify(filas, null, 2));
      }

      case 'xml': {
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.xml"`);
        return res.send(generarXML(filas));
      }

      case 'pdf': {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.pdf"`);
        return generarPDF(res, filas);
      }

      default:
        // No debería llegar aquí porque validarFormato ya lo descarta.
        return error(res, 'Formato no soportado', 400);
    }
  } catch (err) {
    next(err);
  }
}

/** Obtiene la lista de usuarios para el selector de reportes. */
export async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await modelo.obtenerUsuarios();
    return exito(res, usuarios, 'Usuarios del reporte obtenidos');
  } catch (err) {
    next(err);
  }
}
