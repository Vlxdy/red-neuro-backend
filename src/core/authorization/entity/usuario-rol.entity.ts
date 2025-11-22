import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Rol } from './rol.entity'
import { UsuarioRolEstado } from '../constant/index'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import { Usuario } from '@/core/usuario/entity/usuario.entity'

dotenv.config()

@Check(UtilService.buildStatusCheck(UsuarioRolEstado))
@Entity({ name: 'usuarios_roles', schema: process.env.DB_SCHEMA_USUARIOS })
export class UsuarioRol extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de UsuariosRoles',
  })
  id: string

  @Column({
    name: 'id_rol',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia la tabla de roles',
  })
  idRol: string

  @Column({
    name: 'id_usuario',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia la tabla usuarios',
  })
  idUsuario: string

  @ManyToOne(() => Rol, (rol) => rol.usuarioRol)
  @JoinColumn({ name: 'id_rol', referencedColumnName: 'id' })
  rol: Rol

  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioRol)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario

  constructor(data?: Partial<UsuarioRol>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || UsuarioRolEstado.ACTIVE
  }
}
