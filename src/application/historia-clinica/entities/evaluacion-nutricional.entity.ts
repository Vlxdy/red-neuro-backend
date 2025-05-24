import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { EvaluacionNutricionalEstado } from '../../gestion-pacientes/constant'
import { HistoriaClinica } from './historia-clinica.entity'
import { ArchivoAdjunto } from './archivos-adjunto.entity'

dotenv.config()

@Entity({
  name: 'evaluaciones_nutricionales',
  schema: process.env.DB_SCHEMA_HISTORIA_CLINICA,
})
export class EvaluacionNutricional extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la evaluación nutricional',
  })
  id: string

  //  Medidas antropométricas
  @Column({
    name: 'peso',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'Peso del paciente',
  })
  peso: number

  @Column({
    name: 'talla',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Talla del paciente',
  })
  talla: number

  @Column({
    name: 'imc',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Indice de masa corporal del paciente',
  })
  imc: number

  // Hábitos alimentarios

  @Column({
    name: 'requerimiento_calorico',
    type: 'numeric',
    precision: 7,
    scale: 2,
    nullable: true,
    comment: 'Requerimiento calórico del paciente',
  })
  requerimientoCalorico: number

  @Column({
    name: 'diagnostico',
    type: 'text',
    nullable: false,
    comment: 'Diagnóstico del paciente',
  })
  diagnostico: string

  @Column({
    name: 'id_historia_clinica',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del historial médico asociado',
  })
  idHistoriaClinica: string

  @ManyToOne(
    () => HistoriaClinica,
    (historiaClinica) => historiaClinica.evaluacionNutricional
  )
  @JoinColumn({ name: 'id_historia_clinica' })
  historiaClinica: HistoriaClinica

  @OneToMany(() => ArchivoAdjunto, (a) => a.evaluacionNutricional, {
    cascade: true,
  })
  archivos: ArchivoAdjunto[]

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || EvaluacionNutricionalEstado.ACTIVO
  }

  constructor(data?: Partial<EvaluacionNutricional>) {
    super(data)
  }
}
