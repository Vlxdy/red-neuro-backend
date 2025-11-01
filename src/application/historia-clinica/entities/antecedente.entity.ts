import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Status } from '@/common/constants'
import { HistoriaClinica } from './historia-clinica.entity'
import { ArchivoAdjunto } from './archivos-adjunto.entity'
import {
  AntecedenteEstadoRegistro,
  AntecedenteFuenteDatos,
} from '../constants/antecedentes.constants'

@Entity({
  name: 'antecedentes',
  schema: process.env.DB_SCHEMA_HISTORIA_CLINICA,
})
export class Antecedente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único del antecedente',
  })
  id: string

  // Datos clínicos familiares
  @Column({ type: 'text', nullable: true, comment: 'Antecedentes familiares' })
  antecedentesFamiliares?: string

  @Column({
    type: 'boolean',
    default: false,
    comment: '¿Tiene enfermedad diagnosticada?',
  })
  enfermedadDiagnosticada: boolean

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Descripción de la enfermedad',
  })
  descripcionEnfermedad?: string

  @Column({ type: 'boolean', default: false, comment: '¿Sigue tratamiento?' })
  sigueTratamiento: boolean

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Descripción del tratamiento',
  })
  descripcionTratamiento?: string

  @Column({ type: 'boolean', default: false, comment: '¿Ha tenido cirugía?' })
  tieneCirugia: boolean

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Descripción de la cirugía',
  })
  descripcionCirugia?: string

  // Gastrointestinal
  @Column({ type: 'boolean', default: false, comment: '¿Tiene estreñimiento?' })
  tieneEstrenimiento: boolean

  @Column({ type: 'boolean', default: false, comment: '¿Tiene diarrea?' })
  tieneDiarrea: boolean

  @Column({ type: 'boolean', default: false, comment: '¿Tiene náuseas?' })
  tieneNauseas: boolean

  @Column({ type: 'boolean', default: false, comment: '¿Tiene vómitos?' })
  tieneVomitos: boolean

  @Column({ type: 'text', nullable: true, comment: 'Frecuencia de evacuación' })
  frecuenciaEvacuacion?: string

  @Column({ type: 'text', nullable: true, comment: 'Tipo de deposición' })
  tipoDeposicion?: string

  // Alergias e intolerancias
  @Column({ type: 'text', nullable: true, comment: 'Alergias alimentarias' })
  alergias?: string

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Intolerancias alimentarias',
  })
  intolerancias?: string

  // Datos ginecológicos
  @Column({
    type: 'date',
    nullable: true,
    comment: 'Fecha de última menstruación',
  })
  fechaUltimaMenstruacion?: Date | string

  @Column({
    type: 'boolean',
    nullable: true,
    comment: '¿Menstruación regular?',
  })
  menstruacionRegular?: boolean

  @Column({ type: 'text', nullable: true, comment: 'Método anticonceptivo' })
  metodoAnticonceptivo?: string

  @Column({ type: 'boolean', nullable: true, comment: '¿Presenta cólicos?' })
  colicos?: boolean

  // Dietas anteriores
  @Column({
    type: 'text',
    nullable: true,
    comment: 'Dietas anteriores, tipos y resultados',
  })
  dietasAnteriores?: string

  @Column({
    name: 'id_historia_clinica',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del historial clínico asociado',
  })
  idHistoriaClinica: string

  @Column({
    name: 'estado_registro',
    type: 'varchar',
    length: 20,
    default: AntecedenteEstadoRegistro.BORRADOR,
    comment: 'Estado de completitud del antecedente',
  })
  estadoRegistro: AntecedenteEstadoRegistro

  @Column({
    name: 'motivo_actualizacion',
    type: 'text',
    nullable: true,
    comment: 'Motivo de la última actualización del antecedente',
  })
  motivoActualizacion?: string | null

  @Column({
    name: 'version',
    type: 'int',
    default: 1,
    comment: 'Número de versión del antecedente',
  })
  version: number

  @Column({
    name: 'fuente_datos',
    type: 'varchar',
    length: 30,
    default: AntecedenteFuenteDatos.PROFESIONAL,
    comment: 'Fuente de los datos registrados',
  })
  fuenteDatos: AntecedenteFuenteDatos

  @Column({
    name: 'id_evaluacion_nutricional_origen',
    type: 'bigint',
    nullable: true,
    comment: 'Evaluación nutricional que origina la versión del antecedente',
  })
  idEvaluacionNutricionalOrigen?: string | null

  @Column({
    name: 'fecha_cierre',
    type: 'timestamp without time zone',
    nullable: true,
    comment: 'Fecha en la que el antecedente pasó a estado completo',
  })
  fechaCierre?: Date | null

  @ManyToOne(() => HistoriaClinica, (historial) => historial.antecedente)
  @JoinColumn({ name: 'id_historia_clinica' })
  historiaClinica: HistoriaClinica

  @OneToMany(
    () => ArchivoAdjunto,
    (archivoAdjunto) => archivoAdjunto.antecedente,
    { cascade: true }
  )
  archivos: ArchivoAdjunto[]

  constructor(data?: Partial<Antecedente>) {
    super(data)
  }
  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
