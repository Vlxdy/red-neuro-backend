import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UsuariosRegistradosService } from '../service/usuarios-registrados.service'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { ListarUsuariosRegistradosDto } from '../dto/usuarios-registrados.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'

@ApiTags('Consultas')
@ApiBearerAuth()
@Controller('usuarios-registrados')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class UsuariosRegistradosController extends BaseController {
  constructor(private usuariosRegistrados: UsuariosRegistradosService) {
    super()
  }

  @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  @Get(':rol')
  async listar(
    @Query() paginacionQueryDto: PaginacionQueryDto,
    @Param() params: ListarUsuariosRegistradosDto
  ) {
    const { rol } = params
    const result = await this.usuariosRegistrados.listarUsuariosPorRol(
      paginacionQueryDto,
      rol
    )
    return this.successListRows(result as any)
  }

  @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  @Get('medicos/:id/pacientes')
  async listarPacientePorMedico(
    @Query() paginacionQueryDto: PaginacionQueryDto,
    @Param() params: ParamIdDto
  ) {
    const { id: idMedico } = params
    const result = await this.usuariosRegistrados.listarPacientePorMedico(
      paginacionQueryDto,
      idMedico
    )
    return this.successListRows(result as any)
  }
}
