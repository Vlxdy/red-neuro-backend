import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import 'bootstrap/env'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Cita } from './cita.entity'
import {
  CitaPagoEstado,
  CitaPagoMetodo,
  CitaPagoSituacion,
  CitaPagoTipo,
} from '../constants'
import { CajaSesion } from './caja-sesion.entity'

@Check(UtilService.buildStatusCheck(CitaPagoEstado))
@Check(UtilService.buildCheck('metodo_pago', CitaPagoMetodo))
@Check(UtilService.buildCheck('tipo_movimiento', CitaPagoTipo))
@Check(UtilService.buildCheck('estado_pago', CitaPagoSituacion))
@Entity({ name: 'cita_pago', schema: process.env.DB_SCHEMA })
export class CitaPago extends AuditoriaEntity<CitaPagoEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de pago de cita',
  })
  id: string

  @Column({
    name: 'id_cita',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea a la cita relacionada',
  })
  idCita: string

  @ManyToOne(() => Cita, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cita', referencedColumnName: 'id' })
  cita: Cita

  @Column({
    name: 'monto',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Monto del movimiento de pago',
  })
  monto: number

  @Column({
    name: 'fecha_pago',
    type: 'timestamp without time zone',
    nullable: true,
    comment: 'Fecha y hora del pago',
  })
  fechaPago?: Date | null

  @Column({
    name: 'metodo_pago',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Método de pago utilizado',
  })
  metodoPago?: CitaPagoMetodo | null

  @Column({
    name: 'estado_pago',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: 'Estado operativo del pago',
  })
  estadoPago: CitaPagoSituacion

  @Column({
    name: 'tipo_movimiento',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: 'Tipo de movimiento del pago',
  })
  tipoMovimiento: CitaPagoTipo

  @Column({
    name: 'observacion',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Observación opcional del movimiento de pago',
  })
  observacion?: string | null

  @Column({
    name: 'id_usuario_registro',
    type: 'bigint',
    nullable: false,
    comment: 'Usuario que registró el pago',
  })
  idUsuarioRegistro: string

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_usuario_registro', referencedColumnName: 'id' })
  usuarioRegistro: Usuario

  @Column({
    name: 'id_usuario_anulacion',
    type: 'bigint',
    nullable: true,
    comment: 'Usuario que anuló el pago',
  })
  idUsuarioAnulacion?: string | null

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario_anulacion', referencedColumnName: 'id' })
  usuarioAnulacion?: Usuario | null

  @Column({
    name: 'id_caja_sesion',
    type: 'bigint',
    nullable: true,
    comment: 'Caja a la que pertenece el pago',
  })
  idCajaSesion?: string | null

  @ManyToOne(() => CajaSesion, (caja) => caja.pagos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_caja_sesion', referencedColumnName: 'id' })
  cajaSesion?: CajaSesion | null

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CitaPagoEstado.REGISTRADO
    this.estadoPago = this.estadoPago || CitaPagoSituacion.PENDIENTE
  }

  constructor(data?: Partial<CitaPago>) {
    super(data)
  }
}
