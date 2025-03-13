import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SeguimientoService } from '../service/seguimiento.service'
import { CrearSeguimientoDto } from '../dto/seguimiento.dto'

@ApiTags('Consultas')
@ApiBearerAuth()
@Controller('seguimiento')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class SeguimientoController extends BaseController {
  constructor(private seguimientoService: SeguimientoService) {
    super()
  }

  @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  @Post()
  async crearConsulta(@Body() data: CrearSeguimientoDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const respuesta = await this.seguimientoService.crearSeguimiento(
      data,
      usuarioAuditoria
    )
    return this.successCreate(respuesta)
  }
}
