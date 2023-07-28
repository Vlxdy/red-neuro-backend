import { TokenDto } from './../dto/index.dto'
import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { CookieService } from '../../../common/lib/cookie.service'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { OidcAuthGuard } from '../guards/oidc-auth.guard'
import { RefreshTokensService } from '../service/refreshTokens.service'
import { BaseController } from '../../../common/base/base-controller'

@Controller()
export class RefreshTokensController extends BaseController {
  constructor(
    private refreshTokensService: RefreshTokensService,
    @Inject(ConfigService) private configService: ConfigService
  ) {
    super()
  }

  @Post('token')
  async getAccessToken(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: TokenDto
  ) {
    const jid = req.cookies['jid']
    const result = await this.refreshTokensService.createAccessToken(jid, body)

    if (result.refresh_token) {
      // sendRefreshToken(res, result.refresh_token.id);
      const refreshToken = result.refresh_token.id
      res.cookie(
        this.configService.get('REFRESH_TOKEN_NAME') || '',
        refreshToken,
        CookieService.makeConfig(this.configService)
      )
    }
    return res
      .status(200)
      .json({ finalizado: true, mensaje: 'ok', datos: result.data })
  }

  @UseGuards(LocalAuthGuard)
  @UseGuards(OidcAuthGuard)
  @Delete(':id')
  async eliminarRefreshToken(@Param('id') id: string) {
    //
    return this.refreshTokensService.removeByid(id)
  }
}
