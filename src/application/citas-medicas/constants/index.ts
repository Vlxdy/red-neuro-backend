import { Status } from '@/common/constants'

export enum CitasEstado {
  INACTIVO = 'INACTIVO',
  BORRADOR = 'BORRADOR',
  SOLICITADA = 'SOLICITADA',
  CONFIRMADA = 'CONFIRMADA',
  EN_CURSO = 'EN_CURSO',
  COMPLETADA = 'COMPLETADA',
  NO_ASISTIO = 'NO_ASISTIO',
  CANCELADA = 'CANCELADA',
  RECHAZADA = 'RECHAZADA',
}

export enum CitasHistorialEstado {
  INACTIVO = Status.INACTIVE,
  ACTIVO = Status.ACTIVE,
}
