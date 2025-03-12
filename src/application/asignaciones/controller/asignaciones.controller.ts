import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AsignacionesService } from '../service/asignaciones.service'
import { CrearAsignacionDto } from '../dto/asignaciones.dto'

@ApiTags('Asignaciones')
@ApiBearerAuth()
@Controller('asignaciones')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class AsignacionesController extends BaseController {
  constructor(private asignacionesServicio: AsignacionesService) {
    super()
  }

  @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  @Post()
  async asignarPacientesMedicos(
    @Body() data: CrearAsignacionDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const respuesta = await this.asignacionesServicio.asignarMedicoPaciente(
      data,
      usuarioAuditoria
    )
    return this.successCreate(respuesta)
  }
}
