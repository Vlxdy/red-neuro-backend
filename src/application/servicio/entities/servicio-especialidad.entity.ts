import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import 'bootstrap/env'
import { Servicio } from './servicio.entity'
import { Ocupacion } from '@/application/personal/entities/especialidad.entity'
import { ServicioEstado } from '../constants'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'

@Entity({ name: 'servicio_ocupacion', schema: process.env.DB_SCHEMA })
export class ServicioOcupacion extends AuditoriaEntity<ServicioEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla intermedia servicio_especialidad',
  })
  id: string

  @Column({
    name: 'id_servicio',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al servicio',
  })
  servicioId: string

  @Column({
    name: 'id_ocupacion',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la especialidad',
  })
  ocupacionId: string

  // Compatibilidad temporal
  get estudioId() {
    return this.servicioId
  }

  set estudioId(value: string) {
    this.servicioId = value
  }

  get estudio() {
    return this.servicio
  }

  set estudio(value: Servicio) {
    this.servicio = value
  }

  @ManyToOne(() => Servicio, (servicio) => servicio.servicioOcupaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_servicio', referencedColumnName: 'id' })
  servicio: Servicio

  @ManyToOne(() => Ocupacion, (ocupacion) => ocupacion.servicioOcupaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_ocupacion', referencedColumnName: 'id' })
  ocupacion: Ocupacion

  get especialidadId() {
    return this.ocupacionId
  }

  set especialidadId(value: string) {
    this.ocupacionId = value
  }

  get especialidad() {
    return this.ocupacion
  }

  set especialidad(value: Ocupacion) {
    this.ocupacion = value
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || ServicioEstado.ACTIVO
  }
}

// Alias temporal para compatibilidad
export { ServicioOcupacion as EstudioEspecialidad }

export { ServicioOcupacion as ServicioEspecialidad }
