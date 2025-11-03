import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import dotenv from 'dotenv'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AlimentoPlanNutricionalEstado } from '../constant'
import { Alimento, TipoAlimento } from './alimento.entity'
import { PlanNutricional } from './plan-nutricional.entity'
import { PlanNutricionalSeguimientoItem } from './plan-nutricional-seguimiento.entity'

dotenv.config()

@Check(UtilService.buildStatusCheck(AlimentoPlanNutricionalEstado))
@Entity({
  name: 'alimento_plan_nutricional',
  schema: process.env.DB_SCHEMA_PLAN_NUTRICIONAL,
})
export class AlimentoPlanNutricional extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla',
  })
  id: string

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number

  @Column({
    type: 'enum',
    enum: TipoAlimento,
    nullable: false,
    comment: 'Tipo de alimento',
  })
  tipo: TipoAlimento

  @Column({
    name: 'id_alimento',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al alimento',
  })
  idAlimento: string

  @ManyToOne(() => Alimento, (alimento) => alimento.alimentosPlanNutricional)
  @JoinColumn({ name: 'id_alimento', referencedColumnName: 'id' })
  alimento: Alimento

  @Column({
    name: 'id_plan_nutricional',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al plan nutricional',
  })
  idPlanNutricional: string

  @ManyToOne(
    () => PlanNutricional,
    (planNutricional) => planNutricional.alimentosPlanNutricional
  )
  @JoinColumn({ name: 'id_plan_nutricional', referencedColumnName: 'id' })
  planNutricional: PlanNutricional

  @OneToMany(
    () => PlanNutricionalSeguimientoItem,
    (seguimientoItem) => seguimientoItem.alimentoPlan
  )
  seguimientoItems: PlanNutricionalSeguimientoItem[]

  constructor(data?: Partial<AlimentoPlanNutricional>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || AlimentoPlanNutricionalEstado.ACTIVO
  }
}
