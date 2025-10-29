# GET /citas

Este endpoint entrega la agenda de citas clínicas asociadas al usuario autenticado. Las citas se devuelven junto con los datos del paciente y del profesional involucrados, incluyendo sus fotografías (`urlFoto`), para facilitar la representación en el frontend.

## Autorización

- **Pacientes** reciben únicamente sus citas activas dentro del rango solicitado.
- **Nutricionistas/Administradores** reciben las citas de los pacientes asignados a ellos dentro del rango solicitado.
- Otros roles no están autorizados.

El endpoint está protegido con `JwtAuthGuard` y `CasbinGuard`, por lo que es obligatorio enviar el JWT válido.

## Parámetros de consulta

| Parámetro      | Tipo   | Formato                  | Obligatorio | Descripción |
| -------------- | ------ | ------------------------ | ----------- | ----------- |
| `fechaInicio`  | string | ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) | No | Fecha inicial del rango de búsqueda.
| `fechaFin`     | string | ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) | No | Fecha final del rango de búsqueda.

- Si **no** se envían `fechaInicio` ni `fechaFin`, el servicio retorna las citas del mes calendario actual (desde el primer día a las 00:00:00 hasta el último día a las 23:59:59).
- Si solo se envía uno de los parámetros, se utiliza el día indicado tanto como inicio como fin del rango.
- Si `fechaInicio` es posterior a `fechaFin` el endpoint responde con un error `400`.

## Respuesta

El controlador utiliza el formato de respuesta estándar de la plataforma (`SuccessResponseDto`). Para este endpoint, la forma simplificada del cuerpo es la siguiente:

```json
{
  "finalizado": true,
  "mensaje": "Consulta exitosa",
  "datos": {
    "filas": [
      {
        "id": "15",
        "detalle": "Control mensual",
        "fechaInicio": "2024-07-18T15:00:00.000Z",
        "fechaFin": "2024-07-18T15:30:00.000Z",
        "estado": "PROGRAMADA",
        "paciente": {
          "id": "23",
          "nombres": "María",
          "primerApellido": "Pérez",
          "segundoApellido": "Gómez",
          "nroDocumento": "87654321",
          "tipoDocumento": "DNI",
          "genero": "F",
          "correoElectronico": "maria.perez@example.com",
          "urlFoto": "https://.../maria.jpg",
          "fechaNacimiento": "1992-05-10",
          "telefono": "+51987654321",
          "estado": "ACTIVO"
        },
        "medico": {
          "id": "5",
          "nombres": "Laura",
          "primerApellido": "Gutiérrez",
          "segundoApellido": "López",
          "nroDocumento": "12345678",
          "tipoDocumento": "DNI",
          "genero": "F",
          "correoElectronico": "laura.gutierrez@example.com",
          "urlFoto": "https://.../laura.jpg",
          "fechaNacimiento": "1985-02-17",
          "telefono": "+51912345678",
          "estado": "ACTIVO"
        }
      }
    ],
    "total": 1
  }
}
```

## Ejemplos de uso

- Listar las citas del mes actual:
  ```http
  GET /citas
  Authorization: Bearer <token>
  ```

- Listar las citas entre el 1 y el 15 de agosto de 2024:
  ```http
  GET /citas?fechaInicio=2024-08-01T00:00:00.000Z&fechaFin=2024-08-15T23:59:59.000Z
  Authorization: Bearer <token>
  ```

- Listar las citas del 20 de septiembre de 2024 (enviando solo un límite):
  ```http
  GET /citas?fechaInicio=2024-09-20T00:00:00.000Z
  Authorization: Bearer <token>
  ```

## Consideraciones para el frontend

- **Zonas horarias**: las fechas se devuelven en formato ISO 8601 UTC. Ajusta la presentación según la zona horaria del usuario.
- **Imágenes**: la propiedad `urlFoto` puede venir nula si el usuario no subió una imagen. Maneja un placeholder en ese caso.
- **Estados de la cita**: usa la propiedad `estado` para diferenciar entre citas programadas, completadas, canceladas, etc.
- **Paginación**: este endpoint retorna todas las citas del rango solicitado. Para historiales extensos utiliza `/pacientes/:id/citas` con parámetros de paginación.
