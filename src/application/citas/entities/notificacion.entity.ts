import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Status } from '../../../common/constants'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UtilService } from '../../../common/lib/util.service'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { Cita } from './cita.entity'

export const NotificacionEstado = {
  ACTIVE: Status.ACTIVE,
  INACTIVE: Status.INACTIVE,
}

export enum NotificacionTipo {
  CITA_PROXIMAMENTE = 'CITA_PROXIMAMENTE',
  CITA_CANCELADA = 'CITA_CANCELADA',
  CITA_PROGRAMADA = 'CITA_PROGRAMADA',
  CITA_REPROGRAMADA = 'CITA_REPROGRAMADA',
  CITA_NO_ASISTIO = 'CITA_NO_ASISTIO',
  CITA_SOLICITADA = 'CITA_SOLICITADA',
  CITA_RECHAZADA = 'CITA_RECHAZADA',
}

export interface TipoActualizacion {
  field: string
  after?: string
  afterColor?: string
  before?: string
  beforeColor?: string
  beforeArray?: Array<string>
  afterArray?: Array<string>
  beforeDetalle?: Record<string, unknown>
  afterDetalle?: Record<string, unknown>
}

@Check(UtilService.buildStatusCheck(NotificacionEstado))
@Entity({ name: 'notificaciones', schema: process.env.DB_SCHEMA_HISTORICOS })
export class Notificacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único para cada notificación',
  })
  id: string

  @Column({
    type: 'varchar',
    length: 50,
    name: 'tipo',
    comment: 'Define el tipo de notificación',
  })
  tipo: NotificacionTipo

  @Column({
    type: 'text',
    name: 'mensaje',
    comment: 'Mensaje de la notificación',
  })
  mensaje: string

  @Column({
    type: 'boolean',
    name: 'visto',
    nullable: false,
    default: false,
    comment: 'Indica si la notificación ha sido vista',
  })
  visto?: boolean

  @Column({
    name: 'id_cita',
    type: 'bigint',
    nullable: true,
    comment: 'Identificador de la cita asociada a la notificación',
  })
  idCita: string
  @ManyToOne(() => Cita, (cita) => cita.notificacion, {
    nullable: true,
  })
  @JoinColumn({ name: 'id_cita', referencedColumnName: 'id' })
  cita: Cita

  @Column({
    type: 'bigint',
    name: 'id_medico',
    nullable: true,
    comment: 'Identificador del personal asociado a la notificación',
  })
  idPersonal: string
  @ManyToOne(() => Usuario, {
    nullable: true,
  })
  @JoinColumn({ name: 'id_medico', referencedColumnName: 'id' })
  personal: Usuario
  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || NotificacionEstado.ACTIVE
  }

  constructor(data?: Partial<Notificacion>) {
    super(data)
  }
}
