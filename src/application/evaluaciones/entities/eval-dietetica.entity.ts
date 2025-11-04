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
  name: 'evaluaciones_dieteticas',
  schema: process.env.DB_SCHEMA_HISTORIA_CLINICA,
})
export class EvaluacionDietetica extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('numeric', {
    name: 'calorias_totales',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  caloriasTotales?: number

  @Column('int', {
    name: 'numero_comidas_diarias',
    nullable: true,
  })
  numeroComidasDiarias?: number

  @Column('jsonb', { name: 'registro_alimentario', nullable: true })
  registroAlimentario?: Record<string, any>

  @Column('int', { name: 'nivel_consumo_azucar', nullable: true })
  nivelConsumoAzucar?: number

  @Column('int', { name: 'nivel_hidratacion', nullable: true })
  nivelHidratacion?: number

  @OneToOne(() => EvaluacionNutricional, (evaluacion) => evaluacion.dietetica, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_evaluacion_nutricional' })
  evaluacion: EvaluacionNutricional

  constructor(data?: Partial<EvaluacionDietetica>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
