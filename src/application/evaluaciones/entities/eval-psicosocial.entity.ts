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
  name: 'evaluaciones_psicosociales',
  schema: process.env.DB_SCHEMA_EVALUACION,
})
export class EvaluacionPsicosocial extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('int', { name: 'nivel_motivacion', nullable: true })
  nivelMotivacion?: number

  @Column('int', { name: 'estres_alimentario', nullable: true })
  estresAlimentario?: number

  @Column('int', { name: 'ansiedad', nullable: true })
  ansiedad?: number

  @Column('int', { name: 'apoyo_familiar', nullable: true })
  apoyoFamiliar?: number

  @Column('int', { name: 'cumplimiento_dieta', nullable: true })
  cumplimientoDieta?: number

  @OneToOne(
    () => EvaluacionNutricional,
    (evaluacion) => evaluacion.psicosocial,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_evaluacion_nutricional' })
  evaluacion: EvaluacionNutricional

  constructor(data?: Partial<EvaluacionPsicosocial>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
