import { UtilService } from '../../../common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { ParametroEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(ParametroEstado))
@Entity({ name: 'parametros', schema: process.env.DB_SCHEMA_PARAMETRICAS })
export class Parametro extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Parámetro',
  })
  id: string

  @Column({
    length: 15,
    type: 'varchar',
    unique: true,
    comment: 'Código de parámetro',
  })
  codigo: string

  @Column({ length: 50, type: 'varchar', comment: 'Nombre de parámetro' })
  nombre: string

  @Column({ length: 15, type: 'varchar', comment: 'Grupo de parámetro' })
  grupo: string

  @Column({ length: 255, type: 'varchar', comment: 'Descripción de parámetro' })
  descripcion: string

  constructor(data?: Partial<Parametro>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || ParametroEstado.ACTIVO
  }
}
