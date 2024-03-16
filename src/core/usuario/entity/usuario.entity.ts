import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Persona } from './persona.entity'
import dotenv from 'dotenv'
import { UsuarioEstado } from '../constant'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

dotenv.config()
@Check(UtilService.buildStatusCheck(UsuarioEstado))
@Entity({ name: 'usuarios', schema: process.env.DB_SCHEMA_USUARIOS })
export class Usuario extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Usuario',
  })
  id: string

  @Column({
    length: 50,
    type: 'varchar',
    unique: true,
    comment: 'nombre de usuario, usualmente carnet de identidad',
  })
  usuario: string

  @Column({
    length: 255,
    type: 'varchar',
    comment: 'contraseña del usuario',
  })
  contrasena: string

  @Column({
    name: 'ciudadania_digital',
    type: 'boolean',
    default: false,
    comment: 'índica si el usuario tiene habilitada la ciudadanía digital',
  })
  ciudadaniaDigital: boolean

  @Column({
    name: 'correo_electronico',
    type: 'varchar',
    nullable: true,
    comment: 'correo electrónico del usuario',
  })
  correoElectronico?: string | null

  @Column({
    type: 'integer',
    default: 0,
    comment: 'número de intentos de inicio de sesión fallidos',
  })
  intentos: number

  @Index()
  @Column({
    name: 'codigo_desbloqueo',
    length: 100,
    nullable: true,
    type: 'varchar',
    comment: 'código de desbloqueo de la cuenta de usuario',
  })
  codigoDesbloqueo?: string | null

  @Index()
  @Column({
    name: 'codigo_recuperacion',
    length: 100,
    nullable: true,
    type: 'varchar',
    comment: 'código de recuperación de la cuenta de usuario',
  })
  codigoRecuperacion?: string | null

  @Index()
  @Column({
    name: 'codigo_transaccion',
    length: 100,
    nullable: true,
    type: 'varchar',
    comment: 'código de transacción de la cuenta de usuario',
  })
  codigoTransaccion?: string | null

  @Index()
  @Column({
    name: 'codigo_activacion',
    length: 100,
    nullable: true,
    type: 'varchar',
    comment: 'código de activación de la cuenta de usuario',
  })
  codigoActivacion?: string | null

  @Column({
    name: 'fecha_bloqueo',
    type: 'timestamp without time zone',
    nullable: true,
    comment: 'fecha de bloqueo de la cuenta de usuario',
  })
  fechaBloqueo?: Date | null

  @Column({
    name: 'id_persona',
    type: 'bigint',
    nullable: false,
    comment: 'clave foránea que referencia la tabla de Personas',
  })
  idPersona: string

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  usuarioRol: UsuarioRol[]

  @ManyToOne(() => Persona, (persona) => persona.usuarios, {
    nullable: false,
  })
  @JoinColumn({
    name: 'id_persona',
    referencedColumnName: 'id',
  })
  persona: Persona

  constructor(data?: Partial<Usuario>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || UsuarioEstado.ACTIVE
  }
}
