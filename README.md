# Backend Base - NestJS

<p>
  <a href="./">
    <img src="https://img.shields.io/badge/version-v1.9.1-blue" alt="Versión">
  </a>
  <a href="./LICENSE">
      <img src="https://img.shields.io/static/v1?label=license&message=LPG%20-%20Bolivia&color=green" alt="Licencia: LPG - Bolivia" />
  </a>
</p>

## Recomendaciones

Para usar este proyecto como base de un nuevo proyecto, debe seguir los siguientes pasos:

- Crear nuevo proyecto en [Gitlab](https://gitlab.agetic.gob.bo/projects/new) y clonarlo en local
- Añadir este proyecto como otro origen, ejecutar dentro del nuevo proyecto:

```
git remote add origin2 git@gitlab.agetic.gob.bo:agetic/agetic/proyectos-base/agetic-nestjs-base-backend.git
```

- Descargar los commits desde el 2.º origen, ejecutar

```
git pull origin2 master --allow-unrelated-histories
```

## Tecnologías

| Nombre      | Descripción                                                       | Sitio Web                  |
| ----------- | ----------------------------------------------------------------- | -------------------------- |
| NestJS      | Framework de Node.js con TypeScript para aplicaciones escalables. | https://nestjs.com         |
| Jest        | Framework de prueba de JavaScript de fácil uso.                   | https://jestjs.io          |
| Passport.js | Middleware de autenticación para Node.js.                         | http://www.passportjs.org  |
| OpenAPI     | Estándar de descripción de API para documentación.                | https://www.openapis.org   |
| TypeORM     | ORM para TypeScript y JavaScript para bases de datos.             | https://typeorm.io         |
| PinoJs      | Registro eficiente para aplicaciones Node.js.                     | https://getpino.io         |
| Casbin      | Biblioteca de control de acceso flexible.                         | https://casbin.org         |
| PostgreSQL  | Sistema de gestión de bases de datos relacional.                  | https://www.postgresql.org |
| Docker      | Plataforma de contenedorización para empaquetar aplicaciones.     | https://www.docker.com     |

## Funcionalidades

- Autenticación JWT
- Autenticación con Ciudadanía Digital
- Refresh Token
- Autorización (Roles, Módulos, Usuarios, Permisos)
- Paramétricas
- Clientes para Interoperabilidad (SEGIP, SIN)
- Cliente para Mensajería Electrónica
- Proveedores de:
  - Logger
  - Reportes
  - Manejo de errores

## Documentación

Documentación relacionada con el proyecto:

1. [Instalación y Configuración](INSTALL.md)
2. [Arquitectura](/docs/arquitectura.md)
3. [Documentación de APIS](/docs/openapi.yaml)
4. [Documentación de Permisos](/docs/permisos.md)

## Comandos útiles

1. Crea la base de datos desde cero (con docker)

   ```bash
   $ npm run db:create
   ```

2. Generación del diagrama ERD (deshabilitado hasta tener soporte para TypeOrm 0.3)

   [//]: # 'TODO: Actualizar soporte TypeOrm 0.3 para generar diagramas'

   ```bash
   $ npm run db:diagram
   ```

3. Generación de documentación

   ```bash
   $ npm run compodoc
   ```

## Changelog

1. Generar tag y archivo CHANGELOG. `patch (0.0.x) | minor (0.x.0) | major (x.0.0)`

   ```bash
   $ npm run release -- --release-as patch
   ```

2. Guardar los tags generados

   ```bash
   $ git push --follow-tags origin master
   ```

## Colaboradores

- almamani@agetic.gob.bo
- jpoma@agetic.gob.bo
- rquispe@agetic.gob.bo
- wilmer.quispe@agetic.gob.bo
- ivillarreal@agetic.gob.bo

## Licencia

[LGP-Bolivia](LICENSE).

## Información de contacto

- contacto@agetic.gob.bo
