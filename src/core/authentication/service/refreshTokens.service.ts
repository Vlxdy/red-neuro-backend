import { RefreshTokens } from '../entity/refreshTokens.entity'
import { RefreshTokenResponse, TokenDto } from '../dto/index.dto'
import { BaseService } from '@/common/base'
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import dayjs from 'dayjs'
import { ConfigService } from '@nestjs/config'
import { DeleteResult } from 'typeorm'

import { RefreshTokensRepository } from '../repository/refreshTokens.repository'

import { Cron } from '@nestjs/schedule'
import { Messages } from '@/common/constants/response-messages'
import { TextService } from '@/common/lib/text.service'
import { UsuarioService } from '@/core/usuario/service/usuario.service'

@Injectable()
export class RefreshTokensService extends BaseService {
  constructor(
    @Inject(RefreshTokensRepository)
    private refreshTokensRepository: RefreshTokensRepository,
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    super()
  }

  create(grantId: string): Promise<RefreshTokens> {
    const ttl = parseInt(
      this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '3600000',
      10
    )
    const currentDate = new Date()
    return this.refreshTokensRepository.crear({
      id: TextService.generateNanoId(),
      grantId,
      iat: currentDate,
      expiresAt: new Date(currentDate.getTime() + ttl),
      isRevoked: false,
      data: {},
    })
  }

  async createAccessToken(
    refreshTokenId: string,
    datos: TokenDto
  ): Promise<RefreshTokenResponse> {
    const refreshToken =
      await this.refreshTokensRepository.findById(refreshTokenId)

    if (!refreshToken) {
      throw new NotFoundException(Messages.EXCEPTION_REFRESH_TOKEN_NOT_FOUND)
    }

    if (!dayjs().isBefore(dayjs(refreshToken.expiresAt))) {
      throw new UnauthorizedException(Messages.EXCEPTION_REFRESH_TOKEN_EXPIRED)
    }

    // usuario
    const usuario = await this.usuarioService.buscarUsuarioId(
      refreshToken.grantId
    )

    const roles = usuario.roles.map((rol) => rol.rol)
    try {
      this.jwtService.verify(datos.token, {
        secret: this.configService.get('JWT_SECRET'),
      })
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        this.logger.error(err)
        // handle expired token
        throw new UnauthorizedException(Messages.EXCEPTION_UNAUTHORIZED)
      }
    }

    const decode = this.jwtService.decode(datos.token)

    if (!decode) {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }

    const rol = this.usuarioService.obtenerRolActual(
      usuario.roles,
      decode['idRol']
    )

    const payload: PayloadType = {
      id: usuario.id,
      roles,
      idRol: rol.idRol,
      rol: rol.rol,
      idUsuarioRol: rol.idUsuarioRol,
      esSupervisor: rol.esSupervisor,
    }
    const data = {
      access_token: this.jwtService.sign(payload),
      ...usuario,
      idRol: rol.idRol,
      rol: rol.rol,
      esSupervisor: rol.esSupervisor,
    }

    const rft = parseInt(
      this.configService.get('REFRESH_TOKEN_ROTATE_IN') || '0',
      10
    )

    // crear rotación de refresh token
    const sigueVigente = dayjs(refreshToken.expiresAt).diff(dayjs()) < rft

    if (!sigueVigente) {
      return {
        data,
        refresh_token: null,
      }
    }

    const newRefreshToken = await this.create(refreshToken.grantId)
    return {
      data,
      refresh_token: { id: newRefreshToken.id },
    }
  }

  async removeByid(id: string): Promise<DeleteResult | Record<string, never>> {
    const refreshToken = await this.refreshTokensRepository.findById(id)
    if (!refreshToken) {
      return {}
    }
    return this.refreshTokensRepository.eliminar(refreshToken.id)
  }

  @Cron(process.env.REFRESH_TOKEN_REVISIONS || '0')
  eliminarCaducos(): Promise<DeleteResult> {
    return this.refreshTokensRepository.eliminarTokensCaducos()
  }
}
