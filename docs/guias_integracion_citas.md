# Guía de integración de citas médicas

Este documento resume cómo consumir endpoints y sockets de citas desde **Next.js + MUI** y **Flutter**.

## Endpoints REST

Base URL: `/api`

| Ruta                     | Método | Descripción                                                                                                                 |
| ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `/citas`                 | GET    | Listado con filtros.                                                                                                        |
| `/citas/paginado`        | GET    | Listado paginado.                                                                                                           |
| `/citas/mis-citas`       | GET    | Listado del personal autenticado.                                                                                           |
| `/citas/:id`             | GET    | Detalle de cita.                                                                                                            |
| `/citas`                 | POST   | Crea cita (`detalle`, `fechaInicio`, `idPersonal?`, `idPaciente?`, `idConsultorio?`, `idLugar?`, `tipoCita`, `idServicio`). |
| `/citas/:id`             | PATCH  | Actualiza datos generales.                                                                                                  |
| `/citas/:id/reprogramar` | PATCH  | Reprograma fecha y hora.                                                                                                    |
| `/citas/:id/cancelar`    | PATCH  | Cancela cita.                                                                                                               |

> Todas las rutas usan JWT + Casbin (`Authorization: Bearer <token>`).

### Respuesta de cita

`CitaResponseDto` incluye datos enriquecidos de `personal`, `paciente`, `servicio`, `consultorio` y `lugar`.

## WebSockets (Socket.IO)

Namespace: `/citas`

- `citas:create`
- `citas:actualizar`
- `citas:estado`
- `citas:reprogramar`
- `citas:cancelar`

> Los cambios por REST y Socket emiten eventos para mantener sincronizada la UI.

## UI tips

- **MUI**: `Table` + `Dialog` para reprogramación/cancelación.
- **Flutter**: `showModalBottomSheet` para acciones rápidas.
