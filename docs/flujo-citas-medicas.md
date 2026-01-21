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

## Visibilidad sugerida por rol (solo personal interno)
El sistema está dirigido únicamente a personal interno (sin acceso de pacientes). Se propone la siguiente visibilidad:

| Estado | Personal médico | Supervisor | Administrador |
| --- | --- | --- | --- |
| INACTIVO | ❌ | ⚠️ (solo auditoría) | ⚠️ (solo auditoría) |
| BORRADOR | ✅ | ⚠️ (solo en casos necesarios) | ❌ |
| SOLICITADA | ✅ | ⚠️ (solo en casos necesarios) | ❌ |
| CONFIRMADA | ✅ | ⚠️ (solo en casos necesarios) | ❌ |
| EN_CURSO | ✅ | ⚠️ (solo en casos necesarios) | ❌ |
| COMPLETADA | ✅ | ⚠️ (solo en casos necesarios) | ❌ |
| NO_ASISTIO | ✅ | ⚠️ (solo en casos necesarios) | ❌ |
| CANCELADA | ✅ | ⚠️ (solo en casos necesarios) | ❌ |
| RECHAZADA | ✅ | ⚠️ (solo en casos necesarios) | ❌ |

> Nota: El personal médico es el rol operativo principal para crear, editar y cancelar citas. El supervisor solo interviene excepcionalmente. El administrador se limita a configuraciones base y auditoría.

## Flujo propuesto (alto nivel)
1. **Creación (BORRADOR)**
   - El personal médico crea la cita como borrador.
   - Se valida especialidad, consultorio y disponibilidad.
2. **Solicitud (SOLICITADA)**
   - El personal médico registra la solicitud cuando la cita debe ser validada.
   - La cita entra en cola de revisión.
3. **Confirmación (CONFIRMADA)**
   - El personal valida disponibilidad de consultorio, profesional y tipo de cita.
   - Se bloquea el horario.
4. **Atención (EN_CURSO)**
   - Al iniciar la consulta/estudio, se marca en curso.
5. **Cierre (COMPLETADA / NO_ASISTIO)**
   - Completa si se realizó la atención.
   - No asistió si el paciente no se presentó.
6. **Cancelación / Rechazo (CANCELADA / RECHAZADA)**
   - Cancelación por personal médico/supervisor.
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
- La visibilidad se filtra por rol interno (médico, supervisor, administrador).

## Automatización diaria (citas vencidas)
Existe un proceso programado que se ejecuta diariamente para revisar citas con fecha anterior al día actual. Si la cita **no cambió de estado** y pertenece a estados operativos (BORRADOR, SOLICITADA, CONFIRMADA o EN_CURSO), se marca automáticamente como **NO_ASISTIO**, se genera historial y se crea una notificación asociada.

- **Cron**: `CITAS_REVISION_DIARIA_CRON` (por defecto `0 1 * * *`, 01:00 AM).
- **Criterio de vencimiento**: `fecha_inicio < inicio_del_día_actual` (no afecta citas del mismo día).
- **Notificación**: tipo `CITA_NO_ASISTIO` con mensaje de actualización automática.

## Beneficios
- Auditoría completa de cambios en la cita.
- Mayor transparencia para el personal médico.
- Facilidad para reportes y seguimiento de incidencias.
