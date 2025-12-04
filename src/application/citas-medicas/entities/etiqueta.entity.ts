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
import { EtiquetaEstado } from '../constants'
import { CitaEtiqueta } from './cita-etiqueta.entity'

@Check(UtilService.buildStatusCheck(EtiquetaEstado))
@Entity({ name: 'citas_etiquetas', schema: process.env.DB_SCHEMA })
export class Etiqueta extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de etiquetas de citas',
  })
  id: string

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
    nullable: false,
    comment: 'Nombre único de la etiqueta',
  })
  nombre: string

  @Column({
    type: 'varchar',
    length: 7,
    nullable: false,
    comment: 'Color en formato hexadecimal (#RRGGBB)',
  })
  colorHex: string

  @OneToMany(() => CitaEtiqueta, (citaEtiqueta) => citaEtiqueta.etiqueta)
  citaEtiquetas: CitaEtiqueta[]

  constructor(data?: Partial<Etiqueta>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || EtiquetaEstado.ACTIVO
  }
}
