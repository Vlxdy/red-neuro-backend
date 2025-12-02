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
import { CookieService } from '@/common/lib/cookie.service'
import { BaseController } from '@/common/base'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { AuthenticationService } from '../service/authentication.service'
import { RefreshTokensService } from '../service/refreshTokens.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { ConfigService } from '@nestjs/config'
import {
  AccessTokenDto,
  AuthDto,
  AuthResponseDto,
  CambioRolDto,
  EmptyDto,
} from '../dto/index.dto'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiBaseResponse } from '@/common/decorators/api-base-responde.decorator'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'

@Controller()
@ApiTags('Autenticación')
export class AuthenticationController extends BaseController {
  constructor(
    private autenticacionService: AuthenticationService,
    private refreshTokensService: RefreshTokensService,
    @Inject(ConfigService) private configService: ConfigService
  ) {
    super()
  }

  @ApiOperation({ summary: 'API para autenticación con usuario y contraseña' })
  @ApiBody({ description: 'Autenticación de usuarios', type: AuthDto })
  @ApiBaseResponse(AuthResponseDto)
  @UseGuards(LocalAuthGuard)
  @Post('auth')
  async login(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<BaseResponseDto<AuthResponseDto>>> {
    if (!req.user) {
      throw new BadRequestException(
        `Es necesario que esté autenticado para consumir este recurso.`
      )
    }
    const result = await this.autenticacionService.autenticar(req.user)

    /* sendRefreshToken(res, result.refresh_token.id); */
    const refreshToken = result.refresh_token.id
    return res
      .cookie(
        this.configService.get('REFRESH_TOKEN_NAME') || '',
        refreshToken,
        CookieService.makeConfig(this.configService)
      )
      .status(200)
      .send(this.success<AuthResponseDto>(result.data))
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('cambiarRol')
  async changeRol(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CambioRolDto
  ): Promise<Response<BaseResponseDto<AuthResponseDto>>> {
    if (!req.user) {
      throw new BadRequestException(
        `Es necesario que esté autenticado para consumir este recurso.`
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
      .send(this.success<AuthResponseDto>(result.data))
  }

  @ApiOperation({ summary: 'API para autenticación con ciudadania digital' })
  @Get('ciudadania-auth')
  @ApiBaseResponse(EmptyDto)
  loginCiudadania(): BaseResponseDto<EmptyDto> {
    return this.success({} as EmptyDto)
  }

  @ApiOperation({ summary: 'API para autorización con Ciudadanía Digital' })
  @Get('ciudadania-autorizar')
  @ApiBaseResponse(AccessTokenDto)
  async loginCiudadaniaCallback(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<BaseResponseDto<AccessTokenDto>>> {
    if (!req.user) {
      return res.status(200).json(this.success<EmptyDto>({} as EmptyDto))
    }

    const user = req.user
    if (user.error) {
      return await this.logoutCiudadania(req, res)
    }

    try {
      const result = await this.autenticacionService.autenticarOidc(req.user)

      const refreshToken = result.refresh_token.id

      return res
        .cookie(
          this.configService.get('REFRESH_TOKEN_NAME') || '',
          refreshToken,
          CookieService.makeConfig(this.configService)
        )
        .status(200)
        .json(
          this.success<AccessTokenDto>({
            access_token: result.data.access_token,
          })
        )
    } catch (error) {
      this.logger.error('[ciudadania-autorizar] Error en autenticación ', error)
      return await this.logoutCiudadania(req, res)
    }
  }

  @ApiOperation({ summary: 'API para logout digital' })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiBaseResponse(EmptyDto)
  async salirCiudadania(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<BaseResponseDto<EmptyDto>>> {
    return await this.logoutCiudadania(req, res)
  }

  async logoutCiudadania(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response<BaseResponseDto<EmptyDto>>> {
    const jid = req.cookies.jid || ''
    if (jid) {
      await this.refreshTokensService.removeByid(jid)
    }

    const idToken =
      req.user?.idToken || req.session?.passport?.user?.idToken || null

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

    this.logger.audit('authentication', {
      mensaje: 'Salió del sistema',
      metadata: { usuario: idUsuario },
    })

    // Ciudadanía v2
    if (!idToken) {
      return res.status(200).json(this.success<EmptyDto>({} as EmptyDto))
    }

    return res.status(200).json(this.success<EmptyDto>({} as EmptyDto))
  }
}
