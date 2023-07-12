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
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Módulo',
  })
  id: string

  @Column({
    length: 50,
    type: 'varchar',
    comment: 'Etiqueta del módulo para el Sidebar del proyecto',
  })
  label: string

  @Column({
    length: 50,
    type: 'varchar',
    unique: true,
    comment: 'Ruta para acceder al módulo',
  })
  url: string

  @Column({ length: 50, type: 'varchar', comment: 'Nombre del módulo' })
  nombre: string

  @Column({
    type: 'jsonb',
    comment: 'Propiedades definidas del módulo, como orden, icono, etc.',
  })
  propiedades: Propiedades

  @Column({
    name: 'id_modulo',
    type: 'bigint',
    nullable: true,
    comment: 'Clave foránea que índica que pertenece a otro módulo',
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
