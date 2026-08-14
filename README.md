# Sistema de Marcas y Préstamo de Equipos

Proyecto del curso **Tecnologías y Sistemas Web II** — Universidad Técnica Nacional, Sede de Guanacaste.

Aplicación web Full Stack para gestionar el **registro de marcas de usuarios** (entrada/salida) y el
**préstamo de equipos institucionales**.

---

## Tecnologías

| Capa          | Tecnologías                                                        |
| ------------- | ------------------------------------------------------------------ |
| Backend       | Node.js, Express, JavaScript, API REST, variables de entorno (.env) |
| Base de datos | MySQL, Docker, phpMyAdmin                                           |
| Frontend      | React + Vite, HTML, CSS, Bootstrap, Bootstrap Icons, `fetch()`      |

El frontend y el backend son **dos aplicaciones independientes**. El frontend nunca accede
directamente a la base de datos: todo pasa por la API.

---

## Estructura del repositorio

```
sistema-marcas-prestamos/
├── docker-compose.yml            # MySQL + phpMyAdmin
├── .env.example                  # Variables para docker-compose
├── database/
│   └── init.sql                  # Base de datos, tablas, relaciones y datos iniciales
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js             # Levanta el servidor
│       ├── app.js                # Configura Express, sesiones, cookies y monta las rutas
│       ├── config/
│       │   └── db.js             # Pool de conexiones a MySQL
│       ├── middlewares/
│       │   ├── auth.middleware.js    # Verifica sesión y permisos por rol
│       │   └── error.middleware.js   # Manejo centralizado de errores y 404
│       ├── utils/
│       │   └── respuesta.js      # Estructura consistente de respuestas de la API
│       └── modulos/              # Un módulo por área del sistema
│           ├── auth/             # Puntos 1, 2, 3
│           ├── usuarios/         # Puntos 4, 5, 6
│           ├── departamentos/    # Punto 7
│           ├── dispositivos/     # Punto 9
│           ├── marcas/           # Puntos 8, 10
│           ├── reportes/         # Puntos 11, 12, 13
│           ├── equipos/          # Puntos 14, 15, 16
│           ├── prestamos/        # Puntos 17, 18, 19, 20
│           └── configuracion/    # Módulo de configuración
│
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               # Rutas de la aplicación
        ├── api/cliente.js        # Envoltura de fetch() hacia el backend
        ├── context/AuthContext.jsx
        ├── componentes/
        │   ├── Layout.jsx
        │   └── RutaProtegida.jsx
        └── paginas/
            ├── Login.jsx
            ├── Registro.jsx
            └── Inicio.jsx
```

### Estructura de cada módulo del backend

Cada módulo debe tener **como mínimo** estos cuatro archivos (ver `modulos/auth/` como ejemplo
completo y funcional):

```
modulos/<nombre>/
├── <nombre>.routes.js        # Endpoints disponibles
├── <nombre>.controller.js    # Recibe la solicitud y ejecuta la lógica
├── <nombre>.model.js         # Consultas SQL (parametrizadas, usando el pool)
└── <nombre>.validaciones.js  # Validaciones de los datos recibidos
```

**Regla importante:** en `.controller.js` no se escribe SQL. Todo el SQL vive en `.model.js`.

---

## Puesta en marcha

### 1. Base de datos (Docker)

```bash
cp .env.example .env
docker compose up -d
```

- MySQL queda en `localhost:3307`
- phpMyAdmin queda en `http://localhost:8080`

El archivo `database/init.sql` se ejecuta automáticamente la primera vez y crea la base de datos,
las tablas, las relaciones y los datos iniciales.

> Si cambias `init.sql` y necesitas recrear la base desde cero:
> `docker compose down -v` y luego `docker compose up -d`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API disponible en `http://localhost:3000/api`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Interfaz disponible en `http://localhost:5173`

### Usuario administrador inicial

| Usuario | Contraseña  |
| ------- | ----------- |
| `admin` | `Admin123!` |

---

## Estado actual del proyecto

**Ya implementado (base):**

- Estructura completa del backend y del frontend
- `docker-compose.yml` con MySQL y phpMyAdmin
- `database/init.sql` con todas las tablas, llaves foráneas, índices y datos iniciales
- Pool de conexiones, manejo de sesiones con cookies (`HttpOnly`, `SameSite`, expiración)
- Middlewares de sesión, permisos por rol y manejo de errores
- Formato consistente de respuestas de la API
- **Puntos 1, 2 y 3**: registro de usuario, inicio de sesión y cierre de sesión (backend + frontend)

**Pendiente:** los puntos 4 al 20, repartidos según la tabla de abajo. Las carpetas de cada módulo
ya existen con su archivo de rutas listo para completar.

---

## Repartición del trabajo

| Integrante    | Puntos asignados     | Responsabilidad                                                                     |
| ------------- | -------------------- | ----------------------------------------------------------------------------------- |
| **Luis**      | Base + 1, 2, 3       | Estructura, Docker, `init.sql`, sesiones, middlewares. Registro, login y logout.     |
| **Sander**    | 4, 5, 6, 7           | Perfil de usuario, cambio de contraseña, recuperación de contraseña, departamentos.  |
| **Jorge**     | 8, 9, 10 + Config.   | Registro de marcas, dispositivos autorizados, validación de IP, módulo config.       |
| **Dubán**     | 11, 12, 13 + 19, 20  | Reporte de marcas, filtros, exportación. Devolución de equipos e historial.          |
| **Sebastián** | 14, 15, 16 + 17, 18  | Inventario de equipos, imágenes, consulta. Registro y validaciones de préstamo.      |

Detalle completo de cada punto en `REPARTICION.md`.

---

## Convenciones de trabajo

- Se trabaja sobre la rama **`main`**.
- Antes de empezar a trabajar: `git pull` para traer los últimos cambios.
- Cada quien trabaja **solo dentro de las carpetas de sus módulos** para evitar conflictos.
- Los archivos compartidos (`app.js`, `init.sql`, `package.json`) se modifican avisando al grupo.
- Nunca subir el archivo `.env` (ya está en `.gitignore`). Solo se versiona `.env.example`.

### Formato de commits

```
<módulo>: <qué se hizo>
```

Ejemplos:

```
departamentos: CRUD de departamentos con validaciones
marcas: registro automático de entrada y salida
equipos: carga de imágenes con validación de tipo y tamaño
```

---

## Reglas técnicas que aplican a todo el proyecto

Aplican para todos los módulos, sin excepción:

1. **SQL parametrizado siempre.** Nunca concatenar valores dentro de la consulta.
2. **Validar en el backend.** Todo dato que venga del frontend se considera no confiable, aunque el
   formulario ya lo haya validado.
3. **Códigos HTTP correctos:** `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.
4. **Respuestas consistentes:** usar siempre los helpers de `utils/respuesta.js`.
5. **Rutas protegidas:** usar `requiereSesion` y `requiereRol('ADMINISTRADOR')` según corresponda.
6. **Errores controlados:** los mensajes al cliente nunca revelan detalles de la base de datos ni
   del servidor.
7. **Nada sensible en el código:** todo dato de configuración va en `.env`.
8. **El frontend consume la API con `fetch()`** a través de `src/api/cliente.js`.

---

## Pruebas de la API

Antes de conectar el frontend, cada endpoint debe probarse con Postman, Thunder Client o REST
Client, comprobando **tanto solicitudes válidas como solicitudes que produzcan errores**.

---

## Entregables

1. Código fuente del frontend
2. Código fuente del backend
3. Script de creación de la base de datos (`database/init.sql`)
4. Archivos de Docker (`docker-compose.yml`)
5. Repositorio Git utilizado durante el desarrollo
