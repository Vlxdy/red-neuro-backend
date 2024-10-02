# Backend Base - NestJS con TypeORM

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

Backend Base es una plantilla robusta y escalable para el desarrollo de APIs, diseñada para ser compatible con
el [Frontend Base](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-next-base-frontend) creado con
Next.js.

## 🚀 Características

- 🔐 Sistema de autenticación robusto con JWT y Ciudadanía Digital
- 🔒 Autorización avanzada con Casbin para control de acceso basado en roles
- 🌐 Clientes para interoperabilidad (SEGIP, SIN)
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

## 🚀 Inicio rápido

1. Clona el repositorio:
   ```bash
   git clone https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend.git mi-proyecto
   cd mi-proyecto
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus configuraciones.

4. Inicia la base de datos (requiere Docker):
   ```bash
   npm run db:create
   ```

5. Inicia el servidor de desarrollo:
   ```bash
   npm run start:dev
   ```

6. Abre [http://localhost:3000/api](http://localhost:3000/api) para ver la documentación de la API.

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

## 💡 Recomendaciones para usar como base de un nuevo proyecto

Para usar este proyecto como base de un nuevo proyecto, sigue estos pasos:

1. Crea un nuevo proyecto en [Gitlab](https://gitlab.agetic.gob.bo/projects/new) y clónalo en local.

2. Añade este proyecto como otro origen, ejecutando dentro del nuevo proyecto:
   ```bash
   git remote add origin2 git@gitlab.agetic.gob.bo:agetic/agetic/proyectos-base/agetic-nestjs-base-backend.git
   ```

3. Descarga los commits desde el 2.º origen, ejecutando:
   ```bash
   git pull origin2 master --allow-unrelated-histories
   ```


## 🔖 Versionado

Para generar una nueva versión:

1. Actualiza la versión en `package.json`
2. Ejecuta:
   ```bash
   npm run release -- --release-as patch
   ```
3. Publica los tags:
   ```bash
   git push --follow-tags origin master
   ```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o realiza un pull request con tus cambios.

## 👥 Colaboradores

- almamani@agetic.gob.bo
- jpoma@agetic.gob.bo
- rquispe@agetic.gob.bo
- wilmer.quispe@agetic.gob.bo
- ivillarreal@agetic.gob.bo

## 📄 Licencia

Este proyecto está bajo la [Licencia LPG-Bolivia](LICENSE).

## 📞 Contacto

Para más información, contacta a: contacto@agetic.gob.bo
