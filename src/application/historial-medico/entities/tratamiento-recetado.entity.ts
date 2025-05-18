import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm'
import { HistorialMedico } from './historial-medico.entity'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { ArchivoAdjunto } from './archivos-adjunto.entity'
import { Status } from '@/common/constants'

// TODO: Revisar si es necesario usar esta entidad
@Entity({ name: 'tratamientos_recetados', schema: process.env.DB_SCHEMA })
export class TratamientoRecetado extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único del tratamiento recetado',
  })
  id: number

  @Column('text')
  descripcion: string

  @Column()
  duracion: string

  @Column()
  dosis: string

  @Column()
  frecuencia: string

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
  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
