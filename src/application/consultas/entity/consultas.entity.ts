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
import { ConsultasEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(ConsultasEstado))
@Entity({ name: 'consultas', schema: process.env.DB_SCHEMA })
export class Consultas extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Consultas',
  })
  id: string

  constructor(data?: Partial<Consultas>) {
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
    this.estado = this.estado || ConsultasEstado.ACTIVO
  }
}
