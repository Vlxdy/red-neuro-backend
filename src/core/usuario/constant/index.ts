import { Genero, Status, TipoDocumento } from '@/common/constants'
export const PersonaEstado = {
  ACTIVE: Status.ACTIVE,
  INACTIVE: Status.INACTIVE,
}

export const TiposDocumento = {
  CI: TipoDocumento.CI,
  PASAPORTE: TipoDocumento.PASAPORTE,
  OTRO: TipoDocumento.OTRO,
}

export const TiposGenero = {
  MASCULINO: Genero.MASCULINO,
  FEMENINO: Genero.FEMENINO,
  OTRO: Genero.OTRO,
}

export const UsuarioEstado = {
  ACTIVE: Status.ACTIVE,
  INACTIVE: Status.INACTIVE,
  CREATE: Status.CREATE,
  PENDING: Status.PENDING,
}
