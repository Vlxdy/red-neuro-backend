import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import 'bootstrap/env'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { ConsultorioEstado } from '../constants'
import { Cita } from '@/application/citas/entities/cita.entity'

@Check(UtilService.buildStatusCheck(ConsultorioEstado))
@Entity({ name: 'consultorio', schema: process.env.DB_SCHEMA })
export class Consultorio extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de consultorio de citas',
  })
  id: string

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
    nullable: false,
    comment: 'Nombre consultorio',
  })
  nombre: string

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Descripción opcional del consultorio',
  })
  descripcion?: string

  @Column({
    name: 'color_hex',
    type: 'varchar',
    length: 7,
    nullable: false,
    comment: 'Color principal del ambiente en formato hexadecimal (#RRGGBB)',
  })
  colorHex: string

  @OneToMany(() => Cita, (cita) => cita.consultorio)
  citas: Cita[]

  constructor(data?: Partial<Consultorio>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || ConsultorioEstado.ACTIVO
  }
}
