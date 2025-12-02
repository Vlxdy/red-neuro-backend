import {
  AuthResponseDto,
  DeleteResultDto,
  EmptyDto,
  TokenDto,
} from '../dto/index.dto'
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
import { CookieService } from '@/common/lib/cookie.service'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { RefreshTokensService } from '../service/refreshTokens.service'
import { BaseController } from '@/common/base'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'
import { ApiBaseResponse } from '@/common/decorators/api-base-responde.decorator'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'

@Controller()
@ApiTags('Refresh Token')
export class RefreshTokensController extends BaseController {
  constructor(
    private refreshTokensService: RefreshTokensService,
    @Inject(ConfigService) private configService: ConfigService
  ) {
    super()
  }

  @ApiOperation({
    summary: 'API que actualiza el token de acceso usando un refresh token',
  })
  @ApiBody({
    type: TokenDto,
  })
  @ApiBaseResponse(AuthResponseDto)
  @Post('token')
  async getAccessToken(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: TokenDto
  ): Promise<Response<BaseResponseDto<AuthResponseDto>>> {
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
    return res.status(200).json(this.success<AuthResponseDto>(result.data))
  }

  @ApiOperation({
    summary: 'API que elimina el refresh token',
  })
  @ApiProperty({
    name: 'id',
    example: 255,
  })
  @ApiBearerAuth()
  @UseGuards(LocalAuthGuard)
  @Delete(':id')
  @ApiBaseResponse(DeleteResultDto)
  eliminarRefreshToken(
    @Param('id') id: string
  ): Promise<BaseResponseDto<DeleteResultDto | EmptyDto>> {
    return this.refreshTokensService
      .removeByid(id)
      .then((result) => this.successDelete(result as DeleteResultDto))
  }
}
