import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import 'bootstrap/env'
import { Estudio } from './estudio.entity'
import { Especialidad } from '@/application/personal/entities/especialidad.entity'

@Entity({ name: 'estudio_especialidad', schema: process.env.DB_SCHEMA })
export class EstudioEspecialidad {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla intermedia estudio_especialidad',
  })
  id: string

  @Column({
    name: 'id_estudio',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia al estudio',
  })
  estudioId: string

  @Column({
    name: 'id_especialidad',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la especialidad',
  })
  especialidadId: string

  @ManyToOne(() => Estudio, (estudio) => estudio.estudioEspecialidades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_estudio', referencedColumnName: 'id' })
  estudio: Estudio

  @ManyToOne(
    () => Especialidad,
    (especialidad) => especialidad.estudioEspecialidades,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'id_especialidad', referencedColumnName: 'id' })
  especialidad: Especialidad
}
