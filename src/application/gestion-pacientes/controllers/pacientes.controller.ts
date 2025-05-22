import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { PacientesService } from '../services/pacientes.service'
import { PacientesAsignadosDto } from '../dto/usuarios-registrados.dto'

@ApiTags('Pacientes')
@ApiBearerAuth()
@Controller('pacientes')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PacientesController extends BaseController {
  constructor(private pacientesService: PacientesService) {
    super()
  }
  @ApiOperation({ summary: 'Listar pacientes asignados a un medico' })
  @Get('asignados')
  async asignarPacienteAMedico(
    @Query() paginacionQueryDto: PacientesAsignadosDto,
    @Req() req: Request
  ) {
    const idUsuarioRol = this.getUsuarioRol(req)
    // const usuarioAuditoria = this.getUser(req)

    const result = await this.pacientesService.listarPacientePorMedico(
      paginacionQueryDto,
      idUsuarioRol
    )
    return this.successListRows(result as any)
  }
}
