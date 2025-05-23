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
import { Rol } from './rol.entity'
import { UsuarioRolEstado } from '../constant/index'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { Asignacion } from '@/application/gestion-pacientes/entities/asignados.entity'
import { PlanAlimentario } from '@/application/planes-alimentarios/entity'
import { Cita } from '@/application/gestion-pacientes/entities/cita.entity'
import { HistoriaClinica } from '@/application/historia-clinica/entities/historia-clinica.entity'

dotenv.config()

@Check(UtilService.buildStatusCheck(UsuarioRolEstado))
@Entity({ name: 'usuarios_roles', schema: process.env.DB_SCHEMA_USUARIOS })
export class UsuarioRol extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de UsuariosRoles',
  })
  id: string

  @Column({
    name: 'id_rol',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia la tabla de roles',
  })
  idRol: string

  @Column({
    name: 'id_usuario',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia la tabla usuarios',
  })
  idUsuario: string

  @ManyToOne(() => Rol, (rol) => rol.usuarioRol)
  @JoinColumn({ name: 'id_rol', referencedColumnName: 'id' })
  rol: Rol

  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioRol)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario

  @OneToMany(() => Cita, (cita) => cita.paciente)
  citasPaciente: Cita[]

  @OneToMany(() => Cita, (cita) => cita.medico)
  citasMedico: Cita[]

  @OneToMany(() => Asignacion, (asignacion) => asignacion.medico)
  asignacionMedicos: Asignacion[]

  @OneToMany(() => Asignacion, (asignacion) => asignacion.paciente)
  asignacionPacientes: Asignacion[]

  @OneToMany(() => PlanAlimentario, (planAlimentario) => planAlimentario.medico)
  planAlimentarioMedicos: PlanAlimentario[]

  @OneToOne(
    () => HistoriaClinica,
    (historiaClinica) => historiaClinica.paciente
  )
  historiaClinica: HistoriaClinica[]

  @OneToMany(() => HistoriaClinica, (historiaClinica) => historiaClinica.medico)
  historiaClinicaMedico: HistoriaClinica[]

  @OneToMany(
    () => PlanAlimentario,
    (planAlimentario) => planAlimentario.paciente
  )
  planAlimentarioPacientes: PlanAlimentario[]

  constructor(data?: Partial<UsuarioRol>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || UsuarioRolEstado.ACTIVE
  }
}
