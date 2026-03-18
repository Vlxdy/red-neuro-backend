import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'
import { ApiBaseResponse } from '@/common/decorators/api-base-responde.decorator'
import { Request } from 'express'
import { DispositivosPushService } from '../services/dispositivos-push.service'
import { RegistrarDispositivoPushDto } from '../dto/dispositivo-push.dto'

@Controller('dispositivos-push')
@ApiTags('Dispositivos Push')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class DispositivosPushController extends BaseController {
  constructor(
    private readonly dispositivosPushService: DispositivosPushService
  ) {
    super()
  }

  @ApiOperation({ summary: 'Registra o actualiza token push del dispositivo' })
  @ApiBaseResponse(Boolean)
  @Post()
  async registrar(
    @Body() dto: RegistrarDispositivoPushDto,
    @Req() req: Request
  ) {
    await this.dispositivosPushService.registrar(
      dto,
      this.getUser(req),
      this.getUser(req)
    )
    return this.successCreate(true)
  }

  @ApiOperation({ summary: 'Inactiva token push de dispositivo' })
  @ApiBaseResponse(Boolean)
  @Delete(':token')
  async eliminar(@Param('token') token: string, @Req() req: Request) {
    const ok = await this.dispositivosPushService.eliminar(
      token,
      this.getUser(req),
      this.getUser(req)
    )
    return this.successDelete(ok)
  }
}
