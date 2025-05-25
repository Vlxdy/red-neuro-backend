import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Status } from '@/common/constants'
import { HistoriaClinica } from './historia-clinica.entity'
import { EvaluacionNutricional } from './evaluacion-nutricional.entity'
import { Antecedente } from './antecedente.entity'

@Entity({
  name: 'archivos_adjuntos',
  schema: process.env.DB_SCHEMA_HISTORIA_CLINICA,
})
export class ArchivoAdjunto extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único del archivo adjunto',
  })
  id: string

  @Column({
    name: 'nombre_archivo',
    type: 'text',
    nullable: false,
    comment: 'Nombre del archivo adjunto',
  })
  nombreArchivo: string

  @Column({
    name: 'codigo',
    type: 'text',
    nullable: true,
    comment: 'Código único del archivo adjunto',
  })
  codigo: string

  @Column({
    name: 'tipo_archivo',
    type: 'text',
    nullable: false,
    comment: 'Tipo de archivo adjunto (ejemplo: imagen, documento)',
  })
  tipoArchivo: string

  @Column({
    name: 'contenido_base64',
    type: 'text',
    nullable: true,
    comment: 'Contenido del archivo en formato base64',
  })
  contenidoBase64: string // sin prefijo: solo el base64 puro

  @Column({
    name: 'id_historia_clinica',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del historia clínica asociado',
  })
  idHistoriaClinica: string

  @ManyToOne(() => HistoriaClinica, (historial) => historial.archivos)
  @JoinColumn({ name: 'id_historia_clinica' })
  historiaClinica: HistoriaClinica

  @Column({
    name: 'id_evaluacion_nutricional',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del evaluación nutricional asociado',
  })
  idEvaluacionNutricional: string

  @ManyToOne(
    () => EvaluacionNutricional,
    (evaluaciones_nutricionales) => evaluaciones_nutricionales.archivos
  )
  @JoinColumn({ name: 'id_evaluacion_nutricional' })
  evaluacionNutricional: HistoriaClinica

  @Column({
    name: 'id_antecedente',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del antecedente asociado',
  })
  idAntecedente: string

  @ManyToOne(() => Antecedente, (antecedente) => antecedente.archivos)
  @JoinColumn({ name: 'id_antecedente' })
  antecedente: Antecedente

  constructor(data?: Partial<ArchivoAdjunto>) {
    super(data)
  }
  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
