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
import { AgrupadorEstado } from '../constants'
import { Cita } from './cita.entity'

@Check(UtilService.buildStatusCheck(AgrupadorEstado))
@Entity({ name: 'citas_agrupadores', schema: process.env.DB_SCHEMA })
export class Agrupador extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de agrupadores de citas',
  })
  id: string

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
    nullable: false,
    comment: 'Nombre legible del agrupador',
  })
  nombre: string

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Descripción opcional del agrupador',
  })
  descripcion?: string | null

  @Column({
    name: 'color_hex',
    type: 'varchar',
    length: 7,
    nullable: false,
    comment: 'Color principal del ambiente en formato hexadecimal (#RRGGBB)',
  })
  colorHex: string

  @OneToMany(() => Cita, (cita) => cita.agrupador)
  citas: Cita[]

  constructor(data?: Partial<Agrupador>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || AgrupadorEstado.ACTIVO
  }
}
