import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { EvaluacionNutricionalEstado } from '../constant'
import { Cita } from './cita.entity'

dotenv.config()

@Check(UtilService.buildStatusCheck(EvaluacionNutricionalEstado))
@Entity({ name: 'evaluaciones_nutricionales', schema: process.env.DB_SCHEMA })
export class EvaluacionNutricional extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la evaluación nutricional',
  })
  id: string

  @Column({
    name: 'fecha',
    type: 'timestamp without time zone',
    nullable: true,
    comment: 'Fecha y hora de inicio de la cita',
  })
  fecha?: Date | null

  @Column({
    name: 'peso',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Peso del paciente',
  })
  peso?: number

  @Column({
    name: 'talla',
    type: 'numeric',
    precision: 4,
    scale: 2,
    comment: 'Talla del paciente',
  })
  talla?: number

  @Column({
    name: 'imc',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Indice de masa corporal del paciente',
  })
  imc?: number

  @Column({
    name: 'diagnostico',
    type: 'text',
    nullable: false,
    comment: 'Diagnóstico del paciente',
  })
  diagnostico: string

  // @Column({
  //   name: 'id_medico',
  //   type: 'bigint',
  //   nullable: false,
  //   comment: 'Clave foránea que referencia al medico',
  // })
  // idMedico: string

  // @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.citasMedico, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'id_medico', referencedColumnName: 'id' })
  // medico: UsuarioRol

  // @Column({
  //   name: 'id_paciente',
  //   type: 'bigint',
  //   nullable: false,
  //   comment: 'Clave foránea que referencia al paciente',
  // })
  // idPaciente: string

  // @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol., {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  // paciente: UsuarioRol

  @Column({
    name: 'id_cita',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la cita',
  })
  idCita: string

  @ManyToOne(() => Cita, (cita) => cita.evaluacion, {
    onDelete: 'CASCADE',
  })
  cita: Cita

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || EvaluacionNutricionalEstado.ACTIVO
  }

  constructor(data?: Partial<EvaluacionNutricional>) {
    super(data)
  }
}
