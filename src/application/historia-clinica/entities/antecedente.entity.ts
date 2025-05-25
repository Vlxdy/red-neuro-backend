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
