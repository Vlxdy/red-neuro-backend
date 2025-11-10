import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { EvaluacionNutricional } from './evaluacion-nutricional.entity'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Status } from '@/common/constants'

dotenv.config()

@Entity({
  name: 'evaluaciones_bioquimicas',
  schema: process.env.DB_SCHEMA_EVALUACION,
})
export class EvaluacionBioquimica extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('numeric', {
    name: 'glucosa',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  glucosa?: number

  @Column('numeric', {
    name: 'colesterol_total',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  colesterolTotal?: number

  @Column('numeric', {
    name: 'trigliceridos',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  trigliceridos?: number

  @Column('numeric', { name: 'hdl', precision: 6, scale: 2, nullable: true })
  hdl?: number

  @Column('numeric', { name: 'ldl', precision: 6, scale: 2, nullable: true })
  ldl?: number

  @Column('numeric', {
    name: 'hemoglobina',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  hemoglobina?: number

  @Column('numeric', {
    name: 'ferritina',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  ferritina?: number

  @OneToOne(
    () => EvaluacionNutricional,
    (evaluacion) => evaluacion.bioquimica,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_evaluacion_nutricional' })
  evaluacion: EvaluacionNutricional

  constructor(data?: Partial<EvaluacionBioquimica>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
