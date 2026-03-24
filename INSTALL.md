# Manual de instalación y configuración

Esta guía resume la forma recomendada de levantar **Red Neuro Backend** con la configuración actual del sistema.

## 1. Requerimientos

| Componente | Versión recomendada | Detalle                                                        |
| ---------- | ------------------- | -------------------------------------------------------------- |
| Node.js    | `>= 22`             | Requerido por `package.json`.                                  |
| npm        | `>= 10`             | Requerido por `package.json`.                                  |
| PostgreSQL | `16+`               | Base de datos principal del sistema.                           |
| PM2        | `5+`                | Opcional para ejecución persistente en producción.             |
| Docker     | Actual              | Opcional para base de datos local o despliegue containerizado. |

## 2. Clonación e instalación

```bash
# Clona el repositorio
git clone <url-del-repositorio>

# Ingresa al proyecto
cd red-neuro-backend

# Instala dependencias
npm install
```

## 3. Configuración inicial

Copia el archivo de ejemplo y ajusta los valores a tu entorno.

```bash
cp .env.sample .env
```

Si vas a ejecutar con PM2 en producción, también puedes preparar el archivo base:

```bash
cp ecosystem.config.js.sample ecosystem.config.js
```

## 4. Base de datos

### Opción recomendada: seguir la guía del repositorio

Consulta [`database/scripts/README.md`](./database/scripts/README.md) para crear la base de datos y los esquemas necesarios.

### Inicializar estructura y datos base

Una vez configuradas las credenciales en `.env`, ejecuta:

```bash
npm run setup
```

> `npm run setup` limpia migraciones generadas, elimina el esquema, vuelve a generar la migración inicial, ejecuta migraciones y corre seeds. Úsalo solo cuando quieras reconstruir el estado base de desarrollo.

### Comandos útiles de base de datos

```bash
# Crear base local usando script dockerizado
npm run db:create

# Generar una migración
npm run migrations:generate database/migrations/<nombre>

# Ejecutar migraciones
npm run migrations:run

# Revertir la última migración
npm run migrations:revert

# Crear una seed vacía
npm run seeds:create database/seeds/<nombre>

# Ejecutar seeds
npm run seeds:run

# Eliminar esquema configurado
npm run schema:drop

# Poblar reglas/seed de Casbin
npm run seed:casbin
```

## 5. Ejecución de la aplicación

### Desarrollo

```bash
# Arranque estándar
npm run start

# Arranque con watch
npm run start:dev

# Arranque con logs útiles para desarrollo
npm run dev

# Arranque con inspector
npm run start:debug
```

### Producción

```bash
# Build y ejecución directa
npm run build
npm run start:prod
```

### Producción con PM2

```bash
npm run build
pm2 start ecosystem.config.js
```

## 6. Verificación rápida

Con la aplicación levantada, valida el estado del servicio:

```bash
curl http://localhost:4500/api/estado
```

Si estás en `NODE_ENV=development`, también puedes revisar Swagger en:

```text
http://localhost:4500/api/docs
```

## 7. Pruebas y validaciones

```bash
# Lint
npm run lint

# Tests unitarios / integración
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 8. Variables de entorno

A continuación se documentan las variables vigentes del sistema a partir del código actual y del archivo `.env.sample`.

---

## 8.1 Variables base del servicio

| Variable                     | Ejemplo       | Descripción                                                                           |
| ---------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `NODE_ENV`                   | `development` | Entorno de ejecución. Swagger solo se habilita automáticamente en `development`.      |
| `PORT`                       | `4500`        | Puerto HTTP del backend.                                                              |
| `PATH_SUBDOMAIN`             | `api`         | Prefijo global de rutas. Con este valor, el estado queda en `/api/estado`.            |
| `REQUEST_TIMEOUT_IN_SECONDS` | `30`          | Tiempo máximo por defecto para respuestas HTTP controladas por el interceptor global. |

URL típica local:

```text
http://localhost:4500/api/estado
```

## 8.2 Base de datos

| Variable             | Ejemplo      | Descripción                                           |
| -------------------- | ------------ | ----------------------------------------------------- |
| `DB_HOST`            | `localhost`  | Host de PostgreSQL.                                   |
| `DB_PORT`            | `5432`       | Puerto de PostgreSQL.                                 |
| `DB_USERNAME`        | `postgres`   | Usuario de conexión.                                  |
| `DB_PASSWORD`        | `1234`       | Contraseña de conexión.                               |
| `DB_DATABASE`        | `redneurodb` | Base de datos principal.                              |
| `DB_SCHEMA`          | `proyecto`   | Esquema principal de negocio.                         |
| `DB_SCHEMA_USUARIOS` | `usuarios`   | Esquema de usuarios, roles, sesiones y autenticación. |

## 8.3 Autenticación, sesiones y tokens

| Variable                   | Ejemplo              | Descripción                                                                    |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| `JWT_SECRET`               | `__JWT_SECRET__`     | Secreto para firma de access tokens. Debe ser robusto en producción.           |
| `JWT_EXPIRES_IN`           | `30000000000`        | Tiempo de expiración del JWT. El proyecto lo consume desde configuración Nest. |
| `SESSION_SECRET`           | `__SESSION_SECRET__` | Secreto de `express-session`. Es obligatorio para sesiones persistidas.        |
| `REFRESH_TOKEN_NAME`       | `jid`                | Nombre de la cookie del refresh token.                                         |
| `REFRESH_TOKEN_EXPIRES_IN` | `36000000000`        | Vigencia del refresh token en milisegundos.                                    |
| `REFRESH_TOKEN_ROTATE_IN`  | `90000000`           | Ventana de rotación del refresh token en milisegundos.                         |
| `REFRESH_TOKEN_SECURE`     | `false`              | Si la cookie del refresh token se marca como `Secure`.                         |
| `REFRESH_TOKEN_DOMAIN`     | `test.com`           | Dominio de la cookie del refresh token.                                        |
| `REFRESH_TOKEN_PATH`       | `/`                  | Path de la cookie del refresh token.                                           |
| `REFRESH_TOKEN_REVISIONS`  | `*/5 * * * *`        | Cron para revisar/limpiar refresh tokens según el servicio programado.         |

## 8.4 Mensajería por correo

| Variable                 | Ejemplo                  | Descripción                                                                        |
| ------------------------ | ------------------------ | ---------------------------------------------------------------------------------- |
| `EMAIL_USER`             | `correo@dominio.com`     | Cuenta emisora usada por el módulo de mensajería.                                  |
| `EMAIL_PASSWORD`         | `********`               | Credencial o contraseña de aplicación del correo.                                  |
| `EMAIL_RESPONSE_TIMEOUT` | `10`                     | Timeout de la integración de correo en segundos.                                   |
| `URL_FRONTEND`           | `http://localhost:9500/` | Base URL del frontend. Se usa en enlaces de activación, recuperación y desbloqueo. |

## 8.5 Datos institucionales usados en comunicaciones

| Variable          | Ejemplo                      | Descripción                                       |
| ----------------- | ---------------------------- | ------------------------------------------------- |
| `EMPRESA_NOMBRE`  | `Centro Neurológico NeuroAX` | Nombre institucional usado en correos o mensajes. |
| `EMPRESA_CELULAR` | `70000000`                   | Teléfono/celular institucional.                   |
| `EMPRESA_CORREO`  | `contacto@neuroax.bo`        | Correo institucional de referencia.               |

## 8.6 Archivos y almacenamiento

| Variable                 | Ejemplo          | Descripción                                                                                 |
| ------------------------ | ---------------- | ------------------------------------------------------------------------------------------- |
| `STORAGE_NFS_PATH`       | `./tmp/storage/` | Ruta raíz del almacenamiento. El backend expone estáticos desde `STORAGE_NFS_PATH/uploads`. |
| `EVAL_NUTRI_MAX_FILES`   | `5`              | Límite de archivos adjuntos para evaluaciones nutricionales.                                |
| `EVAL_NUTRI_MAX_FILE_MB` | `10`             | Tamaño máximo por archivo adjunto en MB.                                                    |

## 8.7 Logging y observabilidad

| Variable                  | Ejemplo                                                  | Descripción                                          |
| ------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| `LOG_ENABLED`             | `true`                                                   | Activa el sistema de logs.                           |
| `LOG_LEVEL`               | `info`                                                   | Nivel base de logging.                               |
| `LOG_AUDIT`               | `application request response authentication mensajeria` | Canales de auditoría habilitados.                    |
| `LOG_CONSOLE`             | `true`                                                   | Imprime logs en consola.                             |
| `LOG_SQL`                 | `true`                                                   | Activa logging de consultas SQL.                     |
| `LOG_HTTP_TRACE`          | `true`                                                   | Imprime trazas HTTP simples `[IN]/[OUT]` en consola. |
| `LOG_FILE_ENABLED`        | `true`                                                   | Guarda logs en archivos rotativos.                   |
| `LOG_FILE_PATH`           | `./tmp/logs/`                                            | Carpeta donde se almacenan logs de archivo.          |
| `LOG_FILE_SIZE`           | `50M`                                                    | Límite por tamaño antes del rotado.                  |
| `LOG_FILE_INTERVAL`       | `YM`                                                     | Rotado temporal (`Y`, `YM`, `YMD`, etc.).            |
| `LOG_LOKI_ENABLED`        | `false`                                                  | Habilita envío de logs a Loki.                       |
| `LOG_LOKI_URL`            | `http://localhost:3100/`                                 | URL del servicio Loki.                               |
| `LOG_LOKI_USERNAME`       | ``                                                       | Usuario de Loki, si aplica.                          |
| `LOG_LOKI_PASSWORD`       | ``                                                       | Contraseña de Loki, si aplica.                       |
| `LOG_LOKI_BATCHING`       | `true`                                                   | Envía logs a Loki en lote.                           |
| `LOG_LOKI_BATCH_INTERVAL` | `5`                                                      | Intervalo en segundos para flush de lotes a Loki.    |

## 8.8 Citas, automatizaciones y notificaciones internas

| Variable                         | Ejemplo     | Descripción                                                     |
| -------------------------------- | ----------- | --------------------------------------------------------------- |
| `CITA_CONSULTA_DURACION_MINUTOS` | `15`        | Duración base de citas de tipo consulta.                        |
| `NOTIF_DAILY_SUMMARY_ENABLED`    | `true`      | Activa el resumen diario de citas para usuarios destinatarios.  |
| `NOTIF_DAILY_SUMMARY_HOUR`       | `06:45`     | Hora exacta (`HH:mm`) en la que se dispara el resumen diario.   |
| `NOTIF_PUSH_ALWAYS`              | `true`      | Política declarativa para envío push incluso con app abierta.   |
| `CITAS_AUTO_NO_ASISTIO_ENABLED`  | `true`      | Activa la revisión automática para marcar citas no completadas. |
| `CITAS_AUTO_NO_ASISTIO_CRON`     | `0 1 * * *` | Cron principal para la revisión automática de citas.            |

## 8.9 Push notifications / Firebase

| Variable               | Ejemplo                                     | Descripción                                                                                     |
| ---------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `PUSH_PROVIDER`        | `fcm`                                       | Proveedor push declarado para el despliegue actual.                                             |
| `FCM_CREDENTIALS_FILE` | `settings/red-neuro-firebase-adminsdk.json` | Ruta al JSON del service account de Firebase Admin SDK. Debe existir físicamente en el entorno. |

## 8.10 Política de versión para apps móviles

Estas variables alimentan la respuesta de `GET /api/estado` cuando el cliente envía `platform` y `version`.

| Variable                        | Ejemplo                       | Descripción                               |
| ------------------------------- | ----------------------------- | ----------------------------------------- |
| `MOBILE_ANDROID_MIN_VERSION`    | `1.8.0`                       | Versión mínima permitida para Android.    |
| `MOBILE_ANDROID_STABLE_VERSION` | `1.9.3`                       | Versión estable recomendada para Android. |
| `MOBILE_ANDROID_STORE_URL`      | `https://play.google.com/...` | URL de actualización en Play Store.       |
| `MOBILE_IOS_MIN_VERSION`        | `1.7.5`                       | Versión mínima permitida para iOS.        |
| `MOBILE_IOS_STABLE_VERSION`     | `1.8.2`                       | Versión estable recomendada para iOS.     |
| `MOBILE_IOS_STORE_URL`          | `https://apps.apple.com/...`  | URL de actualización en App Store.        |

---

## 9. Recomendaciones para producción

- Usa secretos reales y largos para `JWT_SECRET` y `SESSION_SECRET`.
- No subas el JSON de Firebase al repositorio si contiene credenciales reales.
- Configura `LOG_CONSOLE=false` y ajusta `LOG_SQL=false` si el volumen de logs es alto.
- Asegura permisos de escritura para `LOG_FILE_PATH` y `STORAGE_NFS_PATH`.
- Si corres detrás de un proxy o dominio real, revisa `REFRESH_TOKEN_SECURE`, `REFRESH_TOKEN_DOMAIN` y CORS.
- Verifica que `URL_FRONTEND` apunte al frontend correcto, porque se usa en enlaces enviados por correo.
