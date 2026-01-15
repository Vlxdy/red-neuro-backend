import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Cita } from './cita.entity'
import { CitasEstado, CitasHistorialEstado } from '../constants'
import 'bootstrap/env'

@Check(UtilService.buildStatusCheck(CitasHistorialEstado))
@Entity({ name: 'historial_citas', schema: process.env.DB_SCHEMA })
export class HistorialCita extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Cita Historico',
  })
  id: string

  @Column({
    name: 'id_cita',
    type: 'bigint',
    nullable: false,
    comment: 'Clave foránea que referencia a la cita',
  })
  idCita: string

  @ManyToOne(() => Cita, (cita) => cita.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cita', referencedColumnName: 'id' })
  cita: Cita

  @Column({
    name: 'estado_anterior',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: 'Estado de la cita antes de ejecutar la transición registrada',
  })
  estadoAnterior?: CitasEstado

  @Column({
    name: 'rol_ejecutor',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: 'Rol del usuario que ejecutó la acción registrada en el historial',
  })
  rolEjecutor: string

  @Column({
    name: 'id_ejecutor',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del usuario que ejecutó la acción',
  })
  idEjecutor: string

  @Column({
    name: 'comentario',
    type: 'text',
    nullable: true,
    comment: 'Comentario asociado a la transición de estado',
  })
  comentario?: string | null

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CitasHistorialEstado.ACTIVO
  }

  constructor(data?: Partial<HistorialCita>) {
    super(data)
  }
}
