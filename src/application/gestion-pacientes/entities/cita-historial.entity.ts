import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Cita } from './cita.entity'
import { CitasEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(CitasEstado))
@Entity({ name: 'historial_citas', schema: process.env.DB_SCHEMA_HISTORICOS })
export class HistorialCita extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Cita Historico',
  })
  id: string

  @Column({
    name: 'id_cita',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la cita',
  })
  idCita: string

  @ManyToOne(() => Cita, (cita) => cita.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cita', referencedColumnName: 'id' })
  cita: Cita

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CitasEstado.PENDIENTE
  }

  constructor(data?: Partial<HistorialCita>) {
    super(data)
  }
}
