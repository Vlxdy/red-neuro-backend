import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import 'bootstrap/env'
import { Servicio } from './estudio.entity'
import { Especialidad } from '@/application/personal/entities/especialidad.entity'

@Entity({ name: 'servicio_especialidad', schema: process.env.DB_SCHEMA })
export class ServicioEspecialidad {
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
    name: 'id_especialidad',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la especialidad',
  })
  especialidadId: string

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

  @ManyToOne(() => Servicio, (servicio) => servicio.servicioEspecialidades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_servicio', referencedColumnName: 'id' })
  servicio: Servicio

  @ManyToOne(
    () => Especialidad,
    (especialidad) => especialidad.servicioEspecialidades,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'id_especialidad', referencedColumnName: 'id' })
  especialidad: Especialidad
}

// Alias temporal para compatibilidad
export { ServicioEspecialidad as EstudioEspecialidad }
