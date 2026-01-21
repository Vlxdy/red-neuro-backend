import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import 'bootstrap/env'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Paciente } from '@/application/paciente/entities/paciente.entity'

import { HistorialCita } from './cita-historial.entity'

import { CitasEstado } from '../constants'
import { Notificacion } from './notificacion.entity'
import { Consultorio } from '@/application/consultorio/entities/consultorio.entity'
import { Especialidad } from '@/application/personal/entities/especialidad.entity'
import { Estudio } from '@/application/estudio/entities/estudio.entity'

@Check(UtilService.buildStatusCheck(CitasEstado))
@Entity({ name: 'citas', schema: process.env.DB_SCHEMA })
export class Cita extends AuditoriaEntity<CitasEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Citas',
  })
  id: string

  @Column({
    name: 'fecha_inicio',
    type: 'timestamp without time zone',
    nullable: true,
    comment: 'Fecha y hora de inicio de la cita',
  })
  fechaInicio?: Date | null

  @Column({
    name: 'fecha_fin',
    type: 'timestamp without time zone',
    nullable: true,
    comment: 'Fecha y hora de fin de la cita',
  })
  fechaFin?: Date | null

  @Column({
    name: 'detalle',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Descripción de la cita',
  })
  detalle: string

  @Column({
    name: 'locked_at',
    type: 'timestamp without time zone',
    nullable: true,
    comment:
      'Fecha y hora en la que la cita fue confirmada y quedó bloqueada para el paciente',
  })
  lockedAt?: Date | null

  @Column({
    name: 'reversiones_pendiente',
    type: 'int',
    nullable: false,
    default: 0,
    comment:
      'Cantidad de veces que el paciente ha revertido una cita pendiente a borrador dentro de la ventana controlada',
  })
  reversionesPendiente: number

  @Column({
    name: 'reversiones_pendiente_ultima',
    type: 'timestamp without time zone',
    nullable: true,
    comment:
      'Marca temporal de la última reversión de pendiente a borrador para cálculo de ventanas de tiempo',
  })
  reversionPendienteActualizadaEn?: Date | null

  @Column({
    name: 'reprogramaciones_rechazo',
    type: 'int',
    nullable: false,
    default: 0,
    comment:
      'Cantidad de reprogramaciones realizadas por el paciente tras un rechazo del nutricionista',
  })
  reprogramacionesDesdeRechazo: number

  @Column({
    name: 'reprogramaciones_totales',
    type: 'int',
    nullable: false,
    default: 0,
    comment:
      'Cantidad total de reprogramaciones ejecutadas sobre una cita aprobada',
  })
  reprogramacionesTotales: number
  // relaciones

  @Column({
    name: 'id_medico',
    type: 'bigint',
    nullable: true,
    comment: 'Clave foránea que referencia al medico',
  })
  idMedico: string

  @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.citasMedico, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_medico', referencedColumnName: 'id' })
  medico: UsuarioRol

  @Column({
    name: 'id_paciente',
    type: 'bigint',
    nullable: true,
    comment: 'Clave foránea que referencia al paciente',
  })
  idPaciente?: string | null

  @ManyToOne(() => Paciente, (paciente) => paciente.citas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  paciente?: Paciente | null

  @Column({
    name: 'id_consultorio',
    type: 'bigint',
    nullable: true,
    comment: 'Clave foránea que referencia al consultorio asociado a la cita',
  })
  idConsultorio?: string | null

  @ManyToOne(() => Consultorio, (consultorio) => consultorio.citas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_consultorio', referencedColumnName: 'id' })
  consultorio?: Consultorio | null

  @OneToMany(() => HistorialCita, (historialCita) => historialCita.cita)
  historial: HistorialCita[]

  @OneToMany(() => Notificacion, (notificacion) => notificacion.cita)
  notificacion: Notificacion[]

  @Column({
    name: 'id_especialidad',
    type: 'bigint',
    nullable: true,
    comment: 'Clave foránea que referencia al consultorio asociado a la cita',
  })
  idEspecialidad?: string | null

  @ManyToOne(() => Especialidad, (especialidad) => especialidad.citas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_especialidad', referencedColumnName: 'id' })
  especialidad?: Especialidad | null

  @Column({
    name: 'es_estudio',
    type: 'boolean',
    nullable: false,
    comment: 'Indica si la cita es para un estudio',
    default: false,
  })
  esEstudio: boolean

  @Column({
    name: 'id_estudio',
    type: 'bigint',
    nullable: true,
    comment: 'Clave foránea que referencia al estudio asociado a la cita',
  })
  idEstudio?: string | null

  @ManyToOne(() => Estudio, (estudio) => estudio.citas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_estudio', referencedColumnName: 'id' })
  estudio?: Estudio | null

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CitasEstado.SOLICITADA
  }

  constructor(data?: Partial<Cita>) {
    super(data)
  }
}
