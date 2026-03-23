# Red Neuro Backend

![NestJS](https://img.shields.io/badge/NestJS-11-red?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue?style=flat-square&logo=postgresql)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-orange?style=flat-square)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black?style=flat-square&logo=socketdotio)
![Firebase](https://img.shields.io/badge/Firebase_Admin-13-yellow?style=flat-square&logo=firebase)

Backend principal de **Red Neuro**, construido con **NestJS 11**, **TypeORM** y **PostgreSQL**. El sistema centraliza autenticación, gestión de usuarios, agenda de citas, notificaciones, archivos, mensajería por correo y reglas de versionado para la aplicación móvil.

## 🚀 Estado actual del sistema

Actualmente el backend incluye, entre otros, los siguientes componentes funcionales:

- **API REST con NestJS** y prefijo global configurable mediante `PATH_SUBDOMAIN`.
- **Autenticación** con JWT, refresh token y sesiones persistidas en base de datos.
- **Autorización** basada en roles/permisos con soporte para Casbin.
- **Módulos de negocio** para citas, pacientes, personal de salud, servicios, consultorios y lugares.
- **Notificaciones móviles** con Firebase Admin SDK y almacenamiento de dispositivos push.
- **Resumen diario de citas** y tareas programadas vía `@nestjs/schedule`.
- **Control de versiones mobile** desde `GET /api/estado`, con políticas separadas para Android e iOS.
- **Carga y exposición de archivos** usando `STORAGE_NFS_PATH` y publicación de `/uploads`.
- **Mensajería por correo** para credenciales, recuperación y bloqueo de cuenta.
- **Logging estructurado** con consola, archivos rotativos y opción de envío a Loki.
- **Documentación OpenAPI/Swagger** generada en entorno `development`.

## 🧱 Stack tecnológico

### Base del proyecto
- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)

### Seguridad y autenticación
- [Passport](https://www.passportjs.org/)
- [JWT](https://jwt.io/)
- [express-session](https://github.com/expressjs/session)

### Integraciones
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Nodemailer](https://nodemailer.com/)
- [Socket.IO](https://socket.io/)

### Observabilidad y calidad
- Logger interno sobre [Pino](https://getpino.io/)
- [Jest](https://jestjs.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## 📁 Estructura general

```text
src/
├── app.controller.ts           # Estado del servicio y metadatos mobile
├── app.module.ts               # Módulo raíz
├── main.ts                     # Bootstrap, sesiones, swagger, CORS, static files
├── application/                # Casos de negocio
│   ├── citas/
│   ├── consultorio/
│   ├── lugar/
│   ├── paciente/
│   ├── personal/
│   └── servicio/
├── common/                     # DTOs, pipes, interceptores, middlewares, utilidades
├── core/                       # Capacidades transversales
│   ├── authentication/
│   ├── authorization/
│   ├── config/
│   ├── external-services/
│   ├── file/
│   ├── logger/
│   └── usuario/
├── mobile-version/             # Política de actualización de app móvil
├── socket-example/             # Soporte de sockets / conexión en tiempo real
└── swagger/                    # Documentación complementaria de Swagger
```

## 🔌 Puntos clave de operación

### Endpoint de estado
El backend expone el endpoint de salud y metadatos en:

```bash
GET /api/estado
```

Este endpoint devuelve:
- nombre y versión del servicio,
- entorno activo,
- metadatos de commit/branch cuando existen,
- fecha/hora del servidor,
- y estado de actualización móvil si se envían `platform`, `version` y `build`.

Ejemplo:

```bash
curl "http://localhost:4500/api/estado?platform=android&version=1.9.0&build=104"
```

### Swagger
Swagger se habilita **solo cuando `NODE_ENV=development`**.

Una vez iniciado el proyecto en desarrollo, la documentación queda disponible en:

```bash
http://localhost:4500/api/docs
```

Además, durante el arranque se exporta un `swagger.json` en la raíz del repositorio.

### Archivos estáticos
Si `STORAGE_NFS_PATH` está configurado, el backend publica archivos desde:

```bash
/uploads
```

Por ejemplo, si `STORAGE_NFS_PATH=./tmp/storage`, los archivos se servirán desde `./tmp/storage/uploads`.

## 🛠️ Instalación rápida

### 1. Requisitos
- **Node.js 22 o superior**
- **npm 10 o superior**
- **PostgreSQL 16+** recomendado para desarrollo local

### 2. Instalar dependencias

```bash
git clone <url-del-repositorio>
cd red-neuro-backend
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.sample .env
```

Edita `.env` con tus credenciales reales de base de datos, JWT, correo, almacenamiento y Firebase.

### 4. Crear base de datos
Sigue la guía detallada en [`database/scripts/README.md`](./database/scripts/README.md).

Luego ejecuta la inicialización completa del esquema y seeds:

```bash
npm run setup
```

### 5. Iniciar el backend

```bash
npm run start:dev
```

## 📚 Documentación del proyecto

- [Guía de instalación](./INSTALL.md)
- [Creación de base de datos](./database/scripts/README.md)
- [Arquitectura](./docs/arquitectura.md)
- [OpenAPI](./docs/openapi.yaml)
- [Permisos](./docs/permisos.md)
- [Implementación mobile: version check](./docs/implementacion-mobile-version-check.md)
- [Guía de push notifications](./docs/guia-configuracion-servicios-push.md)

## 🧪 Scripts disponibles

### Desarrollo
```bash
npm run start
npm run start:dev
npm run start:debug
npm run dev
```

### Calidad y formato
```bash
npm run lint
npm run lint:fix
npm run format
npm run format-check
```

### Build y producción
```bash
npm run build
npm run start:prod
```

### Base de datos
```bash
npm run setup
npm run migrations:generate database/migrations/<nombre>
npm run migrations:run
npm run migrations:revert
npm run seeds:create database/seeds/<nombre>
npm run seeds:run
npm run schema:drop
npm run db:create
npm run seed:casbin
```

### Testing
```bash
npm run test
npm run test:single
npm run test:watch
npm run test:cov
npm run test:e2e
npm run test:ci
```

### Utilitarios
```bash
npm run compodoc
npm run db:diagram
npm run data:fake
```

## 🐳 Docker

El repositorio incluye `dockerfile`, `dockerfile.merge` y `dockerfile.setup` para pipelines y despliegues en contenedores. Antes de usar imágenes o despliegues automatizados, asegúrate de proporcionar correctamente el archivo `.env`, credenciales externas y acceso a la base de datos.

## 🔐 Variables de entorno

La referencia operativa actualizada está en:
- [`INSTALL.md`](./INSTALL.md)
- [`.env.sample`](./.env.sample)

Si agregas una nueva variable al código, actualiza ambos archivos para mantener la documentación consistente.
