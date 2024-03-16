import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UsuarioRol } from './usuario-rol.entity'
import dotenv from 'dotenv'
import { RolEstado } from '../constant'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
dotenv.config()

@Check(UtilService.buildStatusCheck(RolEstado))
@Entity({ name: 'roles', schema: process.env.DB_SCHEMA_USUARIOS })
export class Rol extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Rol',
  })
  id: string

  @Column({
    length: 50,
    type: 'varchar',
    unique: true,
    comment: 'Rol definido',
  })
  rol: string

  @Column({ length: 100, type: 'varchar', comment: 'Nombre de rol' })
  nombre: string

  @Column({ length: 255, type: 'varchar', comment: 'Descripción de rol' })
  descripcion: string

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.rol)
  usuarioRol: UsuarioRol[]

  constructor(data?: Partial<Rol>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || RolEstado.ACTIVE
  }
}
