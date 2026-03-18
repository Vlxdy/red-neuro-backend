import {
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'
import {
  ApiBaseResponse,
  ApiBaseResponseListRows,
} from '@/common/decorators/api-base-responde.decorator'
import { Request } from 'express'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { NotificacionesService } from '../services/notificaciones.service'
import { PushConfigService } from '../services/push-config.service'
import {
  FiltroNotificacionDto,
  NotificacionResponseDto,
} from '../dto/notificacion.dto'

@Controller('notificaciones')
@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class NotificacionesController extends BaseController {
  constructor(
    private readonly notificacionesService: NotificacionesService,
    private readonly pushConfigService: PushConfigService
  ) {
    super()
  }

  @ApiOperation({ summary: 'Obtiene la bandeja de notificaciones' })
  @ApiBaseResponseListRows(NotificacionResponseDto)
  @Get()
  async listar(@Req() req: Request, @Query() filtros: FiltroNotificacionDto) {
    const idUsuario = this.getUser(req)
    const resultado = await this.notificacionesService.listar(
      filtros,
      idUsuario
    )
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Marca una notificación como vista' })
  @ApiBaseResponse(Boolean)
  @Patch(':id/visto')
  async marcarVisto(@Param() { id }: ParamIdDto, @Req() req: Request) {
    const ok = await this.notificacionesService.marcarVisto(
      id,
      this.getUser(req),
      this.getUser(req)
    )
    return this.successUpdate(ok)
  }

  @ApiOperation({ summary: 'Marca todas las notificaciones como vistas' })
  @ApiBaseResponse(Number)
  @Patch('marcar-todas-vistas')
  async marcarTodas(@Req() req: Request) {
    const actualizadas = await this.notificacionesService.marcarTodasVistas(
      this.getUser(req),
      this.getUser(req)
    )
    return this.successUpdate(actualizadas)
  }

  @ApiOperation({
    summary: 'Valida credenciales Firebase cargadas desde archivo local',
  })
  @ApiBaseResponse(Object)
  @Get('validar-config-push')
  validarConfigPush() {
    const resultado =
      this.pushConfigService.validarCredencialesFirebaseDesdeArchivo()
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Ejecuta manualmente el envío de resumen diario' })
  @ApiBaseResponse(Number)
  @Post('ejecutar-resumen-diario')
  async ejecutarResumen(@Req() req: Request) {
    void req
    const enviados =
      await this.notificacionesService.generarResumenDiarioParaTodos()
    return this.success(enviados)
  }
}
