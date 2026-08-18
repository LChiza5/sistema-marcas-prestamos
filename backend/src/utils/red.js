function ipv4ADecimal(ip) {
  const partes = ip.split('.');
  if (partes.length !== 4) return null;

  let resultado = 0;
  for (const parte of partes) {
    if (!/^\d{1,3}$/.test(parte)) return null;
    const octeto = Number(parte);
    if (octeto < 0 || octeto > 255) return null;
    resultado = (resultado << 8) | octeto;
  }
  return resultado >>> 0;
}

function ipEnPatron(ip, patron) {
  const valor = patron.trim();
  if (!valor) return false;

  if (!valor.includes('/')) {
    return ip === valor;
  }

  const [base, prefijoTexto] = valor.split('/');
  const prefijo = Number(prefijoTexto);
  if (!Number.isInteger(prefijo) || prefijo < 0 || prefijo > 32) return false;

  const ipDecimal = ipv4ADecimal(ip);
  const baseDecimal = ipv4ADecimal(base);
  if (ipDecimal === null || baseDecimal === null) return false;

  if (prefijo === 0) return true; // 0.0.0.0/0 -> cualquier IP
  const mascara = (0xffffffff << (32 - prefijo)) >>> 0;
  return (ipDecimal & mascara) === (baseDecimal & mascara);
}

export function obtenerIpCliente(req) {
  let ip = req.ip || req.socket?.remoteAddress || '';
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  if (ip === '::1') ip = '127.0.0.1';
  return ip;
}

export function ipPermitida(ip, rangos) {
  if (!Array.isArray(rangos) || rangos.length === 0) return true;
  return rangos.some((patron) => ipEnPatron(ip, patron));
}
