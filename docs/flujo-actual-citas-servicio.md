# Flujo actual y flujo esperado de estados de citas (modelo con `idServicio`)

Este documento describe:

1. El **comportamiento real del backend** (cómo funciona hoy en código).
2. La **brecha actual en la aplicación cliente** (cuando no se cambia estado).
3. El **flujo esperado para frontend/app** para operar correctamente el ciclo de vida de una cita.

> Objetivo de integración: dejar explícito qué debe ejecutar la app después de crear una cita para evitar que todas queden en estado inicial sin transición operativa.

---

## 1) Conceptos principales

- Una cita se crea con:
  - `tipoCita` (`CONSULTA` o `ESTUDIO`)
  - `idServicio` (obligatorio)
  - `idEspecialidad` (opcional)
- El servicio (`servicio`) define:
  - nombre
  - tipo (`CONSULTA` / `ESTUDIO`)
  - duración
  - costo
  - **0..n especialidades** mediante `servicio_especialidad`

### Reglas clave

1. El `idServicio` es obligatorio en creación y reprogramación.
2. El `servicio.tipo` debe coincidir con `tipoCita`.
3. Si la cita trae `idEspecialidad`, esa especialidad debe estar asociada al servicio (relación muchos-a-muchos).
4. La `fechaFin` siempre se calcula usando `duracionMinutos` del servicio.

---

## 2) Flujo de creación de cita (REST `POST /citas`)

### Entrada esperada

- `detalle` (opcional)
- `fechaInicio` (obligatorio)
- `idMedico` (opcional)
- `idPaciente` (opcional)
- `idConsultorio` (opcional)
- `idEspecialidad` (opcional)
- `tipoCita` (obligatorio)
- `idServicio` (obligatorio)

### Proceso interno

1. Se valida que exista `tipoCita`.
2. Se valida que exista `idServicio`.
3. Se resuelve el servicio por id.
4. Se valida compatibilidad tipo/servicio.
5. Se valida compatibilidad con especialidad (solo si se envía `idEspecialidad`).
6. Se calcula `fechaFin = fechaInicio + duracionServicio`.
7. Se define estado inicial:
   - con `idMedico` -> `SOLICITADA`
   - sin `idMedico` -> `PROGRAMADA`
8. Se guarda cita.
9. Se registra historial de creación.
10. Si quedó `SOLICITADA` y hay médico, se genera notificación.
11. Se retorna la cita completa con relaciones.

### Resultado clave al crear

- **Si se envía `idMedico`**: la cita nace en **`SOLICITADA`**.
  - Esto significa que la app debe mostrarla como pendiente de confirmación/gestión.
- **Si NO se envía `idMedico`**: la cita nace en **`PROGRAMADA`**.
  - Esto significa que la app puede tratarla como cita ya programada.

Este comportamiento ya está implementado en backend y es automático durante la creación.

---

## 3) Flujo de actualización de cita (REST `PATCH /citas/:id`)

La actualización soporta cambios parciales de:

- datos generales (`detalle`, paciente, consultorio, especialidad, etc.)
- programación (`fechaInicio`, `tipoCita`, `idServicio`)

### Reglas de recalculo

Se recalcula `fechaFin` si cambia alguno de estos campos:

- `fechaInicio`
- `tipoCita`
- `idServicio`
- `idEspecialidad`

Cuando hay recalculo:

1. Se toma `tipoCita` nuevo o actual.
2. Se toma `idServicio` nuevo o actual.
3. Se valida servicio + tipo + especialidad.
4. Se recalcula `fechaFin` por duración del servicio.
5. Se actualizan `fechaInicio`, `fechaFin`, `idServicio`, `tipoCita`.

### Estado al reasignar médico

Si se actualiza `idMedico`, el estado pasa a `SOLICITADA`.

### Auditoría

- Se calculan diferencias (before/after).
- Se guarda historial de actualización con los campos cambiados.

---

## 4) Flujo de actualización de estado (REST `PATCH /citas/:id/estado`)

- Cambia únicamente el estado.
- Si el estado no cambia, la operación se considera exitosa sin modificación efectiva.
- Registra historial con cambio de estado (`before` / `after`).

### Importante para la app

El backend **sí** permite cambiar estados, pero el cambio ocurre **solo** cuando la app llama este endpoint (o su equivalente por sockets).

Si la app no ejecuta `PATCH /citas/:id/estado`, la cita permanece en su estado actual y no avanza en el flujo operativo.

---

## 5) Flujo de reprogramación (REST `PATCH /citas/:id/reprogramar`)

### Entrada esperada

- `fechaInicio` (obligatorio)
- `tipoCita` (obligatorio)
- `idServicio` (obligatorio en DTO)

### Proceso

1. Se valida `tipoCita`.
2. Se obtiene la cita actual.
3. Se usa `idServicio` recibido (o actual si internamente fuese necesario).
4. Se valida servicio contra tipo y especialidad de la cita.
5. Se recalcula `fechaFin` con duración del servicio.
6. En repositorio:
   - se actualiza fecha inicio/fin
   - si estaba en `RECHAZADA`, pasa a `SOLICITADA`
   - se registra historial de reprogramación

También se registran cambios de `tipoCita` e `idServicio` en el historial de reprogramación.

---

## 6) Flujo de cancelación (REST `PATCH /citas/:id/cancelar`)

- Cambia estado a `CANCELADA`.
- Permite `comentario` opcional.
- Si ya estaba cancelada, responde éxito sin cambios adicionales.
- Registra historial de cambio de estado.

---

## 7) Flujo automático diario: citas vencidas

Existe una tarea programada (cron) que:

1. toma el inicio del día como corte,
2. busca citas anteriores al corte en estados elegibles,
3. las marca como `NO_ASISTIO`,
4. crea historial por cada cita,
5. genera notificación al médico.

Este proceso NO reemplaza el flujo operativo de la app. Solo corrige citas pasadas que no tuvieron cierre.

---

## 8) Consulta de historial (`GET /citas/:id/historial`)

El historial se devuelve paginado y enriquecido:

- ejecutor (usuario rol)
- médicos involucrados
- pacientes involucrados
- servicios involucrados (`idServicio`)

Cuando en `detalleCambios` aparece un `idServicio`, se adjunta `beforeDetalle` / `afterDetalle` con información del servicio para facilitar visualización.

---

## 9) Formato de respuesta de cita

La respuesta de cita incluye:

- ids: `medicoId`, `pacienteId`, `consultorioId`, `especialidadId`, `servicioId`
- `tipoCita`, `estado`, fechas
- objetos relacionados:
  - `medico`
  - `paciente`
  - `especialidad`
  - `servicio`
  - `consultorio`

`servicio` expone: `id`, `nombre`, `descripcion`, `tipo`, `duracionMinutos`, `costo`, `estado`.

---

## 10) Sockets (gateway)

Eventos de entrada soportados:

- `citas:create`
- `citas:actualizar`
- `citas:estado`
- `citas:reprogramar`
- `citas:cancelar`

Eventos de salida emitidos:

- `citas:created`
- `citas:actualizada`
- `citas:estado-actualizado`
- `citas:reprogramada`
- `citas:cancelada`

En todos los flujos de creación/actualización/reprogramación, el identificador funcional de servicio es `idServicio`.

---

## 11) Diagnóstico de la brecha actual (app)

Situación reportada: **en la aplicación no se está cambiando el estado de la cita**.

Consecuencia funcional:

- Citas creadas con médico quedan en `SOLICITADA` indefinidamente.
- Citas creadas sin médico quedan en `PROGRAMADA` indefinidamente.
- No se refleja inicio de atención (`EN_CURSO`), cierre (`COMPLETADA`) o inasistencia/cancelación en tiempo real.
- El historial operativo se vuelve incompleto porque no se disparan transiciones de estado esperadas por negocio.

---

## 12) Flujo esperado para la aplicación (propuesta operativa)

La app debe tratar la creación como el inicio del flujo, no como el fin.

### 12.1 Máquina de estados recomendada

Transiciones principales esperadas:

1. `SOLICITADA -> PROGRAMADA` (cuando se acepta/valida la cita).
2. `PROGRAMADA -> EN_CURSO` (cuando inicia la atención).
3. `EN_CURSO -> COMPLETADA` (cuando finaliza la atención).
4. `PROGRAMADA -> NO_ASISTIO` (si paciente no llega; manual o por proceso automático).
5. `SOLICITADA|PROGRAMADA|EN_CURSO -> CANCELADA` (si se anula la cita).
6. `SOLICITADA -> RECHAZADA` (si se rechaza la solicitud).
7. `RECHAZADA -> SOLICITADA` (si se reprograma; ya contemplado en backend).

> Nota: `INACTIVO` es un estado administrativo/técnico, no del ciclo operativo normal diario.

### 12.2 Qué debe hacer la app en cada momento

- **Al crear cita (`POST /citas`)**
  - Leer el estado retornado (`SOLICITADA` o `PROGRAMADA`).
  - Renderizar acciones disponibles según estado.

- **Al confirmar cita**
  - Invocar `PATCH /citas/:id/estado` con `{ "estado": "PROGRAMADA" }`.

- **Al iniciar atención**
  - Invocar `PATCH /citas/:id/estado` con `{ "estado": "EN_CURSO" }`.

- **Al finalizar atención**
  - Invocar `PATCH /citas/:id/estado` con `{ "estado": "COMPLETADA" }`.

- **Al cancelar**
  - Preferir `PATCH /citas/:id/cancelar` (permite comentario y deja historial de cancelación).

- **Al marcar no asistencia manual**
  - Invocar `PATCH /citas/:id/estado` con `{ "estado": "NO_ASISTIO" }`.

- **Al reprogramar**
  - Invocar `PATCH /citas/:id/reprogramar`.
  - Si estaba `RECHAZADA`, backend la devuelve a `SOLICITADA`.

### 12.3 Reglas de UI mínimas para evitar el problema actual

1. No asumir que la creación deja la cita en estado final.
2. Mostrar botón/acción de transición por estado actual.
3. Refrescar estado local con la respuesta del backend después de cada transición.
4. Suscribirse a eventos socket para mantener sincronizadas varias sesiones.
5. Bloquear transiciones inválidas desde UI para reducir errores de operación.

---

## 13) Resumen ejecutivo para traspaso a app

- El backend ya implementa creación, cambio de estado, cancelación, reprogramación, historial y vencimiento automático.
- El problema actual está en la orquestación del cliente: **la app no está invocando las transiciones de estado necesarias**.
- Para corregirlo, la app debe consumir de forma explícita `PATCH /citas/:id/estado` (y `/:id/cancelar`, `/:id/reprogramar`) según el momento operativo.
- Con esto, el flujo quedará alineado al proceso esperado y el historial reflejará la trazabilidad real de la atención.

---

## 14) Notas de integración

- No usar `idEstudio` en contratos actuales de citas.
- Si un frontend separa la UI por tipo, filtrar servicios por `tipo` (`CONSULTA` / `ESTUDIO`).
- Si se envía `idEspecialidad`, validar en UI que esa especialidad esté dentro de `servicio.especialidades[]`.
- Si la especialidad no aplica al flujo, se puede omitir `idEspecialidad` en la cita.
- Para consistencia de agenda, nunca calcular `fechaFin` en cliente; dejar que backend la derive por duración del servicio.
