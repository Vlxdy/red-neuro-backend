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
import { EspecialidadEstado } from '../constants'
import { Especialidad } from './especialidad.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

@Check(UtilService.buildStatusCheck(EspecialidadEstado))
@Entity({ name: 'usuario_rol_especialidad', schema: process.env.DB_SCHEMA })
export class UsuarioRolEspecialidad extends AuditoriaEntity<EspecialidadEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de usuario rol especialidad',
  })
  id: string

  @Column({
    name: 'id_especialidad',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la especialidad',
  })
  idEspecialidad: string

  @ManyToOne(
    () => Especialidad,
    (especialidad) => especialidad.usuarioRolEspecialidades,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_especialidad', referencedColumnName: 'id' })
  especialidad: Especialidad

  @Column({
    name: 'id_usuario_rol',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la especialidad',
  })
  idUsuarioRol: string

  @ManyToOne(
    () => UsuarioRol,
    (usuarioRol) => usuarioRol.usuarioRolEspecialidades,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_usuario_rol', referencedColumnName: 'id' })
  usuarioRol: UsuarioRol

  constructor(data?: Partial<Especialidad>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || EspecialidadEstado.ACTIVO
  }
}
