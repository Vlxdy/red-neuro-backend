# Propuesta de flujo para citas médicas

## Objetivo
Definir un flujo claro para el ciclo de vida de una cita médica, estableciendo estados, transiciones y visibilidad por rol, además de documentar la implementación del historial de cambios (auditoría) expuesto vía API.

## Estados propuestos y significado
Los estados están alineados con los valores ya definidos en el backend:

- **INACTIVO**: registro no operativo o depurado del flujo (no visible para la operación diaria).
- **BORRADOR**: cita creada por el paciente o admisión, aún editable y sin confirmación.
- **SOLICITADA**: cita enviada para revisión/confirmación por el personal.
- **CONFIRMADA**: cita validada y bloqueada; se reserva el slot para el paciente.
- **EN_CURSO**: la atención ya inició.
- **COMPLETADA**: consulta/estudio finalizado.
- **NO_ASISTIO**: el paciente no se presentó.
- **CANCELADA**: anulada por paciente o personal.
- **RECHAZADA**: solicitud descartada por el personal (por incompatibilidad, horarios, etc.).

## Visibilidad sugerida por rol
| Estado | Paciente | Personal médico | Adm./Recepción |
| --- | --- | --- | --- |
| INACTIVO | ❌ | ❌ | ⚠️ (solo auditoría) |
| BORRADOR | ✅ | ⚠️ (solo si comparte agenda) | ✅ |
| SOLICITADA | ✅ | ✅ | ✅ |
| CONFIRMADA | ✅ | ✅ | ✅ |
| EN_CURSO | ✅ | ✅ | ✅ |
| COMPLETADA | ✅ | ✅ | ✅ |
| NO_ASISTIO | ✅ | ✅ | ✅ |
| CANCELADA | ✅ | ✅ | ✅ |
| RECHAZADA | ✅ | ✅ | ✅ |

> Nota: La visibilidad puede ajustarse por políticas internas. En esta propuesta, el personal médico ve todo lo relevante a su agenda. El estado **INACTIVO** queda solo para auditoría.

## Flujo propuesto (alto nivel)
1. **Creación (BORRADOR)**
   - Paciente o recepción crea la cita como borrador.
   - Se valida especialidad y disponibilidad.
2. **Solicitud (SOLICITADA)**
   - El paciente confirma o el personal registra la solicitud.
   - La cita entra en cola de revisión.
3. **Confirmación (CONFIRMADA)**
   - El personal valida disponibilidad de consultorio, médico y tipo de cita.
   - Se bloquea el horario.
4. **Atención (EN_CURSO)**
   - Al iniciar la consulta/estudio, se marca en curso.
5. **Cierre (COMPLETADA / NO_ASISTIO)**
   - Completa si se realizó la atención.
   - No asistió si el paciente no se presentó.
6. **Cancelación / Rechazo (CANCELADA / RECHAZADA)**
   - Cancelación por paciente o personal.
   - Rechazo cuando la solicitud no es viable.

## Historial de la cita (auditoría)
### Qué se registra
Para cada transición de estado o evento relevante, se recomienda guardar:
- **Estado anterior**
- **Rol del ejecutor**
- **Usuario ejecutor**
- **Comentario** (opcional)
- **Fecha de creación**

### Cuándo se registra
- En la implementación actual ya se genera historial cuando se cancela una cita.
- Se registra de forma automática cuando una cita vencida se marca como **NO_ASISTIO** vía proceso diario.
- Recomendación: extender la misma lógica para cambios de estado (confirmar, reprogramar, completar, etc.) para contar con trazabilidad completa.

## Implementación API (historial)
Se expone un endpoint para consultar el historial asociado a una cita:

```
GET /citas/{id}/historial
```

### Respuesta
Devuelve una lista ordenada por fecha de creación (más reciente primero) con:
- `id`
- `citaId`
- `estadoAnterior`
- `rolEjecutor`
- `idEjecutor`
- `comentario`
- `fechaCreacion`

## Consideraciones de seguridad
- El historial se protege con autenticación JWT y autorización por roles.
- La visibilidad puede filtrarse por el rol del usuario autenticado (médico, recepción, administrador).

## Automatización diaria (citas vencidas)
Existe un proceso programado que se ejecuta diariamente para revisar citas con fecha anterior al día actual. Si la cita **no cambió de estado** y pertenece a estados operativos (BORRADOR, SOLICITADA, CONFIRMADA o EN_CURSO), se marca automáticamente como **NO_ASISTIO**, se genera historial y se crea una notificación asociada.

- **Cron**: `CITAS_REVISION_DIARIA_CRON` (por defecto `0 1 * * *`, 01:00 AM).
- **Criterio de vencimiento**: `fecha_inicio < inicio_del_día_actual` (no afecta citas del mismo día).
- **Notificación**: tipo `CITA_NO_ASISTIO` con mensaje de actualización automática.

## Beneficios
- Auditoría completa de cambios en la cita.
- Mayor transparencia para el personal médico.
- Facilidad para reportes y seguimiento de incidencias.
