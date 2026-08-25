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
 * tabla `marcas`. Se trae cada marca por separado, ordenada por usuario,
 * fecha y hora, y se emparejan en JS (ver agruparPorTurno) para no mezclar
 * la entrada y la salida de turnos distintos del mismo día (ej. alguien
 * que sale a almorzar y vuelve a entrar).
 */
export async function obtenerMarcas(filtros) {
  const { where, parametros } = construirFiltros(filtros);

  const [marcas] = await pool.query(
    `SELECT
        u.id              AS id_usuario,
        u.nombre_completo AS usuario,
        dep.nombre        AS departamento,
        m.fecha,
        m.hora,
        m.tipo,
        m.ip,
        disp.nombre       AS dispositivo
      FROM marcas m
      INNER JOIN usuarios u      ON u.id = m.id_usuario
      LEFT JOIN departamentos dep ON dep.id = u.id_departamento
      LEFT JOIN dispositivos disp ON disp.id = m.id_dispositivo
      ${where}
      ORDER BY u.id, m.fecha, m.hora`,
    parametros
  );

  return agruparPorTurno(marcas);
}

/**
 * Empareja cada ENTRADA con la SALIDA que le sigue cronológicamente el
 * mismo día. Las marcas ya vienen ordenadas por usuario/fecha/hora, así
 * que basta con recorrerlas una vez llevando el turno que sigue abierto.
 */
function agruparPorTurno(marcas) {
  const turnos = [];
  let turnoAbierto = null;

  for (const marca of marcas) {
    if (marca.tipo === 'ENTRADA') {
      if (turnoAbierto) turnos.push(turnoAbierto);
      turnoAbierto = {
        id_usuario: marca.id_usuario,
        usuario: marca.usuario,
        departamento: marca.departamento,
        fecha: marca.fecha,
        hora_entrada: marca.hora,
        hora_salida: null,
        ip_entrada: marca.ip,
        ip_salida: null,
        dispositivo_entrada: marca.dispositivo,
        dispositivo_salida: null,
      };
    } else if (turnoAbierto) {
      turnoAbierto.hora_salida = marca.hora;
      turnoAbierto.ip_salida = marca.ip;
      turnoAbierto.dispositivo_salida = marca.dispositivo;
      turnos.push(turnoAbierto);
      turnoAbierto = null;
    } else {
      // SALIDA sin ENTRADA previa (dato huérfano): se reporta igual, sola.
      turnos.push({
        id_usuario: marca.id_usuario,
        usuario: marca.usuario,
        departamento: marca.departamento,
        fecha: marca.fecha,
        hora_entrada: null,
        hora_salida: marca.hora,
        ip_entrada: null,
        ip_salida: marca.ip,
        dispositivo_entrada: null,
        dispositivo_salida: marca.dispositivo,
      });
    }
  }
  if (turnoAbierto) turnos.push(turnoAbierto);

  turnos.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return a.usuario.localeCompare(b.usuario);
  });

  return turnos;
}

/** Obtiene los usuarios del sistema para el selector del reporte. */
export async function obtenerUsuarios() {
  const [filas] = await pool.query(
    'SELECT id, nombre_completo, usuario FROM usuarios WHERE activo = 1 ORDER BY nombre_completo ASC'
  );
  return filas;
}
