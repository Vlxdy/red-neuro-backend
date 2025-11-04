import { Status } from '@/common/constants'

export enum AsignacionEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
  HISTORICO = 'HISTORICO',
}

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

export enum EvaluacionNutricionalEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}
