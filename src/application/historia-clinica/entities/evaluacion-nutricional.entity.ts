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
import { Cita } from '@/application/gestion-pacientes/entities/cita.entity'

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
    type: 'int',
    nullable: true,
    comment: 'Día del ciclo menstrual en el que se encuentra la paciente',
  })
  diaMenstruacion?: number

  // Medidas básicas
  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Peso corporal (kg)',
  })
  peso?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Peso en competición (kg)',
  })
  pesoCompeticion?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Peso objetivo (kg)',
  })
  pesoObjetivo?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Estatura de pie (cm)',
  })
  estatura?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Envergadura (cm)',
  })
  envergadura?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Estatura sentada (cm)',
  })
  estaturaSentada?: number

  // Pliegues
  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Pliegue tricipital (mm)',
  })
  triceps?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Pliegue subescapular (mm)',
  })
  subescapular?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Pliegue de bíceps (mm)',
  })
  biceps?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Pliegue en cresta ilíaca (mm)',
  })
  crestaIliaca?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Pliegue supra espinal (mm)',
  })
  supraEspinal?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Pliegue abdominal (mm)',
  })
  abdominal?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Pliegue en muslo (mm)',
  })
  muslo?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Pliegue en pierna (mm)',
  })
  pierna?: number

  // Perímetros
  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Perímetro del brazo relajado (cm)',
  })
  brazoRelajado?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Perímetro del brazo contraído (cm)',
  })
  brazoFlexContraido?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Perímetro de cintura (cm)',
  })
  cintura?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Perímetro de caderas (cm)',
  })
  caderas?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Perímetro del muslo medio (cm)',
  })
  musloMedio?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Perímetro de pierna (cm)',
  })
  piernaPerimetro?: number

  // Diámetros
  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Diámetro del húmero (cm)',
  })
  humero?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Diámetro biestiloideo (cm)',
  })
  biEstiloideo?: number

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Diámetro del fémur (cm)',
  })
  femur?: number

  // Hábitos alimentarios

  @Column({
    name: 'requerimiento_calorico',
    type: 'numeric',
    precision: 10,
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

  // Cálculos automáticos
  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Índice de masa corporal (IMC)',
  })
  imc?: number | null

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Masa grasa estimada (kg)',
  })
  masaGrasa?: number | null

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Masa libre de grasa estimada (kg)',
  })
  masaLibreGrasa?: number | null

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Relación cintura/cadera',
  })
  relacionCinturaCadera?: number | null

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Peso residual (kg)',
  })
  pesoResidual?: number | null

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

  @Column({
    name: 'id_cita',
    type: 'bigint',
    nullable: true,
    comment: 'Identificador de la cita asociada a la evaluación nutricional',
  })
  idCita?: string

  @ManyToOne(() => Cita, (cita) => cita.evaluacionesNutricionales, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_cita' })
  cita?: Cita

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
