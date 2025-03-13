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
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { SeguimientoEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(SeguimientoEstado))
@Entity({ name: 'seguimiento', schema: process.env.DB_SCHEMA })
export class Seguimiento extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla seguimiento',
  })
  id: string

  constructor(data?: Partial<Seguimiento>) {
    super(data)
  }

  @Column({
    name: 'id_medico',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al medico',
  })
  idMedico: string

  @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.medicos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_medico', referencedColumnName: 'id' })
  medico: UsuarioRol

  @Column({
    name: 'id_paciente',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al paciente',
  })
  idPaciente: string

  @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.pacientes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  paciente: UsuarioRol

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || SeguimientoEstado.ACTIVO
  }
}
