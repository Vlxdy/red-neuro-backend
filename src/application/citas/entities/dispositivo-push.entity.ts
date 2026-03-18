import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Status } from '../../../common/constants'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UtilService } from '../../../common/lib/util.service'

export const DispositivoPushEstado = {
  ACTIVE: Status.ACTIVE,
  INACTIVE: Status.INACTIVE,
}

@Entity({ name: 'dispositivos_push', schema: process.env.DB_SCHEMA_HISTORICOS })
@Check(UtilService.buildStatusCheck(DispositivoPushEstado))
export class DispositivoPush extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string

  @Column({ type: 'bigint', name: 'id_usuario' })
  idUsuario: string

  @Column({ type: 'varchar', length: 20, name: 'plataforma' })
  plataforma: string

  @Column({ type: 'varchar', length: 500, name: 'token' })
  token: string

  @Column({
    type: 'timestamp without time zone',
    name: 'ultima_conexion',
    nullable: true,
  })
  ultimaConexion?: Date

  @Column({ type: 'varchar', length: 30, name: 'version_app', nullable: true })
  versionApp?: string

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || DispositivoPushEstado.ACTIVE
  }

  constructor(data?: Partial<DispositivoPush>) {
    super(data)
  }
}
