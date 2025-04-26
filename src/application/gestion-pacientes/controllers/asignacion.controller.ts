import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AsignacionService } from '../services/asignacion.service'
import { CrearAsignacionDto } from '../dto/asignacion.dto'
import { Request } from 'express'

@ApiTags('Asignacion')
@ApiBearerAuth()
@Controller('asignacion')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class AsignacionesController extends BaseController {
  constructor(private asignacionService: AsignacionService) {
    super()
  }

  @ApiOperation({ summary: 'API para asignar pacientes a medico' })
  @Post()
  async crearControl(@Body() data: CrearAsignacionDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const { idMedico, idPacientes } = data
    const respuesta = await this.asignacionService.crearControles({
      idMedico,
      idPacientes,
      usuarioAuditoria,
    })
    return this.successCreate(respuesta)
  }
}
