# Manual de instalación

## 1. Requerimientos

| Nombre       | Versión | Descripción                                            | Instalación                                      |
|--------------|---------|--------------------------------------------------------|--------------------------------------------------|
| `PostgreSQL` | ^14     | Gestor de base de datos.                               | https://www.postgresql.org/download/linux/debian |
| `NodeJS`     | ^18     | Entorno de programación de JavaScript.                 | `nvm install 18` https://github.com/nvm-sh/nvm   |
| `NPM`        | ^9      | Gestor de paquetes de NodeJS.                          | `npm install -g npm@9.7.1`                       |
| `PM2`        | ^5.3    | Gestor avanzado de procesos de producción para NodeJS. | `npm install -g pm2@5.3`                         |

## 2. Instalación

### Clonación del proyecto e instalación de dependencias

```bash
# Clonación del proyecto
git clone git@gitlab.agetic.gob.bo:agetic/agetic/proyectos-base/agetic-nestjs-base-backend.git

# Ingresamos dentro de la carpeta del proyecto
cd agetic-nestjs-base-backend

# Cambiamos a la rama develop
git checkout develop

# Instalamos dependencias
npm install
```

### Archivos de configuración.

Copiar archivos `.sample` y modificar los valores que sean necesarios.

```bash
# Variables de entorno globales
cp .env.sample .env

# Otros parámetros requeridos
cp src/common/params/index.ts.sample src/common/params/index.ts

# [OPCIONAL] Para el modo producción
cp ecosystem.config.js.sample ecosystem.config.js
```

## Creación y configuración de la Base de Datos

```bash
# Crear los siguientes esquemas de base de datos:
create schema proyecto;
create schema usuarios;
create schema parametricas;
```

Para más detalles ver el archivo [database/scripts/CREATE_DATABASE.md](./database/scripts/CREATE_DATABASE.md)

```bash
# Configura la base de datos.
npm run setup
```

## Despliegue de la aplicación

```bash
# Ejecución en modo desarrollo
npm run start

# Ejecución en modo desarrollo (live-reload)
npm run start:dev

# Ejecución en modo desarrollo (muestra logs de las consultas SQL)
npm run start:dev:sql

# Ejecución en modo PRODUCCIÓN
npm run build
npm run start:prod

# Ejecución en modo PRODUCCIÓN (con proceso activo en segundo plano)
npm run build
pm2 start ecosystem.config.js
```

## Ejecución de pruebas unitarias y de integración

```bash
# Todas las pruebas
npm run test

# Pruebas e2e
npm run test:e2e

# Pruebas de cobertura
npm run test:cov
```

## Comandos útiles para el modo desarrollo

```bash
# Verifica la sintaxis
npm run lint

# Crea una nueva migración
npm run seeds:create database/seeds/addColumnCategoria

# Ejecuta las migraciones
npm run seeds:run
```

## Variables de entorno

**Datos de despliegue**

| Variable   | Valor por defecto | Descripción                                  |
|------------|-------------------|----------------------------------------------|
| `NODE_ENV` | `development`     | Ambiente de despliegue.                      |
| `PORT`     | `3000`            | Puerto en el que se levantará la aplicación. |

\*\*\* La URL de despliegue sería: `http://localhost:3000/api/estado`

**Configuración de la base de datos**

| Variable                 | Valor por defecto | Descripción                                                                                       |
|--------------------------|-------------------|---------------------------------------------------------------------------------------------------|
| `DB_HOST`                | `localhost`       | Host de la base de datos.                                                                         |
| `DB_USERNAME`            | `postgres`        | nombre de usuario de la base de datos.                                                            |
| `DB_PASSWORD`            | `postgres`        | contraseña de la base de datos.                                                                   |
| `DB_DATABASE`            | `database_db`     | nombre de la base de datos.                                                                       |
| `DB_PORT`                | `5432`            | puerto de despliegue de la base de datos.                                                         |
| `DB_SCHEMA`              | `proyecto`        | Utilizado para almacenar las tablas del proyecto, y todo lo relacionado con la lógica de negocio. |
| `DB_SCHEMA_USUARIOS`     | `usuarios`        | Utilizado para almacenar la tabla usuarios, roles y todo lo relacionado con la autenticación.     |
| `DB_SCHEMA_PARAMETRICAS` | `parametricas`    | Utilizado para almanecar tablas de tipo paramétricas.                                             |

**Configuración general de la aplicación**

| Variable         | Valor por defecto | Descripción                                                                  |
|------------------|-------------------|------------------------------------------------------------------------------|
| `PATH_SUBDOMAIN` | `api`             | Prefijo para todas las rutas de los servicios (Se debe mantener este valor). |

**Configuración para módulo de autenticación**

| Variable                   | Valor por defecto | Descripción                                                                             |
|----------------------------|-------------------|-----------------------------------------------------------------------------------------|
| `JWT_SECRET`               |                   | Llave para generar los tokens de autorización. Genera una llave fuerte para producción. |
| `JWT_EXPIRES_IN`           |                   | Tiempo de expiración del token de autorización en milisegundos.                         |
| `REFRESH_TOKEN_NAME`       | `jid`             |                                                                                         |
| `REFRESH_TOKEN_EXPIRES_IN` |                   | tiempo en milisegundos                                                                  |
| `REFRESH_TOKEN_ROTATE_IN`  |                   | tiempo en milisegundos                                                                  |
| `REFRESH_TOKEN_SECURE`     | `false`           |                                                                                         |
| `REFRESH_TOKEN_DOMAIN`     |                   | dominio de despliegue                                                                   |
| `REFRESH_TOKEN_PATH`       | `/`               |                                                                                         |
| `REFRESH_TOKEN_REVISIONS`  | `*/5 * * * *`     |                                                                                         |

**Configuración para el servicio de Mensajería Electrónica (Alertín), si se utiliza en el sistema**

| Variable    | Valor por defecto | Descripción                                                       |
|-------------|-------------------|-------------------------------------------------------------------|
| `MSJ_URL`   |                   | URL de consumo al servicio de Mensajería Electrónico (Alertín).   |
| `MSJ_TOKEN` |                   | TOKEN de consumo al servicio de Mensajería Electrónico (Alertín). |

**Configuración para el servicio SEGIP de IOP, si corresponde**

| Variable          | Valor por defecto | Descripción                                              |
|-------------------|-------------------|----------------------------------------------------------|
| `IOP_SEGIP_URL`   |                   | URL de consumo al servicio interoperabilidad de SEGIP.   |
| `IOP_SEGIP_TOKEN` |                   | Token de consumo al servicio interoperabilidad de SEGIP. |

**Configuración para el servicio SIN de IOP, si corresponde**

| Variable        | Valor por defecto | Descripción                                           |
|-----------------|-------------------|-------------------------------------------------------|
| `IOP_SIN_URL`   |                   | URL de consumo al Servicio de Impuestos Nacionales.   |
| `IOP_SIN_TOKEN` |                   | Token de consumo al Servicio de Impuestos Nacionales. |

**Configuración para la integracion de autenticación con Ciudadanía Digital**

| Variable                        | Valor por defecto | Descripción |
|---------------------------------|-------------------|-------------|
| `OIDC_ISSUER`                   |                   |             |
| `OIDC_CLIENT_ID`                |                   |             |
| `OIDC_CLIENT_SECRET`            |                   |             |
| `OIDC_SCOPE`                    |                   |             |
| `OIDC_REDIRECT_URI`             |                   |             |
| `OIDC_POST_LOGOUT_REDIRECT_URI` |                   |             |
| `SESSION_SECRET`                |                   |             |

**Configurar la URL del frontend, según el ambiente de despliegue**

| Variable       | Valor por defecto | Descripción                                                           |
|----------------|-------------------|-----------------------------------------------------------------------|
| `URL_FRONTEND` |                   | dominio en el que se encuentra levantado el frontend, si corresponde. |

**Configuración para almacenamiento de archivos**

| Variable           | Valor por defecto | Descripción                                                 |
|--------------------|-------------------|-------------------------------------------------------------|
| `STORAGE_NFS_PATH` |                   | ruta en el que se almacenarán los archivos, si corresponde. |

**Configuración de Logs, según el ambiente**

| Variable        | Valor por defecto                        | Descripción                                                                    |
|-----------------|------------------------------------------|--------------------------------------------------------------------------------|
| `LOG_PATH`      |                                          | Ruta absoluta de la carpeta logs. Si esta vacio no se crearán los archvos.     |
| `LOG_SQL`       | `false`                                  | Para la consola (solo para el modo desarrollo) muestra las consultas SQL.      |
| `LOG_SIZE`      | `5M`                                     | Para los ficheros de logs es el tamaño máximo que estos pueden llegar a pesar. |
| `LOG_INTERVAL`  | `1d`                                     | Para los ficheros de logs es el intervalo de tiempo para rotar los ficheros.   |
| `LOG_COMPRESS`  | `false`                                  | Para indicar si se comprimirá o no los ficheros de logs.                       |
| `LOG_HIDE`      | `errorRequest.headers.authorization ...` | Indica los campos que serán ofuscados al momento de guardar los logs.          |
| `LOG_URL`       |                                          |                                                                                |
| `LOG_URL_TOKEN` |                                          |                                                                                |

**Nota.-**

- Para deshabilitar la generación de logs en ficheros `LOG_PATH` debe ser una cadena vacía.

- `LOG_PATH` dentro de esta carpeta automáticamente se creará otro directorio con el nombre del proyecto (propiedad `name`
  del archivo `package.json`) y dentro de esta última se crearán los archivos de logs `error.log`, `warn.log` e `info.log`.

- `LOG_SIZE` acepta los siguientes valores:

    - `G`: Tamaño en GigaBytes. Ej.: `1G`
    - `M`: Tamaño en MegaBytes. Ej.: `1M`
    - `K`: Tamaño en KiloBytes. Ej.: `1K`
    - `B`: Tamaño en Bytes. Ej.: `1B`

- `LOG_INTERVAL` acepta los siguientes valores:

    - `M`: Se genera un nuevo fichero de logs cada mes. Ej.: `1M`
    - `d`: Se genera un nuevo fichero de logs cada día. Ej.: `1d`
    - `h`: Se genera un nuevo fichero de logs cada hora. Ej.: `1h`
    - `m`: Se genera un nuevo fichero de logs cada minuto. Ej.: `1m`
    - `s`: Se genera un nuevo fichero de logs cada segundo. Ej.: `1s`

- `LOG_HIDE` utiliza la librería [fast-redact](https://github.com/davidmarkclements/fast-redact#fast-redact) algunos
  ejemplos:
    - `errorRequest.headers.authorization`
    - `some.list[*].itemProperty.toHide`
