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
