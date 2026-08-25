import { pool } from '../../config/db.js';

export async function obtenerReportesMarcas(filtros = {}) {
  try {
    let query = pool('marcas as m')
      .select(
        'u.id as id_usuario',
        'u.nombre_completo as usuario',
        'd.nombre as departamento',
        pool.raw("DATE(m.timestamp) as fecha"),
        db.raw("TIME(m.timestamp) as hora"),
        'm.tipo',
        'm.dispositivo',
        'm.ip'
      )
      .leftJoin('usuarios as u', 'm.id_usuario', 'u.id')
      .leftJoin('departamentos as d', 'u.id_departamento', 'd.id')
      .orderBy('m.id_usuario')
      .orderBy('fecha')
      .orderBy('m.timestamp');

    if (filtros.usuario) {
      query.where('m.id_usuario', filtros.usuario);
    }
    if (filtros.departamento) {
      query.where('u.id_departamento', filtros.departamento);
    }
    if (filtros.anio) {
      query.whereRaw('YEAR(m.timestamp) = ?', [filtros.anio]);
    }
    if (filtros.mes) {
      query.whereRaw('MONTH(m.timestamp) = ?', [filtros.mes]);
    }
    if (filtros.dia) {
      query.whereRaw('DAY(m.timestamp) = ?', [filtros.dia]);
    }

    const marcas = await query;
    const reportesPorTurno = agruparPorTurno(marcas);
    
    return reportesPorTurno;

  } catch (error) {
    console.error('Error en obtenerReportesMarcas:', error);
    throw error;
  }
}

function agruparPorTurno(marcas) {
  const turnos = [];
  const porUsuarioFecha = {};

  marcas.forEach(marca => {
    const clave = `${marca.id_usuario}_${marca.fecha}`;
    if (!porUsuarioFecha[clave]) {
      porUsuarioFecha[clave] = {
        usuario: marca.usuario,
        departamento: marca.departamento,
        id_usuario: marca.id_usuario,
        fecha: marca.fecha,
        marcas: []
      };
    }
    porUsuarioFecha[clave].marcas.push(marca);
  });

  Object.values(porUsuarioFecha).forEach(grupo => {
    const marcasDelDia = grupo.marcas;
    let horaEntrada = null;
    let dispositivoEntrada = null;
    let ipEntrada = null;

    for (let i = 0; i < marcasDelDia.length; i++) {
      const marca = marcasDelDia[i];

      if (marca.tipo === 'ENTRADA') {
        if (horaEntrada !== null) {
          turnos.push({
            usuario: grupo.usuario,
            departamento: grupo.departamento,
            fecha: grupo.fecha,
            hora_entrada: horaEntrada,
            hora_salida: null,
            dispositivo_entrada: dispositivoEntrada,
            dispositivo_salida: null,
            ip_entrada: ipEntrada,
            ip_salida: null
          });
        }

        horaEntrada = marca.hora;
        dispositivoEntrada = marca.dispositivo;
        ipEntrada = marca.ip;

      } else if (marca.tipo === 'SALIDA') {
        if (horaEntrada !== null) {
          turnos.push({
            usuario: grupo.usuario,
            departamento: grupo.departamento,
            fecha: grupo.fecha,
            hora_entrada: horaEntrada,
            hora_salida: marca.hora,
            dispositivo_entrada: dispositivoEntrada,
            dispositivo_salida: marca.dispositivo,
            ip_entrada: ipEntrada,
            ip_salida: marca.ip
          });

          horaEntrada = null;
          dispositivoEntrada = null;
          ipEntrada = null;
        } else {
          turnos.push({
            usuario: grupo.usuario,
            departamento: grupo.departamento,
            fecha: grupo.fecha,
            hora_entrada: null,
            hora_salida: marca.hora,
            dispositivo_entrada: null,
            dispositivo_salida: marca.dispositivo,
            ip_entrada: null,
            ip_salida: marca.ip
          });
        }
      }
    }

    if (horaEntrada !== null) {
      turnos.push({
        usuario: grupo.usuario,
        departamento: grupo.departamento,
        fecha: grupo.fecha,
        hora_entrada: horaEntrada,
        hora_salida: null,
        dispositivo_entrada: dispositivoEntrada,
        dispositivo_salida: null,
        ip_entrada: ipEntrada,
        ip_salida: null
      });
    }
  });

  return turnos;
}