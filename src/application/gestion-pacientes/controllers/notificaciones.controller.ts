import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { BaseController } from '../../../common/base'
import { Request } from 'express'
import { JwtAuthGuard } from 'src/core/authentication/guards/jwt-auth.guard'
import { PaginacionQueryDto } from 'src/common/dto/paginacion-query.dto'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { NotificacionService } from '../services/notificacion.service'
import { UpdateNotificacionDto } from '../dto/notificacion.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'

@ApiTags('Notificaciones')
@ApiBearerAuth()
@Controller('notificacion')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class NotificacionController extends BaseController {
  constructor(private notificacionService: NotificacionService) {
    super()
  }

  @Get()
  async obtenerNotificaciones(
    @Req() req: Request,
    @Query() query: PaginacionQueryDto
  ) {
    const idPaciente = this.getUsuarioRol(req)
    const resultado = await this.notificacionService.obtenerNotificaciones(
      idPaciente,
      query
    )

    return this.successListRows(resultado)
  }

  @Patch()
  async actualizarNotificaciones(
    @Req() req: Request,
    @Body() body: UpdateNotificacionDto
  ) {
    const idPaciente = this.getUsuarioRol(req)
    const usuarioAuditoria = this.getUser(req)

    const resultado = await this.notificacionService.actualizarView({
      data: body,
      idPaciente,
      usuarioAuditoria,
    })

    return this.successCreate(resultado)
  }
}
