import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Status } from '@/common/constants'
import { UtilService } from '@/common/lib/util.service'
import { Paciente } from './paciente.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Check(UtilService.buildStatusCheck(Status))
@Entity({
  name: 'pacientes_profesionales_invitados',
  schema: process.env.DB_SCHEMA,
})
export class PacienteProfesionalInvitado extends AuditoriaEntity<Status> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la relación paciente-profesional invitado',
  })
  id: string

  @Column({
    name: 'id_paciente',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al paciente asignado',
  })
  idPaciente: string

  @Column({
    name: 'id_profesional_invitado',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al profesional invitado',
  })
  idProfesionalInvitado: string

  @Column({
    name: 'id_cita_origen',
    type: 'bigint',
    nullable: true,
    comment: 'Cita que originó la asignación automática',
  })
  idCitaOrigen?: string | null

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  paciente: Paciente

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_profesional_invitado', referencedColumnName: 'id' })
  profesionalInvitado: Usuario

  constructor(data?: Partial<PacienteProfesionalInvitado>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
