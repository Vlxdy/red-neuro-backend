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
  name: 'evaluaciones_clinicas',
  schema: process.env.DB_SCHEMA_EVALUACION,
})
export class EvaluacionClinica extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { name: 'patologias_previas', nullable: true })
  patologiasPrevias?: string

  @Column('text', { name: 'medicacion_actual', nullable: true })
  medicacionActual?: string

  @Column('boolean', { name: 'nauseas', nullable: true })
  nauseas?: boolean

  @Column('boolean', { name: 'vomitos', nullable: true })
  vomitos?: boolean

  @Column('boolean', { name: 'diarrea', nullable: true })
  diarrea?: boolean

  @Column('boolean', { name: 'fatiga', nullable: true })
  fatiga?: boolean

  @OneToOne(() => EvaluacionNutricional, (evaluacion) => evaluacion.clinica, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_evaluacion_nutricional' })
  evaluacion: EvaluacionNutricional

  constructor(data?: Partial<EvaluacionClinica>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
