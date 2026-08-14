# Repartición del trabajo

Fecha de entrega: **26 de agosto**

Cada integrante es responsable del **backend y del frontend** de sus puntos. Es decir: rutas,
controlador, modelo, validaciones y la pantalla de React correspondiente.

| Integrante    | Puntos               | Carpetas donde trabaja                                            |
| ------------- | -------------------- | ------------------------------------------------------------------ |
| **Luis**      | Base + 1, 2, 3       | `backend/src/` (config, middlewares, utils, auth), `frontend/src/` |
| **Sander**    | 4, 5, 6, 7           | `modulos/usuarios/`, `modulos/departamentos/`                      |
| **Jorge**     | 8, 9, 10 + Config.   | `modulos/marcas/`, `modulos/dispositivos/`, `modulos/configuracion/` |
| **Dubán**     | 11, 12, 13 + 19, 20  | `modulos/reportes/`, `modulos/prestamos/` (devolución e historial) |
| **Sebastián** | 14, 15, 16 + 17, 18  | `modulos/equipos/`, `modulos/prestamos/` (registro y validaciones) |

---

## Luis — Base del proyecto + puntos 1, 2, 3

**Ya está hecho. Es lo que viene en este repositorio.**

- Estructura completa del backend y del frontend
- `docker-compose.yml` (MySQL + phpMyAdmin) y `database/init.sql` con todas las tablas
- Pool de conexiones, variables de entorno, formato de respuestas de la API
- Sesiones con cookies (`HttpOnly`, `SameSite`, expiración) y middlewares de sesión, rol y errores
- **Punto 1** — Registro de usuario, con validaciones y contraseña guardada como hash
- **Punto 2** — Inicio de sesión por usuario o correo, creando la sesión en el servidor
- **Punto 3** — Cierre de sesión, destruyendo la sesión e invalidando la cookie

**Pendiente de Luis:** apoyar al grupo con dudas de la base y armar la presentación final.

---

## Sander — Puntos 4, 5, 6 y 7

Carpetas: `backend/src/modulos/usuarios/` y `backend/src/modulos/departamentos/`

### Punto 4 — Perfil del usuario
- Ver y modificar: nombre, fecha de nacimiento y departamento o carrera
- **No** se pueden modificar: correo ni nombre de usuario
- Mostrar mensaje de éxito o de error según el resultado

### Punto 5 — Cambio de contraseña
- Recibe contraseña actual, nueva y confirmación
- El backend **verifica primero la contraseña actual** antes de cambiarla
- La nueva contraseña se guarda como hash

### Punto 6 — Recuperación de contraseña
- El usuario ingresa su correo o nombre de usuario
- El servidor genera un token temporal y arma el enlace:
  `http://localhost:5173/restablecer-password?token=xxxxxxxx`
- El token debe: tener fecha de expiración, usarse **una sola vez** y validarse en el servidor
- Tabla lista en la base de datos: `tokens_recuperacion`

### Punto 7 — Departamentos o carreras
- CRUD completo: registrar, consultar, modificar y eliminar
- Campos: nombre, descripción y encargado
- Sólo el administrador
- **Antes de eliminar hay que verificar que ningún usuario esté asociado** a ese departamento
- El `GET` de listado ya está hecho porque el formulario de registro lo necesita

---

## Jorge — Puntos 8, 9, 10 y módulo de configuración

Carpetas: `backend/src/modulos/marcas/`, `dispositivos/` y `configuracion/`

### Punto 8 — Registro de marcas
- Guarda: usuario, fecha, hora, tipo de marca, dirección IP y dispositivo
- Tipos: `ENTRADA` y `SALIDA`
- **El servidor decide automáticamente** cuál corresponde según la última marca del día
- No se permiten marcas inconsistentes (dos entradas seguidas sin una salida)
- La IP se obtiene en el backend, nunca se recibe desde el frontend

### Punto 9 — Dispositivos autorizados
- Cada usuario registra uno o más dispositivos
- Campos: identificador, nombre, descripción, fecha de registro, propietario y estado
- **No se usa la dirección MAC.** El sistema genera un identificador único y lo guarda en una cookie

### Punto 10 — Validación de ubicación de red
- Verificar la IP desde la que se realiza la marca contra los rangos permitidos
- Los rangos los configura el administrador (tabla `configuracion`, clave `rangos_ip_permitidos`)
- Si no cumple, mostrar: *"No es posible realizar la marca desde la red actual."*
- **Esta validación va principalmente en el backend**

### Módulo de configuración
- Consultar y modificar los parámetros del sistema, sólo el administrador
- Parámetros ya creados: nombre de la institución, rangos de IP, minutos de sesión, tamaño máximo
  de archivos

---

## Dubán — Puntos 11, 12, 13, 19 y 20

Carpetas: `backend/src/modulos/reportes/` y `prestamos/` (parte de devoluciones)

### Punto 11 — Reporte de marcas
- Tabla con: usuario, fecha, hora de entrada, hora de salida, dispositivo y dirección IP
- Sólo el administrador

### Punto 12 — Filtros de marcas
- Filtros enviados como parámetros al backend, combinables entre sí:
  `GET /api/reportes/marcas?usuario=12&mes=8&anio=2026`
- Filtros: usuario, año, mes, día y departamento
- Armar la consulta con parámetros, **nunca concatenando** los valores

### Punto 13 — Exportación de reportes
- Al menos **dos formatos** distintos: JSON, XML o PDF
- El backend genera el contenido y define el `Content-Type` correcto

### Punto 19 — Devolución de equipos
- **Devolución individual:** devolver sólo uno de los equipos del préstamo
- **Devolución completa:** devolver todos los equipos pendientes
- El equipo devuelto vuelve al estado `DISPONIBLE`
- Cuando todos los equipos se devuelven, el préstamo pasa a `FINALIZADO`

### Punto 20 — Historial de préstamos
- Consultar préstamos anteriores con filtros por usuario, fecha, estado y equipo

> **Coordinar con Sebastián:** ambos trabajan en `modulos/prestamos/`. Sebastián arma el modelo y el
> controlador base (puntos 17 y 18); Dubán agrega encima las funciones de devolución e historial.
> Conviene que Sebastián suba primero sus archivos para evitar conflictos.

---

## Sebastián — Puntos 14, 15, 16, 17 y 18

Carpetas: `backend/src/modulos/equipos/` y `prestamos/` (registro y validaciones)

### Punto 14 — Inventario de equipos
- CRUD de equipos: código (**único**), descripción, imagen y estado
- Estados: `DISPONIBLE`, `PRESTADO`, `MANTENIMIENTO`, `INACTIVO`

### Punto 15 — Manejo de imágenes
- Cargar una imagen por equipo (usar `multer`, guardar en `backend/uploads/equipos`)
- Validar tipo de archivo y tamaño
- Generar un nombre seguro y **no sobrescribir archivos existentes**
- Opcional: Drag & Drop en la interfaz

### Punto 16 — Consulta del inventario
- Tabla con: código, descripción, estado y acciones disponibles
- Las acciones se habilitan o deshabilitan **según el estado del equipo**

### Punto 17 — Registro de préstamo
- Estructura de **encabezado y detalle**
  - Encabezado: número de préstamo, usuario, fecha, encargado y estado
  - Detalle: equipo, descripción y estado de devolución
- Un préstamo puede incluir varios equipos
- Usar una **transacción** para que el encabezado y el detalle se guarden juntos o no se guarde nada

### Punto 18 — Validaciones del préstamo
Antes de guardar, el servidor verifica:
- que el usuario exista
- que exista al menos un equipo
- que el equipo esté disponible
- que el mismo equipo no aparezca dos veces
- que ningún equipo esté actualmente prestado

Al guardar, los equipos pasan automáticamente a `PRESTADO`.

---

## Calendario sugerido

| Fechas          | Meta                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| 13 – 14 de ago. | Todos clonan el repositorio y dejan corriendo Docker, backend y frontend |
| 15 – 19 de ago. | Backend de cada quien terminado y probado con Postman o Thunder Client   |
| 20 – 23 de ago. | Pantallas de React de cada módulo                                        |
| 24 de ago.      | Integración: revisar que todo funcione junto                             |
| 25 de ago.      | Pruebas finales, corrección de errores y repaso del proyecto completo    |
| 26 de ago.      | **Entrega**                                                             |

> La rúbrica da 20 puntos por trabajo en equipo y 20 más porque **todos** demuestren conocimiento
> del proyecto. No basta con que cada quien sepa su parte: hay que repasar el proyecto completo
> antes de la entrega.

---

## Antes de subir cambios

1. `git pull` para traer lo último
2. Probar que el backend levanta sin errores: `npm run dev`
3. Probar los endpoints con Postman o Thunder Client, **incluyendo casos que den error**
4. Confirmar que no se está subiendo ningún archivo `.env`
5. Commit con el formato `<módulo>: <qué se hizo>` y `git push`
