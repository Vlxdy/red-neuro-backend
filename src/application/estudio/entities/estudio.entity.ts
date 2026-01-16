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
import { EstudioEstado } from '../constants'
import { Cita } from '@/application/citas/entities/cita.entity'
import { EstudioEspecialidad } from './estudio-especialidad.entity'

@Check(UtilService.buildStatusCheck(EstudioEstado))
@Entity({ name: 'estudio', schema: process.env.DB_SCHEMA })
export class Estudio extends AuditoriaEntity<EstudioEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla estudio',
  })
  id: string

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Nombre del estudio',
  })
  nombre: string

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Descripción del estudio',
  })
  descripcion: string

  @Column({
    name: 'duracion_minutos',
    type: 'int',
    nullable: false,
    comment: 'Duración del estudio en minutos',
  })
  duracionMinutos: number

  @OneToMany(() => Cita, (cita) => cita.estudio)
  citas: Cita[]

  @OneToMany(
    () => EstudioEspecialidad,
    (estudioEspecialidad) => estudioEspecialidad.estudio
  )
  estudioEspecialidades: EstudioEspecialidad[]

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || EstudioEstado.ACTIVO
  }

  constructor(data?: Partial<Estudio>) {
    super(data)
  }
}
