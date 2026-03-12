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
import 'bootstrap/env'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { OcupacionEstado } from '../constants'
import { Ocupacion } from './ocupacion.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

@Check(UtilService.buildStatusCheck(OcupacionEstado))
@Entity({ name: 'usuario_rol_ocupacion', schema: process.env.DB_SCHEMA })
export class UsuarioRolOcupacion extends AuditoriaEntity<OcupacionEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de usuario rol ocupacion',
  })
  id: string

  @Column({
    name: 'id_ocupacion',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la ocupacion',
  })
  idOcupacion: string

  @ManyToOne(() => Ocupacion, (ocupacion) => ocupacion.usuarioRolOcupaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_ocupacion', referencedColumnName: 'id' })
  ocupacion: Ocupacion

  @Column({
    name: 'id_usuario_rol',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la ocupacion',
  })
  idUsuarioRol: string

  @ManyToOne(
    () => UsuarioRol,
    (usuarioRol) => usuarioRol.usuarioRolOcupaciones,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_usuario_rol', referencedColumnName: 'id' })
  usuarioRol: UsuarioRol

  constructor(data?: Partial<Ocupacion>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || OcupacionEstado.ACTIVO
  }
}
