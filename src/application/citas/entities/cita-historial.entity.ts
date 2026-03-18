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
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Cita } from './cita.entity'
import { CitasHistorialEstado } from '../constants'
import { TipoActualizacion } from './notificacion.entity'
import 'bootstrap/env'
import { Usuario } from '@/core/usuario/entity/usuario.entity'

@Check(UtilService.buildStatusCheck(CitasHistorialEstado))
@Entity({ name: 'historial_citas', schema: process.env.DB_SCHEMA })
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

  @Column({
    name: 'id_historial_cita',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Identificador compartido de la cadena de reprogramaciones',
  })
  idHistorialCita?: string | null

  @ManyToOne(() => Cita, (cita) => cita.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cita', referencedColumnName: 'id' })
  cita: Cita

  @Column({
    name: 'id_ejecutor',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del usuario ejecutor',
  })
  idEjecutor: string

  @ManyToOne(() => Usuario, (usuario) => usuario.historialesEjecutados)
  @JoinColumn({ name: 'id_ejecutor', referencedColumnName: 'id' })
  ejecutor: Usuario

  @Column({
    name: 'comentario',
    type: 'text',
    nullable: true,
    comment: 'Comentario asociado a la transición de estado',
  })
  comentario?: string | null

  @Column({
    name: 'detalle_cambios',
    type: 'jsonb',
    nullable: true,
    comment: 'Detalle de los cambios realizados sobre la cita',
  })
  detalleCambios?: TipoActualizacion[] | null

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CitasHistorialEstado.ACTIVO
  }

  constructor(data?: Partial<HistorialCita>) {
    super(data)
  }
}
