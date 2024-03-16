import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Usuario } from './usuario.entity'
import { PersonaEstado, TiposDocumento, TiposGenero } from '../constant'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'

dotenv.config()

@Check(UtilService.buildStatusCheck(PersonaEstado))
@Check(UtilService.buildCheck('tipo_documento', TiposDocumento))
@Check(UtilService.buildCheck('genero', TiposGenero))
@Entity({ name: 'personas', schema: process.env.DB_SCHEMA_USUARIOS })
export class Persona extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Persona',
  })
  id: string

  @Column({
    name: 'uuid_ciudadano',
    type: 'uuid',
    nullable: true,
    unique: true,
    comment: 'UUID de Ciudadanía Digital',
  })
  uuidCiudadano?: string | null

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

  @Column({
    name: 'tipo_documento',
    length: 15,
    type: 'varchar',
    default: TiposDocumento.CI,
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
