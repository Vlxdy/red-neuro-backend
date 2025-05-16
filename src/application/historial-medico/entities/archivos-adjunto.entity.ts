import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { HistorialMedico } from './historial-medico.entity'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'

@Entity({ name: 'archivos_adjuntos', schema: process.env.DB_SCHEMA })
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
    nullable: false,
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
    name: 'id_historial_medico',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del historial médico asociado',
  })
  idHistorialMedico: string

  @ManyToOne(() => HistorialMedico, (historial) => historial.archivos)
  @JoinColumn({ name: 'id_historial_medico' })
  historialMedico: HistorialMedico

  constructor(data?: Partial<ArchivoAdjunto>) {
    super(data)
  }
}
