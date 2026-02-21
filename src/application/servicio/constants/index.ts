import { Status } from '@/common/constants'

export enum ServicioEstado {
  INACTIVO = Status.INACTIVE,
  ACTIVO = Status.ACTIVE,
}

// Alias temporal para compatibilidad con semillas/migraciones existentes.
export const EstudioEstado = ServicioEstado
