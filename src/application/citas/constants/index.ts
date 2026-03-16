import { Status } from '@/common/constants'

export enum CitasEstado {
  INACTIVO = 'INACTIVO',
  BORRADOR = 'BORRADOR',
  SOLICITADA = 'SOLICITADA',
  PROGRAMADA = 'PROGRAMADA',
  COMPLETADA = 'COMPLETADA',
  NO_ASISTIO = 'NO_ASISTIO',
  REPROGRAMADA = 'REPROGRAMADA',
  CANCELADA = 'CANCELADA',
  RECHAZADA = 'RECHAZADA',
}

export enum CitasHistorialEstado {
  INACTIVO = Status.INACTIVE,
  ACTIVO = Status.ACTIVE,
}

export enum EtiquetaEstado {
  INACTIVO = Status.INACTIVE,
  ACTIVO = Status.ACTIVE,
}

export enum TipoCita {
  CONSULTA = 'CONSULTA',
  ESTUDIO = 'ESTUDIO',
}

export const SOCKET_NAMESPACE = '/realtime'
export const CITAS_SOCKET_NAMESPACE = SOCKET_NAMESPACE

export enum CitasSocketInboundEvent {
  CREATE = 'citas:create',
  ACTUALIZAR = 'citas:actualizar',
  ESTADO = 'citas:estado',
  REPROGRAMAR = 'citas:reprogramar',
  CANCELAR = 'citas:cancelar',
}

export enum CitasSocketOutboundEvent {
  CREATED = 'citas:created',
  ACTUALIZADA = 'citas:actualizada',
  ESTADO_ACTUALIZADO = 'citas:estado-actualizado',
  REPROGRAMADA = 'citas:reprogramada',
  CANCELADA = 'citas:cancelada',
  HOME_ACTUALIZADA = 'citas:home-actualizada',
}

export enum NotificacionesSocketInboundEvent {
  SUBSCRIBE = 'notificaciones:subscribe',
}

export enum NotificacionesSocketOutboundEvent {
  NUEVA = 'notificaciones:nueva',
  VISTA = 'notificaciones:vista',
  TODAS_VISTAS = 'notificaciones:todas-vistas',
}
