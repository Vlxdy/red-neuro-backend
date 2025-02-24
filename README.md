# Alimenta - NestJS con TypeORM

![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-orange?style=flat-square)
<a href="./">
<img src="https://img.shields.io/badge/version-v1.9.1-blue" alt="Versión">
</a>
<a href="./LICENSE">
<img src="https://img.shields.io/static/v1?label=license&message=LPG%20-%20Bolivia&color=green" alt="Licencia: LPG - Bolivia" />
</a>

## 🚀 Características

- 🔐 Sistema de autenticación robusto con JWT y Ciudadanía Digital
- 🔒 Autorización avanzada con Casbin para control de acceso basado en roles
- 📨 Cliente para Mensajería Electrónica
- 📊 ORM TypeORM para manejo eficiente de base de datos
- 📝 Documentación automática de API con OpenAPI (Swagger)
- 🧪 Configuración de pruebas con Jest
- 🐳 Dockerización para fácil despliegue y desarrollo

## 🛠️ Tecnologías principales

- [NestJS](https://nestjs.com)
- [TypeScript](https://www.typescriptlang.org)
- [PostgreSQL](https://www.postgresql.org)
- [TypeORM](https://typeorm.io)
- [Passport.js](http://www.passportjs.org)
- [Jest](https://jestjs.io)
- [OpenAPI](https://www.openapis.org)
- [Casbin](https://casbin.org)
- [PinoJs](https://getpino.io)
- [Docker](https://www.docker.com)

## 📁 Estructura del proyecto

```
src/
├── app.module.ts              # Módulo principal de la aplicación
├── application/               # Módulos de la aplicación
│   └── parametro/             # Ejemplo de módulo (Parámetros)
├── common/                    # Utilidades y componentes comunes
├── core/                      # Módulos centrales (autenticación, autorización, etc.)
│   ├── authentication/        # Módulo de autenticación
│   ├── authorization/         # Módulo de autorización
│   ├── config/                # Configuraciones
│   ├── external-services/     # Servicios externos (IOP, mensajería)
│   ├── logger/                # Módulo de logging
│   └── usuario/               # Módulo de usuarios
├── main.ts                    # Punto de entrada de la aplicación
└── templates/                 # Plantillas (ej. para emails)
```

## 📚 Documentación

- [Instalación y Configuración](INSTALL.md)
- [Arquitectura](/docs/arquitectura.md)
- [Documentación de APIs](/docs/openapi.yaml)
- [Documentación de Permisos](/docs/permisos.md)

## 🧪 Pruebas

Ejecuta las pruebas con:

```bash
npm run test
```

## 📦 Compilación para producción

```bash
npm run build
```

## 🐳 Docker

Para ejecutar la aplicación en un contenedor Docker:

```bash
docker-compose up -d
```
