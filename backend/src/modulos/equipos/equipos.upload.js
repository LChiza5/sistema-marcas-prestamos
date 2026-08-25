import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { error } from '../../utils/respuesta.js';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));

/** Carpeta física donde se guardan las imágenes de los equipos. */
export const CARPETA_DESTINO = path.join(RAIZ, '..', '..', '..', 'uploads', 'equipos');

const TIPOS_PERMITIDOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/**
 * Firmas binarias (magic bytes) de los formatos de imagen permitidos.
 * Se usan para verificar que el contenido real del archivo coincida
 * con el tipo MIME declarado por el cliente.
 */
const FIRMAS_BINARIAS = {
  'image/png':  [0x89, 0x50, 0x4E, 0x47],
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

// Límite duro a nivel de multer. El límite real y configurable por el
// administrador (tabla configuracion, clave tamano_max_archivo_mb) se
// valida después, dentro del controlador.
const LIMITE_ABSOLUTO_BYTES = 5 * 1024 * 1024; // 5 MB

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CARPETA_DESTINO),
  filename: (req, file, cb) => {
    // Nombre generado por el servidor: nunca se usa el nombre original
    // del archivo, así se evita sobrescribir archivos existentes y se
    // evitan nombres con caracteres peligrosos.
    const extension = TIPOS_PERMITIDOS[file.mimetype];
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

function filtroArchivo(req, file, cb) {
  if (!TIPOS_PERMITIDOS[file.mimetype]) {
    return cb(new Error('TIPO_NO_PERMITIDO'));
  }
  cb(null, true);
}

/**
 * Verifica que los primeros bytes del archivo coincidan con la firma
 * binaria esperada para el tipo MIME declarado. Esto evita que un
 * archivo de texto plano pase el filtro solo con declarar
 * Content-Type: image/png.
 */
function validarFirmaBinaria(rutaArchivo, mimetype) {
  const firmaEsperada = FIRMAS_BINARIAS[mimetype];
  if (!firmaEsperada) return false;

  const fd = fs.openSync(rutaArchivo, 'r');
  const buffer = Buffer.alloc(firmaEsperada.length);
  fs.readSync(fd, buffer, 0, firmaEsperada.length, 0);
  fs.closeSync(fd);

  for (let i = 0; i < firmaEsperada.length; i++) {
    if (buffer[i] !== firmaEsperada[i]) return false;
  }
  return true;
}

const subirImagenEquipo = multer({
  storage: almacenamiento,
  fileFilter: filtroArchivo,
  limits: { fileSize: LIMITE_ABSOLUTO_BYTES },
}).single('imagen');

/**
 * Middleware que procesa el campo "imagen" del formulario (multipart/form-data).
 * La imagen es opcional: si no se envía, req.file simplemente queda undefined.
 *
 * Después de que multer guarda el archivo en disco, se valida la firma
 * binaria real. Si no coincide, se elimina el archivo y se rechaza.
 */
export function procesarImagenEquipo(req, res, next) {
  subirImagenEquipo(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return error(res, 'La imagen supera el tamaño máximo permitido', 400);
      }
      if (err.message === 'TIPO_NO_PERMITIDO') {
        return error(res, 'El tipo de archivo no es válido. Use JPG, PNG o WEBP', 400);
      }
      return next(err);
    }

    // Si no se envió imagen, continuar normalmente
    if (!req.file) return next();

    // Validar que los bytes reales del archivo coincidan con el MIME declarado
    const rutaCompleta = req.file.path;
    if (!validarFirmaBinaria(rutaCompleta, req.file.mimetype)) {
      // Eliminar el archivo falso del disco
      fs.unlink(rutaCompleta, () => {});
      return error(
        res,
        'El archivo no es una imagen válida. El contenido no coincide con el tipo declarado',
        400
      );
    }

    next();
  });
}