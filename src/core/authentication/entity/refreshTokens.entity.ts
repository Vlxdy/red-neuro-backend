import { Column, Entity, PrimaryColumn } from 'typeorm'
import 'bootstrap/env'

@Entity({ schema: process.env.DB_SCHEMA_USUARIOS })
export class RefreshTokens {
  @PrimaryColumn({
    comment: 'Clave primaria de la tabla RefreshToken',
  })
  id: string

  @Column({
    name: 'grant_id',
    comment: 'Id de usuario al que se le asignó el token generado',
  })
  grantId: string

  @Column({
    type: 'timestamp without time zone',
    comment: 'Fecha de creación de token',
  })
  iat: Date

  @Column({
    name: 'expires_at',
    type: 'timestamp without time zone',
    comment: 'Fecha expiración de token',
  })
  expiresAt: Date

  @Column({
    name: 'is_revoked',
    type: 'boolean',
    comment: 'Estado de token, valor booleano para revocar el token generado',
  })
  isRevoked: boolean

  @Column({ type: 'jsonb', comment: 'Información del token' })
  data: unknown
}
