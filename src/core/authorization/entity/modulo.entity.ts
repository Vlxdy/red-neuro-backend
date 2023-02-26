import { UtilService } from '../../../common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Status } from '../../../common/constants'

dotenv.config()

export type Propiedades = {
  icono?: string
  descripcion?: string
  orden: number
}

export const ModuloEstado = {
  ACTIVE: Status.ACTIVE,
  INACTIVE: Status.INACTIVE,
}

@Check(UtilService.buildStatusCheck(ModuloEstado))
@Entity({ name: 'modulos', schema: process.env.DB_SCHEMA_USUARIOS })
export class Modulo extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string

  @Column({ length: 50, type: 'varchar' })
  label: string

  @Column({ length: 50, type: 'varchar', unique: true })
  url: string

  @Column({ length: 50, type: 'varchar' })
  nombre: string

  @Column({ type: 'jsonb' })
  propiedades: Propiedades

  @Column({
    name: 'id_modulo',
    type: 'bigint',
    nullable: true,
  })
  idModulo?: string | null

  @OneToMany(() => Modulo, (modulo) => modulo.modulo)
  subModulo: Modulo[]

  @ManyToOne(() => Modulo, (modulo) => modulo.subModulo)
  @JoinColumn({ name: 'id_modulo', referencedColumnName: 'id' })
  modulo: Modulo

  constructor(data?: Partial<Modulo>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || ModuloEstado.ACTIVE
  }
}
