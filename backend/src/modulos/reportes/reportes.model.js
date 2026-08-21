import { pool } from '../../config/db.js';

/**
 * Acceso a datos del módulo de reportes.
 * Todas las consultas son parametrizadas para prevenir inyección SQL (punto 12).
 */

/**
 * Construye la cláusula WHERE y el arreglo de parámetros a partir de los
 * filtros recibidos. Los filtros son opcionales y se combinan con AND,
 * por lo que se pueden usar juntos o por separado.
 *
 * Filtros soportados: usuario, anio, mes, dia, departamento.
 */
function construirFiltros({ usuario, anio, mes, dia, departamento }) {
  const condiciones = [];
  const parametros = [];

  if (usuario) {
    condiciones.push('u.id = ?');
    parametros.push(Number(usuario));
  }
  if (anio) {
    condiciones.push('YEAR(m.fecha) = ?');
    parametros.push(Number(anio));
  }
  if (mes) {
    condiciones.push('MONTH(m.fecha) = ?');
    parametros.push(Number(mes));
  }
  if (dia) {
    condiciones.push('DAY(m.fecha) = ?');
    parametros.push(Number(dia));
  }
  if (departamento) {
    condiciones.push('u.id_departamento = ?');
    parametros.push(Number(departamento));
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
  return { where, parametros };
}

/**
 * Punto 11 y 12 — Reporte de marcas con filtros combinables.
 *
 * Cada marca individual (ENTRADA o SALIDA) se guarda como una fila en la
 * tabla `marcas`. El reporte agrupa las marcas de un mismo usuario en un
 * mismo día para poder mostrar la hora de entrada y la hora de salida en
 * una sola fila, junto con el dispositivo y la IP usados en cada una.
 */
export async function obtenerMarcas(filtros) {
  const { where, parametros } = construirFiltros(filtros);

  const [filas] = await pool.query(
    `SELECT
        u.id                 AS id_usuario,
        u.nombre_completo    AS usuario,
        dep.nombre           AS departamento,
        m.fecha,
        MAX(CASE WHEN m.tipo = 'ENTRADA' THEN m.hora END)          AS hora_entrada,
        MAX(CASE WHEN m.tipo = 'SALIDA'  THEN m.hora END)          AS hora_salida,
        MAX(CASE WHEN m.tipo = 'ENTRADA' THEN m.ip END)            AS ip_entrada,
        MAX(CASE WHEN m.tipo = 'SALIDA'  THEN m.ip END)            AS ip_salida,
        MAX(CASE WHEN m.tipo = 'ENTRADA' THEN disp.nombre END)     AS dispositivo_entrada,
        MAX(CASE WHEN m.tipo = 'SALIDA'  THEN disp.nombre END)     AS dispositivo_salida
      FROM marcas m
      INNER JOIN usuarios u      ON u.id = m.id_usuario
      LEFT JOIN departamentos dep ON dep.id = u.id_departamento
      LEFT JOIN dispositivos disp ON disp.id = m.id_dispositivo
      ${where}
      GROUP BY u.id, m.fecha
      ORDER BY m.fecha DESC, u.nombre_completo ASC`,
    parametros
  );

  return filas;
}
