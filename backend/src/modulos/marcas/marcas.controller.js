import { creado, error, exito } from '../../utils/respuesta.js';
import { fechaHoraActual } from '../../utils/fecha.js';
import { obtenerIpCliente } from '../../utils/red.js';
import * as modelo from './marcas.model.js';
import * as dispositivosModelo from '../dispositivos/dispositivos.model.js';

const NOMBRE_COOKIE_DISPOSITIVO = 'id_dispositivo';

/**
 * Punto 8 — Registro de marcas.
 * El tipo (ENTRADA/SALIDA) lo decide el servidor según la última marca
 * del usuario en el día actual. Esto evita, por diseño, que se registren
 * dos marcas del mismo tipo de manera consecutiva.
 * La IP se calcula en el backend (nunca se recibe del cliente).
 */
export async function registrar(req, res, next) {
  try {
    const idUsuario = req.session.usuario.id;
    const { fecha, hora } = fechaHoraActual();
    const ip = req.ipCliente ?? obtenerIpCliente(req);

    // Dispositivo: se reconoce por la cookie que se guardó al registrarlo (punto 9).
    // Si no hay cookie, o no corresponde a un dispositivo activo de este usuario,
    // la marca igual se registra pero sin dispositivo asociado.
    let idDispositivo = null;
    const identificadorCookie = req.cookies?.[NOMBRE_COOKIE_DISPOSITIVO];
    if (identificadorCookie) {
      const dispositivo = await dispositivosModelo.buscarPorIdentificador(identificadorCookie);
      if (dispositivo && dispositivo.id_usuario === idUsuario && dispositivo.estado === 'ACTIVO') {
        idDispositivo = dispositivo.id;
      }
    }

    const ultimaMarca = await modelo.obtenerUltimaMarcaDeHoy(idUsuario, fecha);
    const tipo = !ultimaMarca || ultimaMarca.tipo === 'SALIDA' ? 'ENTRADA' : 'SALIDA';

    // Verificación explícita de consistencia (además de la lógica automática anterior):
    // nunca se permiten dos marcas del mismo tipo de manera consecutiva.
    if (ultimaMarca && ultimaMarca.tipo === tipo) {
      return error(res, 'No es posible registrar dos marcas del mismo tipo de manera consecutiva', 409);
    }

    const id = await modelo.insertarMarca({ idUsuario, fecha, hora, tipo, ip, idDispositivo });

    return creado(res, { id, tipo, fecha, hora }, `Marca de ${tipo.toLowerCase()} registrada correctamente`);
  } catch (err) {
    next(err);
  }
}

/** Marcas del usuario en sesión durante el día de hoy. */
export async function marcasDeHoy(req, res, next) {
  try {
    const idUsuario = req.session.usuario.id;
    const { fecha } = fechaHoraActual();
    const marcas = await modelo.listarMarcasDeUsuarioEnFecha(idUsuario, fecha);
    return exito(res, marcas, 'Marcas del día obtenidas');
  } catch (err) {
    next(err);
  }
}
