# Logger

Librería para registrar eventos o capturar errores del sistema.

## Códigos de error

Internos (causados por la aplicación)

| Código  | Descripción                              | Causa                                                                           |
| ------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| `E-50`  | `Error desconocido`                      | error = `'BOOM'`, `{ name: 'Error' }`, `new Error()`, `undefined`, `null`, `''` |
| `E-40`  | `Error HTTP`                             | error = `new HttpException()`                                                   |
| `E-SQL` | `Error de consulta con la Base de Datos` | error = `{ name: "QueryFailedError" }`                                          |
| `E-DTO` | `Error de validación con el DTO`         | error = `new BadRequestException() - DTO`                                       |

Externos (causados por agentes externos)

| Código            | Descripción                                        | Causa                                                      |
| ----------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| `ES-REQUEST`      | `Error de consulta con Servicio Externo`           | error = `axios().catch(err => ...)`                        |
| `ES-ECONNREFUSED` | `Error de conexión con Servicio Externo`           | error = `{ code: 'ECONNREFUSED' }`                         |
| `ES-TIMEOUT`      | `Error de TIMEOUT con Servicio Externo`            | response = `{ data: "The upstream server is timing out" }` |
| `ES-CERT`         | `Error de certificado con Servicio Externo`        | error = `{ code: 'CERT_HAS_EXPIRED' }`                     |
| `ES-MESSAGE`      | `Error desconocido con Servicio Externo (message)` | body = `{ message: "detalle del error" }`                  |
| `ES-DATA`         | `Error desconocido con Servicio Externo (data)`    | body = `{ data: "detalle del error" }`                     |

## Modo de uso

**Ejemplo 1** Para guardar cualquier tipo de error.

```ts
import { LoggerService } from '../src/core/logger'

const logger = LoggerService.getInstance()

function tarea(datos) {
  try {
    // código inseguro
  } catch (error) {
    logger.error(error)
  }
}
```

Ejemplos de implementación:

```ts
logger.error(error, ...params)
logger.warn(...params)
logger.info(...params)
logger.debug(...params)
logger.trace(...params)
```

**Ejemplo 2** Para convertir un error desconocido en un error de tipo `HTTP ERROR`.

```ts
import { BaseException } from '../src/core/logger'

function tarea(datos) {
  try {
    // código inseguro
  } catch (error) {
    throw new BaseException(error, {
      codigo,
      mensaje,
      accion,
      metadata,
      modulo,
    })
  }
}
```

Ejemplos de implementación:

```ts
throw new BaseException(error)
throw new BaseException(error, {
  codigo,
  mensaje,
  metadata,
  modulo,
  httpStatus,
  causa,
  accion,
  clientInfo, // Para enviar información adicional al cliente
})
```

## Casos de uso

## 1. Para capturar errores en tiempo de ejecución

Los errores en tiempo de ejecución son problemas que se producen durante la ejecución de un programa y pueden interrumpir su funcionamiento normal.

Estos errores son capturados como excepciones y requieren un proceso de depuración para identificar y corregir la causa subyacente.

## 2.1 Errores Controlados

Nest proporciona un conjunto de [excepciones estándar](https://docs.nestjs.com/exception-filters#built-in-http-exceptions) que se heredan de la base `HttpException`. Estos se exponen desde el paquete `@nestjs/common`, las excepciones HTTP más comunes:

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `ConflictException`
- `PreconditionFailedException`
- `...`

**Ejemplo 1:** Para lanzar una excepción propia de NestJS (de tipo `HttpException`)

```ts
import { UnauthorizedException } from '@nestjs/common'

function validar(headers) {
  if (!headers.authorization) {
    throw new UnauthorizedException()
  }
}
```

Ejemplos de implementación:

```ts
throw new UnauthorizedException()
throw new UnauthorizedException(mensaje)
throw new UnauthorizedException(mensaje, { cause })
```

## 2.2 Errores No Controlados

Algunos errores que pueden presentarse de manera imprevista son los siguientes:

**Ejemplo 1:** Cuando una consulta SQL no se encuentra bien formulada:

```ts
async function recuperar() {
  return await this.dataSource
    .getRepository(Usuario)
    .createQueryBuilder('usuario')
    .leftJoinAndSelect('usuario.relacioninexistente', 'relacioninexistente')
    .getMany()
}
```

**Nota.-** Estos tipos de errores siempre serán de tipo `500 Internal Server Exception`

## 3. Logs para servicios externos

Se trata de registrar excepciones causadas por un módulo en específico (en este caso una consulta a un Servicio Externo).

**Ejemplo 1:** Utilizando la clase `ExternalServiceException`.

```ts
function tarea(datos) {
  try {
    // código inseguro
  } catch (error) {
    throw new ExternalServiceException('SEGIP:CONTRASTACION', error)
  }
}
```

**Ejemplo 2:** Utilizando la clase `BaseException`.

```ts
function tarea(datos) {
  try {
    // código inseguro
  } catch (error) {
    throw new BaseException(error, {
      modulo: 'SEGIP:CONTRASTACION',
    })
  }
}
```

Ejemplos de implementación:

```ts
throw new ExternalServiceException(servicio, error)
throw new ExternalServiceException(servicio, error, mensaje)
throw new ExternalServiceException(servicio, error, mensaje, metadata)
```

## 4. Logs de auditoría

Estos registros se crean en ficheros independientes y son utilizados para registrar eventos del sistema.

**Ejemplo**

```ts
import { LoggerService } from '../src/core/logger'

const logger = LoggerService.getInstance()

function login(user) {
  this.logger.audit('authentication', {
    mensaje: 'Ingresó al sistema',
    metadata: { usuario: user.id, tipo: 'básico' },
  })
}
```

Ejemplos de implementación:

```ts
logger.audit('application', mensaje)
logger.audit('application', mensaje, metadata)
logger.audit('application', {
  mensaje,
  metadata,
  formato, // Para darle formato cuando se imprime en la consola
})
```

Además se incluyen tipos de auditoría para diferenciarlos cuando se imprimen por la consola, el formato no tiene ningún efecto en los ficheros de logs.

```ts
logger.auditError('application', mensaje)
logger.auditWarn('application', mensaje)
logger.auditSuccess('application', mensaje)
logger.auditInfo('application', mensaje)
```
