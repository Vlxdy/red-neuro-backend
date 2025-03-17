import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CrearControlDto } from '../dto/control.dto'
import { ControlService } from '../service/control.service'

@ApiTags('control')
@ApiBearerAuth()
@Controller('control')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class ControlController extends BaseController {
  constructor(private seguimientoService: ControlService) {
    super()
  }

  @ApiOperation({ summary: 'API para asignar pacientes a medico' })
  @Post()
  async crearControl(@Body() data: CrearControlDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const { idMedico, idPacientes } = data
    const respuesta = await this.seguimientoService.crearControles({
      idMedico,
      idPacientes,
      usuarioAuditoria,
    })
    return this.successCreate(respuesta)
  }
}
