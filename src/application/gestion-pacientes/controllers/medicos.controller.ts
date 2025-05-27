import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

import { ParamIdDto } from '@/common/dto/params-id.dto'
import { PacientesService } from '../services/pacientes.service'

@ApiTags('Pacientes')
@ApiBearerAuth()
@Controller('medicos')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class MedicosController extends BaseController {
  constructor(private pacientesService: PacientesService) {
    super()
  }

  @ApiOperation({
    summary:
      'API para listar pacientes que no fueron asignados a un medico especifico',
  })
  @Get(':id/pacientes-por-asignar')
  async listarPacienteParaAsignar(
    @Query() paginacionQueryDto: PaginacionQueryDto,
    @Param() params: ParamIdDto
  ) {
    const { id: idMedico } = params
    const result = await this.pacientesService.listarPacientesPorAsignar({
      params: paginacionQueryDto,
      idMedico,
    })
    return this.successListRows(result as any)
  }

  @ApiOperation({ summary: 'API para listar pacientes de un medico' })
  @Get(':id/pacientes')
  async listarPacientePorMedico(
    @Query() paginacionQueryDto: PaginacionQueryDto,
    @Param() params: ParamIdDto
  ) {
    const { id: idMedico } = params
    const result = await this.pacientesService.listarPacientePorMedico(
      paginacionQueryDto,
      idMedico
    )
    return this.successListRows(result)
  }
}
