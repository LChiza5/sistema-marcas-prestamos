-- =====================================================================
-- Sistema de Marcas y Préstamo de Equipos
-- Script de creación de la base de datos
-- Se ejecuta automáticamente al levantar el contenedor de MySQL.
-- =====================================================================

-- Sin esto, el cliente que ejecuta este script al iniciar el contenedor
-- corrompe los caracteres acentuados (á, é, í, ó, ú, ñ) de los INSERT.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS marcas_prestamos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE marcas_prestamos;

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Departamentos o carreras (punto 7)
-- ---------------------------------------------------------------------
CREATE TABLE departamentos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  encargado   VARCHAR(100) NULL
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Usuarios (puntos 1 y 4)
-- La contraseña se almacena únicamente como hash, nunca en texto plano.
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo  VARCHAR(120) NOT NULL,
  fecha_nacimiento DATE         NOT NULL,
  correo           VARCHAR(150) NOT NULL UNIQUE,
  usuario          VARCHAR(50)  NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,
  id_departamento  INT          NULL,
  id_rol           INT          NOT NULL,
  activo           TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_departamento
    FOREIGN KEY (id_departamento) REFERENCES departamentos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_usuarios_rol
    FOREIGN KEY (id_rol) REFERENCES roles (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Sesiones (punto 2)
-- Estructura requerida por el almacén de sesiones de MySQL.
-- ---------------------------------------------------------------------
CREATE TABLE sesiones (
  session_id VARCHAR(128)  NOT NULL PRIMARY KEY,
  expires    INT UNSIGNED  NOT NULL,
  data       MEDIUMTEXT    NULL
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Tokens de recuperación de contraseña (punto 6)
-- ---------------------------------------------------------------------
CREATE TABLE tokens_recuperacion (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT          NOT NULL,
  token      VARCHAR(128) NOT NULL UNIQUE,
  expira_en  DATETIME     NOT NULL,
  usado      TINYINT(1)   NOT NULL DEFAULT 0,
  creado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tokens_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_tokens_expira (expira_en)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Dispositivos autorizados (punto 9)
-- El identificador lo genera el sistema y se guarda en una cookie.
-- No se utiliza la dirección MAC.
-- ---------------------------------------------------------------------
CREATE TABLE dispositivos (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  identificador  VARCHAR(100) NOT NULL UNIQUE,
  nombre         VARCHAR(100) NOT NULL,
  descripcion    VARCHAR(255) NULL,
  fecha_registro TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario     INT          NOT NULL,
  estado         ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  CONSTRAINT fk_dispositivos_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Marcas de entrada y salida (punto 8)
-- ---------------------------------------------------------------------
CREATE TABLE marcas (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario     INT         NOT NULL,
  fecha          DATE        NOT NULL,
  hora           TIME        NOT NULL,
  tipo           ENUM('ENTRADA', 'SALIDA') NOT NULL,
  ip             VARCHAR(45) NOT NULL,
  id_dispositivo INT         NULL,
  CONSTRAINT fk_marcas_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_marcas_dispositivo
    FOREIGN KEY (id_dispositivo) REFERENCES dispositivos (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_marcas_usuario_fecha (id_usuario, fecha)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Equipos (punto 14)
-- ---------------------------------------------------------------------
CREATE TABLE equipos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  codigo      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion VARCHAR(255) NOT NULL,
  imagen      VARCHAR(255) NULL,
  estado      ENUM('DISPONIBLE', 'PRESTADO', 'MANTENIMIENTO', 'INACTIVO')
              NOT NULL DEFAULT 'DISPONIBLE',
  INDEX idx_equipos_estado (estado)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Préstamos: encabezado (punto 17)
-- ---------------------------------------------------------------------
CREATE TABLE prestamos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  numero       VARCHAR(20) NOT NULL UNIQUE,
  id_usuario   INT         NOT NULL,
  fecha        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_encargado INT         NOT NULL,
  estado       ENUM('ACTIVO', 'FINALIZADO') NOT NULL DEFAULT 'ACTIVO',
  CONSTRAINT fk_prestamos_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_prestamos_encargado
    FOREIGN KEY (id_encargado) REFERENCES usuarios (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_prestamos_estado (estado)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Préstamos: detalle (punto 17)
-- La llave única impide que el mismo equipo aparezca dos veces
-- dentro de un mismo préstamo (punto 18).
-- ---------------------------------------------------------------------
CREATE TABLE prestamo_detalle (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  id_prestamo       INT          NOT NULL,
  id_equipo         INT          NOT NULL,
  descripcion       VARCHAR(255) NULL,
  estado_devolucion ENUM('PENDIENTE', 'DEVUELTO') NOT NULL DEFAULT 'PENDIENTE',
  fecha_devolucion  DATETIME     NULL,
  CONSTRAINT fk_detalle_prestamo
    FOREIGN KEY (id_prestamo) REFERENCES prestamos (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_equipo
    FOREIGN KEY (id_equipo) REFERENCES equipos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uq_detalle_prestamo_equipo UNIQUE (id_prestamo, id_equipo)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Configuración del sistema
-- ---------------------------------------------------------------------
CREATE TABLE configuracion (
  clave       VARCHAR(50)  NOT NULL PRIMARY KEY,
  valor       VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255) NULL
) ENGINE = InnoDB;

-- =====================================================================
-- Datos iniciales
-- =====================================================================

INSERT INTO roles (id, nombre) VALUES
  (1, 'ADMINISTRADOR'),
  (2, 'USUARIO');

INSERT INTO departamentos (id, nombre, descripcion, encargado) VALUES
  (1, 'Ingeniería en Tecnologías de Información', 'Carrera de la Sede de Guanacaste', 'Por definir');

-- Usuario administrador inicial. Contraseña: Admin123!
INSERT INTO usuarios
  (nombre_completo, fecha_nacimiento, correo, usuario, password_hash, id_departamento, id_rol)
VALUES
  ('Administrador del Sistema', '1990-01-01', 'admin@utn.ac.cr', 'admin',
   '$2b$10$y3ciaOTSlLcomKAI6aeZcOcY1TUmDlJgerfHbysIsyJlJuH0/alV.', 1, 1);

INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('nombre_institucion', 'Universidad Técnica Nacional', 'Nombre mostrado en la aplicación'),
  ('rangos_ip_permitidos', '127.0.0.1,192.168.0.0/16', 'Direcciones o rangos autorizados para marcar'),
  ('minutos_sesion', '60', 'Tiempo máximo de una sesión en minutos'),
  ('tamano_max_archivo_mb', '2', 'Tamaño máximo permitido para las imágenes de equipos');
