import { Status } from '@/common/constants'

export enum PlanAlimentarioEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}

export enum DetallePlanEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}

export enum PlanNutricionalEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}
export enum AlimentoEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}

export enum CarritoComprasEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}

export enum AlimentoPlanNutricionalEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}

export enum PlanNutricionalSeguimientoEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}

export enum PlanNutricionalSeguimientoItemEstado {
  ACTIVO = Status.ACTIVE,
  INACTIVO = Status.INACTIVE,
}

export enum CategoriaAlimento {
  PROTEINA_ANIMAL = 'PROTEÍNA ANIMAL',
  CEREAL = 'CEREAL',
  LACTEO = 'LÁCTEO',
  LEGUMBRE = 'LEGUMBRE',
  VERDURA = 'VERDURA',
  FRUTA = 'FRUTA',
  GRASA_SALUDABLE = 'GRASA SALUDABLE',
  FRUTA_SECA = 'FRUTA SECA',
  BEBIDA = 'BEBIDA',
  ENDULZANTE = 'ENDULZANTE',
  CONDIMENTO = 'CONDIMENTO',
}

export enum UnidadMedida {
  G = 'g',
  ML = 'ml',
  UNIDAD = 'unidad',
  TAZA = 'taza',
  REBANADA = 'rebanada',
  CUCHARADITA = 'cucharadita',
  HOJA = 'hoja',
  SOBRE = 'sobre',
  DIENTE = 'diente',
  PIZCA = 'pizca',
}
