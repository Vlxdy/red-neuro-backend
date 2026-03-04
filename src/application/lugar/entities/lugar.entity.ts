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
import { LugarEstado, TipoLugar } from '../constants'
import { Cita } from '@/application/citas/entities/cita.entity'

@Check(UtilService.buildStatusCheck(LugarEstado))
@Entity({ name: 'lugar', schema: process.env.DB_SCHEMA })
export class Lugar extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla de lugares',
  })
  id: string

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
    nullable: false,
    comment: 'Nombre de la lugar',
  })
  nombre: string

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Sigla de la lugar',
  })
  sigla: string

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Dirección del lugar',
  })
  direccion: string

  @Column({
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: 'Tipo de lugar',
  })
  tipo: TipoLugar

  @OneToMany(() => Cita, (cita) => cita.lugar)
  citas: Cita[]

  constructor(data?: Partial<Lugar>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || LugarEstado.ACTIVO
  }
}
