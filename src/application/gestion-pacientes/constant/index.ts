import { Status } from '@/common/constants'

export enum AsignacionEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
  HISTORICO = 'HISTORICO',
}

export enum CitasEstado {
  INACTIVO = 'INACTIVO',
  BORRADOR = 'BORRADOR',
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  CANCELADA = 'CANCELADA',
  COMPLETADA = 'COMPLETADA',
  NO_ASISTIO = 'NO_ASISTIO',
}

export enum EvaluacionNutricionalEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}
