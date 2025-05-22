import { Status } from '@/common/constants'

export enum AsignacionEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
  HISTORICO = 'HISTORICO',
}

export enum CitasEstado {
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
  NO_ASISTIO = 'NO_ASISTIO',
}

export enum EvaluacionNutricionalEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}
