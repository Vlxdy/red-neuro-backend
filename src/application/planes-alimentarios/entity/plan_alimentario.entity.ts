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
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { PlanAlimentarioEstado } from '../constant'
import { DetallePlan } from './detalles_plan.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

dotenv.config()

@Check(UtilService.buildStatusCheck(PlanAlimentarioEstado))
@Entity({
  name: 'planes_alimentarios',
  schema: process.env.DB_SCHEMA,
})
export class PlanAlimentario extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla planes alimentarios',
  })
  id: string

  @Column({
    length: 50,
    type: 'varchar',
    comment: 'Nombre del plan alimentario',
  })
  nombre: string

  @Column({
    type: 'text',
    comment: 'Descripción del plan alimentario',
    nullable: true,
  })
  descripcion: string

  @Column({
    type: 'timestamp without time zone',
    name: 'fecha_inicio',
    comment: 'Fecha de inicio del plan alimentario',
    nullable: true,
  })
  fechaInicio: string

  @Column({
    type: 'timestamp without time zone',
    name: 'fecha_fin',
    comment: 'Fecha de fin del plan alimentario',
    nullable: true,
  })
  fechaFin: string

  @OneToMany(() => DetallePlan, (detalle) => detalle.plan)
  detalles: DetallePlan[]

  @Column({
    name: 'id_medico',
    type: 'bigint',
    nullable: false,
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
    nullable: false,
    comment: 'Clave foránea que referencia al paciente',
  })
  idPaciente: string

  @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.citasPaciente, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  paciente: UsuarioRol

  constructor(data?: Partial<PlanAlimentario>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PlanAlimentarioEstado.ACTIVO
  }
}
