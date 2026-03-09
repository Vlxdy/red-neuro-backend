# Manual de instalación

## 1. Requerimientos

| Nombre       | Versión | Descripción                                            | Instalación                                      |
| ------------ | ------- | ------------------------------------------------------ | ------------------------------------------------ |
| `PostgreSQL` | ^17     | Gestor de base de datos.                               | https://www.postgresql.org/download/linux/debian |
| `NodeJS`     | ^22     | Entorno de programación de JavaScript.                 | `nvm install 22` https://github.com/nvm-sh/nvm   |
| `NPM`        | ^10     | Gestor de paquetes de NodeJS.                          | `npm install -g npm@10`                          |
| `PM2`        | ^5.3    | Gestor avanzado de procesos de producción para NodeJS. | `npm install -g pm2@5.3`                         |

## 2. Instalación

### Clonación del proyecto e instalación de dependencias

```bash
# Clonación del proyecto
git clone git@gitlab.com:sistema-alimenta/alimenta-backend-v2.git

# Ingresamos dentro de la carpeta del proyecto
cd alimenta-frontend-v2

# Cambiamos a la rama develop
git checkout develop

# Instalamos dependencias
npm install
```

### Archivos de configuración.

Copiar archivos `.sample` y modificar los valores que sean necesarios (para más detalles revisa la sección **Variables
de entorno**).

```bash
# Variables de entorno globales
cp .env.sample .env

# [OPCIONAL] Para el modo producción
cp ecosystem.config.js.sample ecosystem.config.js
```

### Creación y configuración de la Base de Datos

Ver el archivo [database/scripts/README.md](./database/scripts/README.md)

Una vez se tenga creada la base de datos y sus respectivos esquemas ejecutar el siguiente comando para crear las tablas:

```bash
# Configura la base de datos.
npm run setup
```

### Despliegue de la aplicación

```bash
# Ejecución en modo desarrollo
npm run start

# Ejecución en modo desarrollo (live-reload)
npm run start:dev

# Ejecución en modo desarrollo (muestra logs de las consultas SQL)
npm run dev

# Ejecución en modo PRODUCCIÓN
npm run build
npm run start:prod

# Ejecución en modo PRODUCCIÓN (con proceso activo en segundo plano)
npm run build
pm2 start ecosystem.config.js
```

### Ejecución de pruebas unitarias y de integración

```bash
# Todas las pruebas
npm run test

# Pruebas e2e
npm run test:e2e

# Pruebas de cobertura
npm run test:cov
```

### Comandos útiles para el modo desarrollo

```bash
# Verifica la sintaxis
npm run lint

# Crea una nueva migración
npm run seeds:create database/seeds/addColumnCategoria

# Ejecuta las migraciones
npm run seeds:run
```

### Variables de entorno

**Datos de despliegue**

| Variable   | Valor por defecto | Descripción                                                    |
| ---------- | ----------------- | -------------------------------------------------------------- |
| `NODE_ENV` | `development`     | Ambiente de despliegue (`development`, `test` o `production`). |
| `PORT`     | `4500`            | Puerto en el que se levantará la aplicación.                   |

\*\*\* La URL de despliegue sería: `http://localhost:4500/api/estado`

**Configuración de la base de datos**

| Variable                 | Valor por defecto | Descripción                                                                             |
| ------------------------ | ----------------- | --------------------------------------------------------------------------------------- |
| `DB_HOST`                | `localhost`       | Host de la base de datos.                                                               |
| `DB_USERNAME`            | `postgres`        | nombre de usuario de la base de datos.                                                  |
| `DB_PASSWORD`            | `postgres`        | contraseña de la base de datos.                                                         |
| `DB_DATABASE`            | `database_db`     | nombre de la base de datos.                                                             |
| `DB_PORT`                | `5432`            | puerto de despliegue de la base de datos.                                               |
| `DB_SCHEMA`              | `proyecto`        | Para almacenar las tablas del proyecto, y todo lo relacionado con la lógica de negocio. |
| `DB_SCHEMA_USUARIOS`     | `usuarios`        | Para almacenar la tabla usuarios, roles y todo lo relacionado con la autenticación.     |
| `DB_SCHEMA_PARAMETRICAS` | `parametricas`    | Para almacenar tablas de tipo paramétricas.                                             |

**Configuración general de la aplicación**

| Variable                     | Valor por defecto | Descripción                                                                  |
| ---------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `PATH_SUBDOMAIN`             | `api`             | Prefijo para todas las rutas de los servicios (Se debe mantener este valor). |
| `REQUEST_TIMEOUT_IN_SECONDS` | `30`              | Tiempo máximo de espera para devolver el resultado de una petición.          |

**Configuración para módulo de autenticación**

| Variable                   | Valor por defecto | Descripción                                                                             |
| -------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
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

| Variable                  | Valor por defecto | Descripción                                                       |
| ------------------------- | ----------------- | ----------------------------------------------------------------- |
| `MSJ_URL`                 |                   | URL de consumo al servicio de Mensajería Electrónico (Alertín).   |
| `MSJ_TOKEN`               |                   | TOKEN de consumo al servicio de Mensajería Electrónico (Alertín). |
| `MSJ_TIMEOUT_EN_SEGUNDOS` | `10`              | Tiempo máximo de espera para las consultas a mensajería           |

**Configurar la URL del frontend**

| Variable       | Valor por defecto | Descripción                                                           |
| -------------- | ----------------- | --------------------------------------------------------------------- |
| `URL_FRONTEND` |                   | dominio en el que se encuentra levantado el frontend, si corresponde. |

**Configuración para almacenamiento de archivos**

| Variable           | Valor por defecto | Descripción                                                 |
| ------------------ | ----------------- | ----------------------------------------------------------- |
| `STORAGE_NFS_PATH` |                   | ruta en el que se almacenarán los archivos, si corresponde. |

**Configuración de Logs**

| Variable                  | Valor por defecto | Descripción                                                                                |
| ------------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| `LOG_ENABLED`             | `true`            | Habilita el registro de logs.                                                              |
| `LOG_LEVEL`               | `info`            | Nivel de logs (en PRODUCCIÓN utilizar el valor `info`)                                     |
| `LOG_AUDIT`               | `application ...` | Habilita los logs de auditoria.                                                            |
| `LOG_CONSOLE`             | `true`            | Indica si se mostrarán los logs en la terminal (en PRODUCCIÓN utilizar el valor `false`)   |
| `LOG_SQL`                 | `true`            | Habilita los logs SQL (en PRODUCCIÓN utilizar el valor `false`)                            |
| `LOG_FILE_ENABLED`        | `true`            | Para guardar logs en ficheros.                                                             |
| `LOG_FILE_PATH`           | `/tmp/logs/`      | Ruta absoluta de la carpeta logs. Si esta vacio no se crearán los archvos.                 |
| `LOG_FILE_SIZE`           | `50M`             | Para el rotado de logs por tamaño (`K` = kilobytes, `M` = megabytes, `G` = gigabytes).     |
| `LOG_FILE_INTERVAL`       | `YM`              | Para el rotado de logs por tiempo (`Y` = cada año, `YM` = cada mes, `YMD` = cada día, ...) |
| `LOG_LOKI_ENABLED`        | `false`           | Para guardar logs en la nube con loki.                                                     |
| `LOG_LOKI_URL`            |                   | Indica la URL del servicio de loki para el registro de logs.                               |
| `LOG_LOKI_USERNAME`       |                   | Indica el nombre de usuario para autenticarse con el servicio de loki.                     |
| `LOG_LOKI_PASSWORD`       |                   | Indica la contraseña de usuario para autenticarse con el servicio de loki.                 |
| `LOG_LOKI_BATCHING`       | `true`            | Habilitado el envío de logs por lote cuando se utiliza loki.                               |
| `LOG_LOKI_BATCH_INTERVAL` | `5`               | Tiempo en segundos para el envío de logs con loki si `LOG_BATCHING=true`.                  |

**Configuración para notificaciones móviles**

> En esta etapa se envía principalmente resumen diario por cantidad de citas (no por cada cita individual).

| Variable                         | Valor por defecto | Descripción                                                                                  |
| -------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| `NOTIF_DAILY_SUMMARY_ENABLED`    | `true`            | Habilita o deshabilita el envío del resumen diario de citas.                                 |
| `NOTIF_DAILY_SUMMARY_HOUR`       | `06:45`           | Hora de envío del resumen diario en formato `HH:mm` (24 horas).                              |
| `NOTIF_PUSH_ALWAYS`              | `true`            | Envía push incluso cuando la app está abierta (además de socket).                            |
| `CITAS_AUTO_NO_ASISTIO_ENABLED`  | `true`            | Habilita cambio automático a estado `NO_ASISTIO` cuando la cita no fue completada.          |
| `CITAS_AUTO_NO_ASISTIO_CRON`     | `0 1 * * *`       | Expresión cron para ejecutar la evaluación automática de citas no completadas.               |

**Configuración de credenciales push (Firebase Admin SDK)**

> Para backend en esta etapa se usará el JSON descargado de Firebase Admin SDK.

| Variable               | Valor por defecto | Descripción                                                                 |
| ---------------------- | ----------------- | --------------------------------------------------------------------------- |
| `PUSH_PROVIDER`        | `fcm`             | Proveedor push activo (actualmente `fcm`).                                 |
| `FCM_CREDENTIALS_FILE` |                   | Ruta local al JSON de service account descargado de Firebase para backend. |

