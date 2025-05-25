import { PlanNutricional } from '@/application/planes-alimentarios/entity/plan-nutricional.entity'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import dotenv from 'dotenv'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AsignacionEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(AsignacionEstado))
@Entity({ name: 'asignados', schema: process.env.DB_SCHEMA_USUARIOS })
export class Asignacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla asignados',
  })
  id: string

  constructor(data?: Partial<Asignacion>) {
    super(data)
  }

  @Column({
    name: 'id_medico',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al medico',
  })
  idMedico: string

  @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.asignacionMedicos, {
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

  @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.asignacionPacientes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  paciente: UsuarioRol

  @OneToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario, {
    cascade: true,
  })
  pacienteAsignado: UsuarioRol

  @OneToMany(() => PlanNutricional, (plan) => plan.paciente)
  planesNutricionales: PlanNutricional[]

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || AsignacionEstado.ACTIVO
  }
}
