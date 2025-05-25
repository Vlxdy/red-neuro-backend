import { Asignacion } from '@/application/gestion-pacientes/entities/asignados.entity'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import dotenv from 'dotenv'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { PlanNutricionalEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(PlanNutricionalEstado))
@Entity({
  name: 'planes-nutricionales',
  schema: process.env.DB_SCHEMA_PLAN_NUTRICIONAL,
})
export class PlanNutricional extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla plan nutricional',
  })
  id: string

  @Column({
    length: 50,
    type: 'varchar',
    comment: 'Fecha del plan alimentario',
  })
  fecha: string

  @Column({
    type: 'jsonb',
    nullable: true,
    comment:
      'Plan alimentario en formato JSON (ej. array de IDs de alimentos o estructura compleja)',
  })
  plan: string[]

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Recomendaciones adicionales del plan alimentario',
  })
  recomendaciones: string

  @Column({
    name: 'id_paciente',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia la tabla asignacion (paciente)',
  })
  idPaciente: string

  @ManyToOne(() => Asignacion, (asignacion) => asignacion.planesNutricionales)
  @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  paciente: Asignacion

  constructor(data?: Partial<PlanNutricional>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PlanNutricionalEstado.ACTIVO
  }
}
