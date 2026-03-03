import { Status } from '@/common/constants'

export enum LugarEstado {
  INACTIVO = Status.INACTIVE,
  ACTIVO = Status.ACTIVE,
}

export enum TipoLugar {
  HOSPITAL = 'HOSPITAL',
  CLINICA = 'CLINICA',
  CENTRO_SALUD = 'CENTRO_SALUD',
  DOMICILIO = 'DOMICILIO',
  OTRO = 'OTRO',
}
