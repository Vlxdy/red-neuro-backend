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
import { Ocupacion } from './especialidad.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

@Check(UtilService.buildStatusCheck(OcupacionEstado))
@Entity({ name: 'usuario_rol_ocupacion', schema: process.env.DB_SCHEMA })
export class UsuarioRolOcupacion extends AuditoriaEntity<OcupacionEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de usuario rol especialidad',
  })
  id: string

  @Column({
    name: 'id_ocupacion',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la especialidad',
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

  constructor(data?: Partial<Ocupacion>) {
    super(data)
    Object.assign(this, data)
  }

  get idEspecialidad() {
    return this.idOcupacion
  }

  set idEspecialidad(value: string) {
    this.idOcupacion = value
  }

  get especialidad() {
    return this.ocupacion
  }

  set especialidad(value: Ocupacion) {
    this.ocupacion = value
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || OcupacionEstado.ACTIVO
  }
}

export { UsuarioRolOcupacion as UsuarioRolEspecialidad }
