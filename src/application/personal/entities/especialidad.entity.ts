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
import { OcupacionEstado } from '../constants'
import { UsuarioRolOcupacion } from './usuaro-rol-especialidad.entity'
import { ServicioOcupacion } from '@/application/servicio/entities/servicio-especialidad.entity'

@Check(UtilService.buildStatusCheck(OcupacionEstado))
@Entity({ name: 'ocupaciones', schema: process.env.DB_SCHEMA })
export class Ocupacion extends AuditoriaEntity<OcupacionEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de ocupaciones',
  })
  id: string

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
    nullable: false,
    comment: 'Nombre visible de la ocupación',
  })
  nombre: string

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Descripción opcional de la ocupación',
  })
  descripcion?: string

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment:
      'Grado o nivel profesional opcional (ej. Especialista, Licenciatura, Técnico)',
  })
  grado?: string

  @OneToMany(
    () => UsuarioRolOcupacion,
    (usuarioRolEspecialidad) => usuarioRolEspecialidad.especialidad
  )
  usuarioRolOcupaciones: UsuarioRolOcupacion[]

  @OneToMany(
    () => ServicioOcupacion,
    (servicioEspecialidad) => servicioEspecialidad.especialidad
  )
  servicioOcupaciones: ServicioOcupacion[]

  constructor(data?: Partial<Ocupacion>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || OcupacionEstado.ACTIVO
  }
}

export { Ocupacion as Especialidad }
