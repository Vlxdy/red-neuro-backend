import { Asignacion } from '@/application/gestion-pacientes/entities/asignados.entity'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import dotenv from 'dotenv'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { CarritoComprasEstado, PlanNutricionalEstado } from '../constant'

interface ProductoCarrito {
  id: string
  nombre: string
  comprado: boolean
}

dotenv.config()

@Check(UtilService.buildStatusCheck(PlanNutricionalEstado))
@Entity({
  name: 'carrito_compras',
  schema: process.env.DB_SCHEMA_PLAN_NUTRICIONAL,
})
export class CarritoCompra extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria',
  })
  id: string

  @Column({
    length: 255,
    type: 'varchar',
    comment: 'Nombre del carrito',
  })
  nombre: string

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Productos en formato JSON ',
  })
  productos: ProductoCarrito[]

  @Column({
    name: 'id_paciente',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia la tabla asignacion (paciente)',
  })
  idPaciente: string

  @ManyToOne(() => Asignacion, (asignacion) => asignacion.carritosCompras)
  @JoinColumn({ name: 'id_paciente', referencedColumnName: 'id' })
  paciente: Asignacion

  constructor(data?: Partial<CarritoCompra>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CarritoComprasEstado.ACTIVO
  }
}
