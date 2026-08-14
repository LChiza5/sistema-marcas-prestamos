import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';

import { manejadorErrores, noEncontrado } from './middlewares/error.middleware.js';

import authRoutes from './modulos/auth/auth.routes.js';
import usuariosRoutes from './modulos/usuarios/usuarios.routes.js';
import departamentosRoutes from './modulos/departamentos/departamentos.routes.js';
import dispositivosRoutes from './modulos/dispositivos/dispositivos.routes.js';
import marcasRoutes from './modulos/marcas/marcas.routes.js';
import reportesRoutes from './modulos/reportes/reportes.routes.js';
import equiposRoutes from './modulos/equipos/equipos.routes.js';
import prestamosRoutes from './modulos/prestamos/prestamos.routes.js';
import configuracionRoutes from './modulos/configuracion/configuracion.routes.js';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const MINUTOS_SESION = Number(process.env.SESSION_MINUTOS ?? 60);

const app = express();

// Necesario para obtener la IP real del cliente (punto 10).
app.set('trust proxy', true);

app.use(
  cors({
    origin: process.env.ORIGEN_FRONTEND,
    credentials: true, // permite enviar la cookie de sesión
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sesiones almacenadas en MySQL (tabla sesiones).
const MySQLStore = MySQLStoreFactory(session);
const almacenSesiones = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: false,
  schema: {
    tableName: 'sesiones',
    columnNames: { session_id: 'session_id', expires: 'expires', data: 'data' },
  },
});

app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    store: almacenSesiones,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // el navegador no permite leerla desde JavaScript
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', // sólo por HTTPS en producción
      maxAge: MINUTOS_SESION * 60 * 1000,
    },
  })
);

// Imágenes de los equipos (punto 15).
app.use('/uploads', express.static(path.join(RAIZ, '..', 'uploads')));

// Rutas de la API.
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/configuracion', configuracionRoutes);

app.use(noEncontrado);
app.use(manejadorErrores);

export default app;
