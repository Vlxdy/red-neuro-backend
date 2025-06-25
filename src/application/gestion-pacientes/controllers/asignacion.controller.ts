import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AsignacionService } from '../services/asignacion.service'
import {
  CrearAsignacionDto,
  ModificarAsignacionDto,
} from '../dto/asignacion.dto'
import { Request } from 'express'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'

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
  async crearAsignacion(@Body() data: CrearAsignacionDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const { idMedico, idPacientes } = data
    const respuesta = await this.asignacionService.crearAsignaciones({
      idMedico,
      idPacientes,
      usuarioAuditoria,
    })
    return this.successCreate(respuesta)
  }

  @ApiOperation({
    summary: 'API para eliminar asignacion de paciente a medico',
  })
  @Patch('eliminar')
  async eliminarAsignacion(
    @Body() data: ModificarAsignacionDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { idMedico, idPaciente } = data
    const respuesta = await this.asignacionService.eliminarAsignacion({
      idMedico,
      idPaciente,
      usuarioAuditoria,
    })
    return this.successUpdate(respuesta)
  }
}
