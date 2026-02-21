import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import 'bootstrap/env'
import { ServicioEstado } from '../constants'
import { Cita } from '@/application/citas/entities/cita.entity'
import { TipoCita } from '@/application/citas/constants'
import { ServicioEspecialidad } from './estudio-especialidad.entity'

@Check(UtilService.buildStatusCheck(ServicioEstado))
@Check(UtilService.buildCheck('tipo', TipoCita))
@Entity({ name: 'servicio', schema: process.env.DB_SCHEMA })
export class Servicio extends AuditoriaEntity<ServicioEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla servicio',
  })
  id: string

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Nombre del servicio',
  })
  nombre: string

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Descripción del servicio',
  })
  descripcion: string

  @Column({
    name: 'tipo',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: 'Tipo de servicio: CONSULTA o ESTUDIO',
  })
  tipo: TipoCita

  @Column({
    name: 'duracion_minutos',
    type: 'int',
    nullable: false,
    comment: 'Duración del servicio en minutos',
  })
  duracionMinutos: number

  @Column({
    name: 'costo',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
    comment: 'Costo referencial del servicio',
  })
  costo: number

  @OneToMany(() => Cita, (cita) => cita.servicio)
  citas: Cita[]

  @OneToMany(
    () => ServicioEspecialidad,
    (servicioEspecialidad) => servicioEspecialidad.servicio
  )
  servicioEspecialidades: ServicioEspecialidad[]

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || ServicioEstado.ACTIVO
  }

  constructor(data?: Partial<Servicio>) {
    super(data)
  }
}

// Alias temporal para compatibilidad
export { Servicio as Estudio }
