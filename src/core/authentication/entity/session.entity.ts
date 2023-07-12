import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from 'typeorm'
import dotenv from 'dotenv'
import { ISession } from 'connect-typeorm'

dotenv.config()

@Entity()
export class Session implements ISession {
  @Index()
  @Column('bigint', { comment: 'Fecha de expiración de sesión' })
  public expiredAt = Date.now()

  @PrimaryColumn('varchar', {
    length: 255,
    comment: 'Id de la sesión',
  })
  public id = ''

  @Column('text', {
    comment: 'Información de la sesión en formato json',
  })
  public json = ''

  @DeleteDateColumn({ comment: 'Fecha de eliminación o cierre de sesión' })
  public destroyedAt?: Date
}
