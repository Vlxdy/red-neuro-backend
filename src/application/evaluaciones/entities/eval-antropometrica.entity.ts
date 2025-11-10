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
  name: 'evaluaciones_antropometricas',
  schema: process.env.DB_SCHEMA_EVALUACION,
})
export class EvaluacionAntropometrica extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('numeric', {
    name: 'circunferencia_cintura',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  circunferenciaCintura?: number

  @Column('numeric', {
    name: 'circunferencia_cadera',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  circunferenciaCadera?: number

  @Column('numeric', {
    name: 'cintura_cadera_ratio',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  cinturaCaderaRatio?: number

  @Column('numeric', {
    name: 'pliegue_tricipital',
    precision: 4,
    scale: 1,
    nullable: true,
  })
  pliegueTricipital?: number

  @Column('numeric', {
    name: 'porcentaje_grasa',
    precision: 4,
    scale: 1,
    nullable: true,
  })
  porcentajeGrasa?: number

  @Column('numeric', {
    name: 'porcentaje_musculo',
    precision: 4,
    scale: 1,
    nullable: true,
  })
  porcentajeMusculo?: number

  @Column('numeric', {
    name: 'agua_corporal',
    precision: 4,
    scale: 1,
    nullable: true,
  })
  aguaCorporal?: number

  @OneToOne(
    () => EvaluacionNutricional,
    (evaluacion) => evaluacion.antropometria,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_evaluacion_nutricional' })
  evaluacion: EvaluacionNutricional

  constructor(data?: Partial<EvaluacionAntropometrica>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
