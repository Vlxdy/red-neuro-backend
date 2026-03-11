import { Injectable } from '@nestjs/common'
import { DataSource, In } from 'typeorm'
import { DispositivoPush } from '../entities/dispositivo-push.entity'

@Injectable()
export class DispositivosPushRepository {
  constructor(private readonly dataSource: DataSource) {}

  private repo() {
    return this.dataSource.getRepository(DispositivoPush)
  }

  async buscarPorToken(token: string): Promise<DispositivoPush | null> {
    return await this.repo().findOne({ where: { token } })
  }

  async buscarPorTokenYUsuario(
    token: string,
    idUsuarioRol: string
  ): Promise<DispositivoPush | null> {
    return await this.repo().findOne({ where: { token, idUsuarioRol } })
  }

  crear(data: Partial<DispositivoPush>) {
    return this.repo().create(data)
  }

  async guardar(dispositivo: DispositivoPush): Promise<DispositivoPush> {
    return await this.repo().save(dispositivo)
  }

  async listarTokensActivosPorUsuarios(
    idUsuariosRol: string[]
  ): Promise<string[]> {
    if (!idUsuariosRol.length) return []

    const dispositivos = await this.repo().find({
      where: {
        idUsuarioRol: In(idUsuariosRol),
        estado: 'ACTIVO' as never,
      },
    })

    return dispositivos.map((d) => d.token)
  }
}
