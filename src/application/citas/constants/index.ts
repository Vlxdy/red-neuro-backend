import { Status } from '@/common/constants'

export enum CitasEstado {
  INACTIVO = 'INACTIVO',
  BORRADOR = 'BORRADOR',
  SOLICITADA = 'SOLICITADA',
  CONFIRMADA = 'CONFIRMADA',
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

export const CITAS_SOCKET_NAMESPACE = '/citas'

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
}
