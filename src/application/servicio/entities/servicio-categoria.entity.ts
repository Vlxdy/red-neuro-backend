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
import { ServicioEstado } from '../constants'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Categoria } from './categoria.entity'

@Entity({ name: 'servicio_categoria', schema: process.env.DB_SCHEMA })
export class ServicioCategoria extends AuditoriaEntity<ServicioEstado> {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string

  @Column({ name: 'id_servicio', type: 'bigint', nullable: false })
  servicioId: string

  @Column({ name: 'id_categoria', type: 'bigint', nullable: false })
  categoriaId: string

  @ManyToOne(() => Servicio, (servicio) => servicio.servicioCategorias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_servicio', referencedColumnName: 'id' })
  servicio: Servicio

  @ManyToOne(() => Categoria, (categoria) => categoria.servicioCategorias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_categoria', referencedColumnName: 'id' })
  categoria: Categoria

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || ServicioEstado.ACTIVO
  }
}
