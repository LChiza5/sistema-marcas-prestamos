import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
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

const subirImagenEquipo = multer({
  storage: almacenamiento,
  fileFilter: filtroArchivo,
  limits: { fileSize: LIMITE_ABSOLUTO_BYTES },
}).single('imagen');

/**
 * Middleware que procesa el campo "imagen" del formulario (multipart/form-data).
 * La imagen es opcional: si no se envía, req.file simplemente queda undefined.
 */
export function procesarImagenEquipo(req, res, next) {
  subirImagenEquipo(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return error(res, 'La imagen supera el tamaño máximo permitido', 400);
    }
    if (err.message === 'TIPO_NO_PERMITIDO') {
      return error(res, 'El tipo de archivo no es válido. Use JPG, PNG o WEBP', 400);
    }
    return next(err);
  });
}