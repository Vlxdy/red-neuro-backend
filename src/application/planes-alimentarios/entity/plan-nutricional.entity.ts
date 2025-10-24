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
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { PlanNutricionalEstado } from '../constant'
import { AlimentoPlanNutricional } from './alimento-plan-nutricional.entity'
import { TipoAlimento } from './alimento.entity'

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

  //DEPRECADO
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
    name: 'id_evaluacion_nutricional',
    type: 'bigint',
    nullable: true,
    comment:
      'Evaluación nutricional que se utilizó como referencia para el plan',
  })
  idEvaluacionNutricional?: string | null

  @Column({
    name: 'calorias_objetivo',
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: true,
    comment: 'Total de calorías objetivo calculadas para el plan',
  })
  caloriasObjetivo?: number | null

  @Column({
    name: 'distribucion_macronutrientes',
    type: 'jsonb',
    nullable: true,
    comment: 'Distribución de macronutrientes objetivo y obtenida en el plan',
  })
  distribucionMacronutrientes?: PlanNutricionalDistribucionMacronutrientes | null

  @Column({
    name: 'distribucion_calorica',
    type: 'jsonb',
    nullable: true,
    comment: 'Distribución calórica objetivo y resultante por tiempo de comida',
  })
  distribucionCalorica?: PlanNutricionalDistribucionCalorica | null

  @Column({
    name: 'es_generado_automatico',
    type: 'boolean',
    default: false,
    comment:
      'Indica si el plan fue generado automáticamente a partir de la evaluación',
  })
  esGeneradoAutomatico = false

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

  @OneToMany(() => AlimentoPlanNutricional, (apn) => apn.planNutricional)
  alimentosPlanNutricional: AlimentoPlanNutricional[]

  constructor(data?: Partial<PlanNutricional>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PlanNutricionalEstado.ACTIVO
  }
}

export interface PlanNutricionalMacroDetalle {
  gramos: number
  calorias: number
  porcentaje: number
}

export interface PlanNutricionalDistribucionMacronutrienteDetalle {
  carbohidratos: PlanNutricionalMacroDetalle
  proteinas: PlanNutricionalMacroDetalle
  grasas: PlanNutricionalMacroDetalle
}

export interface PlanNutricionalDistribucionMacronutrientes {
  objetivo: PlanNutricionalDistribucionMacronutrienteDetalle
  planGenerado: PlanNutricionalDistribucionMacronutrienteDetalle
}

export interface PlanNutricionalTiempoCalorico {
  tipo: TipoAlimento
  calorias: number
  porcentaje: number
}

export interface PlanNutricionalDistribucionCalorica {
  objetivo: PlanNutricionalTiempoCalorico[]
  planGenerado: PlanNutricionalTiempoCalorico[]
}
