import { Cita } from '@/application/gestion-pacientes/entities/cita.entity'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { Diagnostico } from './diagnostico.entity'
import { ExamenSolicitado } from './examen-solicitado.entity'
import { TratamientoRecetado } from './tratamiento-recetado.entity'
import { ArchivoAdjunto } from './archivos-adjunto.entity'

@Entity({ name: 'historial_medico', schema: process.env.DB_SCHEMA })
export class HistorialMedico extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único del historial médico',
  })
  id: string

  @Column({
    name: 'motivo_consulta',
    type: 'text',
    nullable: false,
    comment: 'Motivo de la consulta médica',
  })
  motivoConsulta: string

  @Column({
    name: 'antecedentes_personales',
    type: 'text',
    nullable: true,
    comment: 'Antecedentes personales del paciente',
  })
  antecedentesPersonales: string

  @Column({
    name: 'antecedentes_familiares',
    type: 'text',
    nullable: true,
    comment: 'Antecedentes familiares del paciente',
  })
  antecedentesFamiliares: string

  @Column({
    name: 'sintomas',
    type: 'text',
    nullable: false,
    comment: 'Descripción de los síntomas del paciente',
  })
  sintomas: string

  @Column({
    name: 'evaluacion_fisica',
    type: 'text',
    nullable: true,
    comment: 'Resultados de la evaluación física del paciente',
  })
  evaluacionFisica: string

  @Column({
    name: 'observaciones',
    type: 'text',
    nullable: true,
    comment: 'Observaciones adicionales del médico',
  })
  observaciones: string

  @OneToMany(() => Diagnostico, (d) => d.historialMedico, { cascade: true })
  diagnosticos: Diagnostico[]

  @OneToMany(() => ExamenSolicitado, (e) => e.historialMedico, {
    cascade: true,
  })
  examenes: ExamenSolicitado[]

  @OneToMany(() => TratamientoRecetado, (t) => t.historialMedico, {
    cascade: true,
  })
  tratamientos: TratamientoRecetado[]

  @OneToMany(() => ArchivoAdjunto, (a) => a.historialMedico, { cascade: true })
  archivos: ArchivoAdjunto[]

  @Column({
    name: 'id_cita',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la cita',
  })
  idCita: string
  @ManyToOne(() => Cita, (cita) => cita.historialMedico, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cita', referencedColumnName: 'id' })
  cita: Cita

  @Column({
    name: 'id_paciente',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al paciente',
  })
  idPaciente: string

  @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.historialMedico, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  paciente: UsuarioRol

  @Column({
    name: 'id_medico',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al medico',
  })
  idMedico: string

  @ManyToOne(
    () => UsuarioRol,
    (usuarioRol) => usuarioRol.historialMedicoMedicos,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_medico', referencedColumnName: 'id' })
  medico: UsuarioRol

  constructor(data?: Partial<HistorialMedico>) {
    super(data)
  }
}
