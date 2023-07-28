import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Issuer } from 'openid-client'
import { CookieService } from '../../../common/lib/cookie.service'
import { BaseController } from '../../../common/base/base-controller'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { OidcAuthGuard } from '../guards/oidc-auth.guard'
import { AuthenticationService } from '../service/authentication.service'
import { RefreshTokensService } from '../service/refreshTokens.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { ConfigService } from '@nestjs/config'
import { CambioRolDto } from '../dto/index.dto'

@Controller()
export class AuthenticationController extends BaseController {
  constructor(
    private autenticacionService: AuthenticationService,
    private refreshTokensService: RefreshTokensService,
    @Inject(ConfigService) private configService: ConfigService
  ) {
    super()
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth')
  async login(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      throw new BadRequestException(
        `Es necesario que esté autenticado para consumir este recurso.`
      )
    }
    const result = await this.autenticacionService.autenticar(req.user)

    this.logger.info(`Usuario: ${result.data.id} ingresó al sistema`)
    /* sendRefreshToken(res, result.refresh_token.id); */
    const refreshToken = result.refresh_token.id
    return res
      .cookie(
        this.configService.get('REFRESH_TOKEN_NAME') || '',
        refreshToken,
        CookieService.makeConfig(this.configService)
      )
      .status(200)
      .send({ finalizado: true, mensaje: 'ok', datos: result.data })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cambiarRol')
  async changeRol(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CambioRolDto
  ) {
    if (!req.user) {
      throw new BadRequestException(
        `Es necesario que este autenticado para consumir este recurso.`
      )
    }
    const result = await this.autenticacionService.cambiarRol(req.user, body)

    const refreshToken = result.refresh_token.id
    return res
      .cookie(
        this.configService.get('REFRESH_TOKEN_NAME') || '',
        refreshToken,
        CookieService.makeConfig(this.configService)
      )
      .status(200)
      .send({ finalizado: true, mensaje: 'ok', datos: result.data })
  }

  @UseGuards(OidcAuthGuard)
  @Get('ciudadania-auth')
  async loginCiudadania() {
    //
  }

  @UseGuards(OidcAuthGuard)
  @Get('ciudadania-autorizar')
  async loginCiudadaniaCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return res.status(200).json({})
    }

    const result = await this.autenticacionService.autenticarOidc(req.user)

    const refreshToken = result.refresh_token.id

    return res
      .cookie(
        this.configService.get('REFRESH_TOKEN_NAME') || '',
        refreshToken,
        CookieService.makeConfig(this.configService)
      )
      .status(200)
      .json({
        access_token: result.data.access_token,
      })
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logoutCiudadania(@Req() req: Request, @Res() res: Response) {
    const jid = req.cookies.jid || ''
    if (jid) {
      await this.refreshTokensService.removeByid(jid)
    }

    const idToken =
      req.user?.idToken || req.session?.passport?.user?.idToken || null

    // req.logout();
    req.session.destroy(() => {
      this.logger.info('sesión finalizada')
    })
    const issuer = await Issuer.discover(
      this.configService.get('OIDC_ISSUER') || ''
    )
    const url = issuer.metadata.end_session_endpoint
    res.clearCookie('connect.sid')
    res.clearCookie('jid', jid)
    const idUsuario = req.headers.authorization
      ? JSON.parse(
          Buffer.from(
            `${req.headers.authorization}`.split('.')[1],
            'base64'
          ).toString()
        ).id
      : null

    this.logger.info(`Usuario: ${idUsuario} salió del sistema`)

    if (!(url && idToken)) {
      return res.status(200).json()
    }

    return res.status(200).json({
      url: `${url}?post_logout_redirect_uri=${this.configService.get(
        'OIDC_POST_LOGOUT_REDIRECT_URI'
      )}&id_token_hint=${idToken}`,
    })
  }
}
