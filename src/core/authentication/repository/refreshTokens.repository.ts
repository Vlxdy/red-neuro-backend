import { DataSource } from 'typeorm'
import { RefreshTokens } from '../entity/refreshTokens.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RefreshTokensRepository {
  constructor(private dataSource: DataSource) {}

  async findById(id: string) {
    return await this.dataSource
      .getRepository(RefreshTokens)
      .createQueryBuilder('refreshTokens')
      .where('refreshTokens.id = :id', { id })
      .getOne()
  }

  async crear(refreshToken: Partial<RefreshTokens>) {
    return await this.dataSource.getRepository(RefreshTokens).save(refreshToken)
  }

  async eliminar(id: string) {
    return await this.dataSource.getRepository(RefreshTokens).delete(id)
  }

  async eliminarTokensCaducos() {
    const now: Date = new Date()
    return await this.dataSource
      .getRepository(RefreshTokens)
      .createQueryBuilder('RefreshTokens')
      .delete()
      .from(RefreshTokens)
      .where('expires_at < :now', { now })
      .execute()
  }
}
