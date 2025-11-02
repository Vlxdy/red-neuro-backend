import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

import { ParamIdDto } from '@/common/dto/params-id.dto'
import { PacientesService } from '../services/pacientes.service'
import { ListarPacientesPorAsignarSuccessResponseDto } from '../dto/usuarios-registrados.dto'

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
      'Listar pacientes disponibles para asignar a un nutricionista específico',
    description:
      'Sin filtro se devuelven únicamente los pacientes sin nutricionista. Al enviar un filtro de texto se incluyen coincidencias ya asignadas, ordenando siempre primero a los pacientes sin asignación.',
  })
  @ApiOkResponse({
    description:
      'Listado paginado de pacientes priorizando aquellos sin nutricionista asignado.',
    type: ListarPacientesPorAsignarSuccessResponseDto,
  })
  @ApiParam({
    name: 'id',
    description:
      'Identificador del médico que realiza la asignación o consulta la disponibilidad.',
    example: '2',
  })
  @ApiQuery({
    name: 'filtro',
    type: String,
    required: false,
    description:
      'Texto de búsqueda aplicado a nombre, usuario o documento. Al proporcionarlo se incluyen pacientes ya asignados que coincidan, mostrando el nutricionista responsable.',
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
    return this.successListRows(result)
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
