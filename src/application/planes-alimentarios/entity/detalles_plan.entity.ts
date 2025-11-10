import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { DetallePlanEstado } from '../constant'
import { PlanAlimentario } from './plan_alimentario.entity'

dotenv.config()

@Check(UtilService.buildStatusCheck(DetallePlanEstado))
@Entity({
  name: 'detalles_planes',
  schema: process.env.DB_SCHEMA_PLAN_NUTRICIONAL,
})
export class DetallePlan extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla detalles planes',
  })
  id: string

  @Column({
    name: 'dia_semana',
    type: 'varchar',
    comment: 'Día de la semana (ej. lunes, martes, etc.)',
  })
  diaSemana: string

  @Column({
    type: 'varchar',
    comment: 'Momento del día (desayuno, almuerzo, cena, colación)',
  })
  momento: string

  @Column({
    type: 'text',
    comment:
      'Lista o descripción de alimentos incluidos en este momento del día',
  })
  alimentos: string

  @Column({
    type: 'int',
    comment: 'Calorías estimadas para este grupo de alimentos',
  })
  calorias: number

  @Column({
    type: 'bigint',
    name: 'plan_id',
    comment: 'Clave foránea que referencia al plan alimentario',
  })
  idPlan: string

  @ManyToOne(() => PlanAlimentario, (plan) => plan.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plan_id' })
  plan: PlanAlimentario

  constructor(data?: Partial<DetallePlan>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || DetallePlanEstado.ACTIVO
  }
}
