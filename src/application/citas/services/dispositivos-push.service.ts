import { Injectable } from '@nestjs/common'
import {
  DispositivoPush,
  DispositivoPushEstado,
} from '../entities/dispositivo-push.entity'
import { RegistrarDispositivoPushDto } from '../dto/dispositivo-push.dto'
import { DispositivosPushRepository } from '../repository/dispositivos-push.repository'

@Injectable()
export class DispositivosPushService {
  constructor(
    private readonly dispositivosPushRepository: DispositivosPushRepository
  ) {}

  async registrar(
    dto: RegistrarDispositivoPushDto,
    idUsuario: string,
    usuarioAuditoria: string
  ): Promise<DispositivoPush> {
    let dispositivo = await this.dispositivosPushRepository.buscarPorToken(
      dto.token
    )

    if (!dispositivo) {
      dispositivo = this.dispositivosPushRepository.crear({
        ...dto,
        idUsuario,
        estado: DispositivoPushEstado.ACTIVE,
        usuarioCreacion: usuarioAuditoria,
      })
    } else {
      dispositivo.idUsuario = idUsuario
      dispositivo.plataforma = dto.plataforma
      dispositivo.versionApp = dto.versionApp
      dispositivo.estado = DispositivoPushEstado.ACTIVE
      dispositivo.usuarioModificacion = usuarioAuditoria
    }

    dispositivo.ultimaConexion = new Date()
    return await this.dispositivosPushRepository.guardar(dispositivo)
  }

  async eliminar(
    token: string,
    idUsuario: string,
    usuarioAuditoria: string
  ): Promise<boolean> {
    const dispositivo =
      await this.dispositivosPushRepository.buscarPorTokenYUsuario(
        token,
        idUsuario
      )

    if (!dispositivo) {
      return false
    }

    dispositivo.estado = DispositivoPushEstado.INACTIVE
    dispositivo.usuarioModificacion = usuarioAuditoria
    await this.dispositivosPushRepository.guardar(dispositivo)
    return true
  }
}
