import { Status } from '@/common/constants'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import 'bootstrap/env'
import { Cita } from './cita.entity'
import { Etiqueta } from './etiqueta.entity'

@Entity({ name: 'citas_etiquetas_detalle', schema: process.env.DB_SCHEMA })
@Unique(['citaId', 'etiquetaId'])
export class CitaEtiqueta extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la relación cita-etiqueta',
  })
  id: string

  @Column({
    name: 'id_cita',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador de la cita',
  })
  citaId: string

  @Column({
    name: 'id_etiqueta',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador de la etiqueta',
  })
  etiquetaId: string

  @ManyToOne(() => Cita, (cita) => cita.citaEtiquetas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cita', referencedColumnName: 'id' })
  cita: Cita

  @ManyToOne(() => Etiqueta, (etiqueta) => etiqueta.citaEtiquetas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_etiqueta', referencedColumnName: 'id' })
  etiqueta: Etiqueta

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
