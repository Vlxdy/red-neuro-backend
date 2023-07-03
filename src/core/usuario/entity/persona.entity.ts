import { UtilService } from '../../../common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Usuario } from './usuario.entity'
import { Genero, Status, TipoDocumento } from '../../../common/constants'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

dotenv.config()

export const PersonaEstado = {
  ACTIVE: Status.ACTIVE,
  INACTIVE: Status.INACTIVE,
}

@Check(UtilService.buildStatusCheck(PersonaEstado))
@Entity({ name: 'personas', schema: process.env.DB_SCHEMA_USUARIOS })
export class Persona extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Persona',
  })
  id: string

  @Column({
    length: 100,
    type: 'varchar',
    nullable: true,
    comment: 'Nombre de la persona',
  })
  nombres?: string | null

  @Column({
    name: 'primer_apellido',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Primer apellido de la persona',
  })
  primerApellido?: string | null

  @Column({
    name: 'segundo_apellido',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Segundo apellido de la persona',
  })
  segundoApellido?: string | null

  @Check(
    `tipo_documento in ('${TipoDocumento.CI}', '${TipoDocumento.PASAPORTE}', '${TipoDocumento.OTRO}')`
  )
  @Column({
    name: 'tipo_documento',
    length: 15,
    type: 'varchar',
    default: TipoDocumento.CI,
    comment: 'Tipo de documento de la persona (CI, Pasaporte, otros)',
  })
  tipoDocumento: string

  @Column({
    name: 'tipo_documento_otro',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Otro tipo de documento de la persona, si existe',
  })
  tipoDocumentoOtro?: string | null

  @Column({
    name: 'nro_documento',
    length: 50,
    comment: 'Número de documento de la persona',
  })
  nroDocumento: string

  @Column({
    name: 'fecha_nacimiento',
    type: 'date',
    nullable: true,
    comment: 'Fecha de nacimiento de la persona',
  })
  fechaNacimiento?: Date | null

  @Column({
    length: 50,
    type: 'varchar',
    nullable: true,
    comment: 'Teléfono de la persona',
  })
  telefono?: string | null

  @Check(
    `genero in ('${Genero.MASCULINO}', '${Genero.FEMENINO}', '${Genero.OTRO}')`
  )
  @Column({
    length: 15,
    type: 'varchar',
    nullable: true,
    comment: 'Género de la persona',
  })
  genero?: string | null

  @Column({
    length: 255,
    type: 'varchar',
    nullable: true,
    comment:
      'Observación, información relevante no definida en los campos establecidos referentes a la persona',
  })
  observacion?: string | null

  @OneToMany(() => Usuario, (usuario) => usuario.persona)
  usuarios: Usuario[]

  constructor(data?: Partial<Persona>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PersonaEstado.ACTIVE
  }
}
