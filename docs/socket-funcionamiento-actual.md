# Funcionamiento actual de sockets (backend)

Este documento resume el comportamiento **actual** de los sockets del backend para alinear integración con frontend web y app móvil.

## Stack y configuración base

- Librería: **Socket.IO** sobre NestJS (`@nestjs/websockets`).
- CORS del gateway: `cors: true`.
- Patrón de respuesta: además del `return` al cliente emisor, se usa `server.emit(...)` para broadcast en el namespace.

## Namespaces activos

## 1) `/citas`

Gateway: `CitasGateway`.

### Eventos de entrada (cliente -> servidor)

- `citas:create`
  - DTO: `MensajeCitaDto` (extiende `CrearCitaDto`).
  - Acción: crea cita con `citasService.crearCita(payload)`.
  - Broadcast: `citas:created` con `CitaResponseDto`.

- `citas:actualizar`
  - DTO: `MensajeActualizarCitaDto` (requiere `id`).
  - Acción: `citasService.actualizarCita(payload.id, payload)`.
  - Broadcast: `citas:actualizada`.

- `citas:estado`
  - DTO: `MensajeEstadoCitaDto` (requiere `id`).
  - Acción: `citasService.actualizarEstadoCita(payload.id, payload)`.
  - Broadcast: `citas:estado-actualizado`.

- `citas:reprogramar`
  - DTO: `MensajeReprogramarCitaDto` (requiere `id`).
  - Acción: `citasService.reprogramarCita(payload.id, payload)`.
  - Broadcast: `citas:reprogramada`.

- `citas:cancelar`
  - DTO: `MensajeCancelarCitaDto` (requiere `id`).
  - Acción: `citasService.cancelarCita(payload.id, payload)`.
  - Broadcast: `citas:cancelada`.

### Eventos de salida (servidor -> clientes)

- `citas:created`
- `citas:actualizada`
- `citas:estado-actualizado`
- `citas:reprogramada`
- `citas:cancelada`

Todos emiten `CitaResponseDto` con la cita actualizada para que cliente haga **upsert por `id`**.

### Notas de integración

- Namespace fijo: `/citas`.
- Los nombres de evento están centralizados en constantes para reducir errores de typo:
  - `CitasSocketInboundEvent`
  - `CitasSocketOutboundEvent`
  - `CITAS_SOCKET_NAMESPACE`
- El gateway registra logs de conexión/desconexión y de recepción por evento.

## 2) `/system`

Gateway: `SystemConnectionGateway` (módulo de ejemplo/healthcheck de socket).

### Evento de entrada

- `system:ping`
  - DTO de entrada: `SystemPingDto`.
  - Respuesta directa al cliente emisor: `system:pong` con `SystemPongDto`.

### Uso recomendado

- Útil para validar conectividad de Socket.IO desde frontend/mobile.
- No forma parte del flujo de negocio de citas.

## Flujo resumido para frontend/mobile

1. Conectar al namespace `/citas`.
2. Cargar estado inicial vía REST (`GET /citas` o paginado).
3. Escuchar eventos de salida de citas y aplicar upsert en store local.
4. Ejecutar acciones por socket solo si se requiere tiempo real bidireccional; si se usa REST, los clientes conectados igual se sincronizan por eventos emitidos desde backend.

## Checklist de compatibilidad para actualización frontend/app móvil

- [ ] Confirmar URL base y namespace `/citas` en web y móvil.
- [ ] Confirmar catálogo de eventos de entrada/salida exactos.
- [ ] Verificar mapeo de estados de cita consumidos por UI.
- [ ] Aplicar estrategia de reconexión y resuscripción de listeners.
- [ ] Implementar deduplicación por `id` al recibir `CitaResponseDto`.
