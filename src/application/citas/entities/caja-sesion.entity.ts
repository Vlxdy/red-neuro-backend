import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import 'bootstrap/env'
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { CajaSesionEstado } from '../constants'
import { CitaPago } from './cita-pago.entity'

@Entity({ name: 'caja_sesion', schema: process.env.DB_SCHEMA })
export class CajaSesion extends AuditoriaEntity<CajaSesionEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de sesión de caja',
  })
  id: string

  @Column({
    name: 'fecha_apertura',
    type: 'timestamp without time zone',
    nullable: false,
  })
  fechaApertura: Date

  @Column({
    name: 'fecha_cierre',
    type: 'timestamp without time zone',
    nullable: true,
  })
  fechaCierre?: Date | null

  @Column({
    name: 'monto_apertura',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  montoApertura?: number | null

  @Column({
    name: 'monto_cierre_declarado',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  montoCierreDeclarado?: number | null

  @Column({
    name: 'id_usuario_apertura',
    type: 'bigint',
    nullable: false,
  })
  idUsuarioApertura: string

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_usuario_apertura', referencedColumnName: 'id' })
  usuarioApertura: Usuario

  @Column({
    name: 'id_usuario_cierre',
    type: 'bigint',
    nullable: true,
  })
  idUsuarioCierre?: string | null

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario_cierre', referencedColumnName: 'id' })
  usuarioCierre?: Usuario | null

  @OneToMany(() => CitaPago, (pago) => pago.cajaSesion)
  pagos: CitaPago[]

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CajaSesionEstado.ABIERTA
  }

  constructor(data?: Partial<CajaSesion>) {
    super(data)
  }
}
