import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import 'bootstrap/env'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { EspecialidadEstado } from '../constants'
import { UsuarioRolEspecialidad } from './usuaro-rol-especialidad.entity'
import { Cita } from '@/application/citas/entities/cita.entity'
import { ServicioEspecialidad } from '@/application/estudio/entities/estudio-especialidad.entity'

@Check(UtilService.buildStatusCheck(EspecialidadEstado))
@Entity({ name: 'especialidades', schema: process.env.DB_SCHEMA })
export class Especialidad extends AuditoriaEntity<EspecialidadEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de especialidades',
  })
  id: string

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
    nullable: false,
    comment: 'Nombre consultorio',
  })
  nombre: string

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Descripción opcional de la especialidad',
  })
  descripcion?: string

  @Column({
    name: 'color_hex',
    type: 'varchar',
    length: 7,
    nullable: false,
    comment:
      'Color principal de la especialidad en formato hexadecimal (#RRGGBB)',
  })
  colorHex: string

  @OneToMany(
    () => UsuarioRolEspecialidad,
    (usuarioRolEspecialidad) => usuarioRolEspecialidad.especialidad
  )
  usuarioRolEspecialidades: UsuarioRolEspecialidad[]

  @OneToMany(() => Cita, (cita) => cita.especialidad)
  citas: Cita[]

  @OneToMany(
    () => ServicioEspecialidad,
    (servicioEspecialidad) => servicioEspecialidad.especialidad
  )
  servicioEspecialidades: ServicioEspecialidad[]

  constructor(data?: Partial<Especialidad>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || EspecialidadEstado.ACTIVO
  }
}
