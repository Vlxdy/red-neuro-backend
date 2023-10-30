# Logger upgrade

Instrucciones de instalación para versiones anteriores del Proyecto Base.

1. Copiar todo el contenido de la carpeta `src/core/logger` y reemplazarlo en el proyecto destino en la misma ubicación.

2. Copiar los siguientes archivos de este repositorio al proyecto destino en la misma ubicación:

   - `src/common/dto/error-response.dto.ts`
   - `src/common/filters/http-exception.filter.ts`
   - `src/core/authentication/oidc.client.ts`
   - `src/core/authorization/guards/casbin.guard.ts`
   - `src/core/authentication/guards/jwt-auth.guard.ts`
   - `src/core/authentication/guards/local-auth.guard.ts`
   - `src/core/authentication/guards/oidc-auth.guard.ts`

3. En caso de que la versión del proyecto destino no cuente con logs de auditoría también deberá actualizar o agregar los siguientes ficheros (agregar la línea `logger.audit` como se encuentra en este repositorio):

   - `src/common/middlewares/LoggerMiddleware.ts`
   - `src/core/authentication/controller/authentication.controller.ts`
   - `src/app.module.ts`

4. Agregar los siguientes paquetes al archivo `package.json` y ejecutar `npm run install`

   - `"file-stream-rotator": "1.0.0",`
   - `"zlib": "1.0.5",`

5. Finalmente actualizar el archivo `.env.sample` la sección de logs.

En caso de faltar algunas referencias o ficheros copiarlas desde este repositorio.
