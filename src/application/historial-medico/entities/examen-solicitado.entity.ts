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
import { Status } from '@/common/constants'

@Entity({ name: 'examenes_solicitados', schema: process.env.DB_SCHEMA })
export class ExamenSolicitado extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único del examen solicitado',
  })
  id: string

  @Column({
    name: 'nombre_examen',
    type: 'text',
    nullable: false,
    comment: 'Nombre del examen solicitado',
  })
  nombreExamen: string

  @Column({
    name: 'instrucciones',
    type: 'text',
    nullable: true,
    comment: 'Instrucciones para la realización del examen',
  })
  instrucciones: string

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

  constructor(data?: Partial<ExamenSolicitado>) {
    super(data)
  }
  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
