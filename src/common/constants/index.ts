// swagger config
export const SWAGGER_API_ROOT = 'api/docs'
export const SWAGGER_API_NAME = 'Proyecto base'
export const SWAGGER_API_DESCRIPTION = 'Documentación de proyecto Backend Base'
export const SWAGGER_API_CURRENT_VERSION = '1.0'

export enum Status {
  CREATE = 'CREADO',
  ACTIVE = 'ACTIVO',
  INACTIVE = 'INACTIVO',
  PENDING = 'PENDIENTE',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum TipoDocumento {
  CI = 'CI',
  PASAPORTE = 'PASAPORTE',
  OTRO = 'OTRO',
}

export enum Genero {
  MASCULINO = 'M',
  FEMENINO = 'F',
  OTRO = 'OTRO',
}

export enum Transaccion {
  CREAR = 'CREAR',
  ACTUALIZAR = 'ACTUALIZAR',
}

export const USUARIO_SISTEMA = '1'
export const USUARIO_NORMAL = '0'
