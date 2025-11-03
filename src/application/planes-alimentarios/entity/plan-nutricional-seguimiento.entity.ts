import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import dotenv from 'dotenv'
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import {
  PlanNutricionalSeguimientoEstado,
  PlanNutricionalSeguimientoItemEstado,
} from '../constant'
import { PlanNutricional } from './plan-nutricional.entity'
import { AlimentoPlanNutricional } from './alimento-plan-nutricional.entity'

dotenv.config()

@Entity({
  name: 'plan_nutricional_seguimiento',
  schema: process.env.DB_SCHEMA_PLAN_NUTRICIONAL,
})
export class PlanNutricionalSeguimiento extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador del seguimiento del plan nutricional',
  })
  id: string

  @Column({
    name: 'id_plan_nutricional',
    type: 'bigint',
    nullable: false,
    comment: 'Plan nutricional asociado al seguimiento',
  })
  idPlanNutricional: string

  @OneToOne(() => PlanNutricional, (plan) => plan.seguimiento)
  @JoinColumn({ name: 'id_plan_nutricional', referencedColumnName: 'id' })
  plan: PlanNutricional

  @Column({
    name: 'id_usuario_rol_paciente',
    type: 'bigint',
    nullable: false,
    comment:
      'Identificador del usuario rol paciente que registra el seguimiento',
  })
  idUsuarioRolPaciente: string

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Comentarios del paciente sobre el día del plan',
  })
  comentario?: string | null

  @OneToMany(
    () => PlanNutricionalSeguimientoItem,
    (detalle) => detalle.seguimiento
  )
  items: PlanNutricionalSeguimientoItem[]

  constructor(data?: Partial<PlanNutricionalSeguimiento>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PlanNutricionalSeguimientoEstado.ACTIVO
  }
}

@Entity({
  name: 'plan_nutricional_seguimiento_item',
  schema: process.env.DB_SCHEMA_PLAN_NUTRICIONAL,
})
export class PlanNutricionalSeguimientoItem extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador del detalle del seguimiento',
  })
  id: string

  @Column({
    name: 'id_seguimiento',
    type: 'bigint',
    nullable: false,
    comment: 'Seguimiento al que pertenece el detalle',
  })
  idSeguimiento: string

  @ManyToOne(
    () => PlanNutricionalSeguimiento,
    (seguimiento) => seguimiento.items
  )
  @JoinColumn({ name: 'id_seguimiento', referencedColumnName: 'id' })
  seguimiento: PlanNutricionalSeguimiento

  @Column({
    name: 'id_alimento_plan_nutricional',
    type: 'bigint',
    nullable: false,
    comment: 'Referencia al alimento planificado',
  })
  idAlimentoPlanNutricional: string

  @ManyToOne(
    () => AlimentoPlanNutricional,
    (alimentoPlan) => alimentoPlan.seguimientoItems,
    { eager: false }
  )
  @JoinColumn({
    name: 'id_alimento_plan_nutricional',
    referencedColumnName: 'id',
  })
  alimentoPlan: AlimentoPlanNutricional

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Indica si el alimento fue cumplido por el paciente',
  })
  cumplido: boolean

  constructor(data?: Partial<PlanNutricionalSeguimientoItem>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PlanNutricionalSeguimientoItemEstado.ACTIVO
  }
}
