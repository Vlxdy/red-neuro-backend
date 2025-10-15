import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Cita } from '@/application/gestion-pacientes/entities/cita.entity'
import { EvaluacionNutricionalEstado } from '@/application/gestion-pacientes/constant'
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
import dotenv from 'dotenv'
import { HistoriaClinica } from './historia-clinica.entity'
import { EvaluacionAntropometrica } from './eval-antropometrica.entity'
import { EvaluacionBioquimica } from './eval-bioquimica.entity'
import { EvaluacionDietetica } from './eval-dietetica.entity'
import { EvaluacionClinica } from './eval-clinica.entity'
import { EvaluacionPsicosocial } from './eval-psicosocial.entity'
import { ArchivoAdjunto } from './archivos-adjunto.entity'

dotenv.config()

@Entity({
  name: 'evaluaciones_nutricionales',
  schema: process.env.DB_SCHEMA_HISTORIA_CLINICA,
})
export class EvaluacionNutricional extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('bigint', { name: 'id_historia_clinica' })
  idHistoriaClinica: string

  @ManyToOne(
    () => HistoriaClinica,
    (historiaClinica) => historiaClinica.evaluacionNutricional,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_historia_clinica' })
  historiaClinica: HistoriaClinica

  @Column('date', { name: 'fecha_evaluacion' })
  fechaEvaluacion: string

  @Column('numeric', { name: 'peso', precision: 5, scale: 2, nullable: true })
  peso?: number

  @Column('numeric', { name: 'talla', precision: 4, scale: 2, nullable: true })
  talla?: number

  @Column('numeric', { name: 'imc', precision: 4, scale: 2, nullable: true })
  imc?: number

  @Column('text', { name: 'diagnostico_nutricional', nullable: true })
  diagnosticoNutricional?: string

  @Column('text', { name: 'observaciones', nullable: true })
  observaciones?: string

  @Column('bigint', { name: 'id_cita', nullable: true })
  idCita?: string

  @ManyToOne(() => Cita, (cita) => cita.evaluacionesNutricionales, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_cita' })
  cita?: Cita

  @OneToOne(
    () => EvaluacionAntropometrica,
    (antropometria) => antropometria.evaluacion,
    { cascade: true }
  )
  antropometria?: EvaluacionAntropometrica

  @OneToOne(() => EvaluacionBioquimica, (bioquimica) => bioquimica.evaluacion, {
    cascade: true,
  })
  bioquimica?: EvaluacionBioquimica

  @OneToOne(() => EvaluacionDietetica, (dietetica) => dietetica.evaluacion, {
    cascade: true,
  })
  dietetica?: EvaluacionDietetica

  @OneToOne(() => EvaluacionClinica, (clinica) => clinica.evaluacion, {
    cascade: true,
  })
  clinica?: EvaluacionClinica

  @OneToOne(
    () => EvaluacionPsicosocial,
    (psicosocial) => psicosocial.evaluacion,
    { cascade: true }
  )
  psicosocial?: EvaluacionPsicosocial

  @OneToMany(
    () => ArchivoAdjunto,
    (archivoAdjunto) => archivoAdjunto.antecedente,
    { cascade: true }
  )
  archivos: ArchivoAdjunto[]

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || EvaluacionNutricionalEstado.ACTIVO
  }

  constructor(data?: Partial<EvaluacionNutricional>) {
    super(data)
  }
}
