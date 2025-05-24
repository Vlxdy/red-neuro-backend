import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  OneToOne,
} from 'typeorm'
import { ArchivoAdjunto } from './archivos-adjunto.entity'
import { Status } from '@/common/constants'
import { EvaluacionNutricional } from './evaluacion-nutricional.entity'
import { Antecedente } from './antecedente.entity'
import { Comentario } from '@/application/historia-clinica/entities/comentario.entity'

@Entity({
  name: 'historia_clinica',
  schema: process.env.DB_SCHEMA_HISTORIA_CLINICA,
})
export class HistoriaClinica extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único del historial médico',
  })
  id: string

  @Column({
    name: 'observaciones',
    type: 'text',
    nullable: true,
    comment: 'Observaciones adicionales del médico',
  })
  observaciones: string

  @Column({
    name: 'id_paciente',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al paciente',
  })
  idPaciente: string

  @OneToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.historiaClinica, {
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
    (usuarioRol) => usuarioRol.historiaClinicaMedico,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'id_medico', referencedColumnName: 'id' })
  medico: UsuarioRol

  constructor(data?: Partial<HistoriaClinica>) {
    super(data)
  }

  @OneToMany(
    () => EvaluacionNutricional,
    (evalucacionNutricional) => evalucacionNutricional.historiaClinica
  )
  evaluacionNutricional: EvaluacionNutricional[]

  @OneToMany(() => Comentario, (comentario) => comentario.historiaClinica, {
    cascade: true,
  })
  comentarios: Comentario[]

  @OneToMany(() => Antecedente, (antecedente) => antecedente.historiaClinica)
  antecedente: Antecedente[]

  @OneToMany(() => ArchivoAdjunto, (a) => a.historiaClinica, { cascade: true })
  archivos: ArchivoAdjunto[]

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
