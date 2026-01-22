# Historial de citas (GET /citas/:id/historial)

Este documento describe el formato de respuesta del endpoint que devuelve el historial de una cita médica.

## Endpoint

`GET /citas/:id/historial`

### Parámetros de ruta

- `id` (string): identificador de la cita.

### Query params

Los filtros incluyen paginación y parámetros específicos del historial.

- `limite` (number, opcional): cantidad de registros por página (min 10, max 50, default 10).
- `pagina` (number, opcional): número de página (default 1).
- `fechaInicio` (ISO string, opcional): fecha mínima de creación del registro de historial.
- `fechaFin` (ISO string, opcional): fecha máxima de creación del registro de historial.
- `idEjecutor` (string, opcional): usuario-rol que ejecutó la acción.

## Estructura de respuesta

El endpoint responde con la estructura base `BaseResponseListRowsDto`, que contiene `finalizado`, `mensaje` y `datos` con el total y las filas.

```json
{
  "finalizado": true,
  "mensaje": "¡Tarea completada con éxito!",
  "datos": {
    "total": 2,
    "filas": [
      {
        "id": "1",
        "citaId": "10",
        "idEjecutor": "42",
        "comentario": "Actualización de médico",
        "detalleCambios": [
          {
            "field": "idMedico",
            "before": "21",
            "after": "34",
            "beforeDetalle": {
              "id": "21",
              "persona": {
                "nombre": "Andrea",
                "primerApellido": "Soto"
              }
            },
            "afterDetalle": {
              "id": "34",
              "persona": {
                "nombre": "Luis",
                "primerApellido": "García"
              }
            }
          }
        ],
        "ejecutor": {
          "id": "42",
          "persona": {
            "nombre": "María",
            "primerApellido": "Pérez"
          }
        },
        "fechaCreacion": "2024-06-10T15:30:00.000Z"
      }
    ]
  }
}
```

### Campos por registro de historial

- `id`: identificador del registro de historial.
- `citaId`: identificador de la cita asociada.
- `idEjecutor`: usuario-rol que ejecutó la acción.
- `comentario`: comentario asociado a la transición (si existe).
- `detalleCambios`: arreglo con los cambios realizados. Incluye `field`, `before`, `after` y detalles enriquecidos cuando aplica.
- `ejecutor`: datos del usuario ejecutor (cuando están disponibles).
- `fechaCreacion`: fecha de creación en formato ISO 8601.

### Enriquecimiento de `detalleCambios`

Cada elemento del arreglo `detalleCambios` incluye `beforeDetalle` y `afterDetalle` cuando el campo modificado es uno de los siguientes:

- `idMedico`: se adjuntan los datos del médico antes y después del cambio.
- `idPaciente`: se adjuntan los datos del paciente antes y después del cambio.
- `idEstudio`: se adjuntan los datos del estudio antes y después del cambio, incluyendo el nombre del estudio.

Esto permite que cuando se modifica el `idEstudio`, la respuesta incluya el `nombre` del estudio en `beforeDetalle` y/o `afterDetalle`.
