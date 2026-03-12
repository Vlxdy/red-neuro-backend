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
import { ServicioEstado } from '../constants'
import { ServicioCategoria } from './servicio-categoria.entity'

@Check(UtilService.buildStatusCheck(ServicioEstado))
@Entity({ name: 'categorias', schema: process.env.DB_SCHEMA })
export class Categoria extends AuditoriaEntity<ServicioEstado> {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string

  @Column({ type: 'varchar', length: 120, unique: true, nullable: false })
  nombre: string

  @Column({ type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'color_hex', type: 'varchar', length: 7, nullable: true })
  colorHex?: string

  @OneToMany(
    () => ServicioCategoria,
    (servicioCategoria) => servicioCategoria.categoria
  )
  servicioCategorias: ServicioCategoria[]

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || ServicioEstado.ACTIVO
  }
}
