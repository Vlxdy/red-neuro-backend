import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UsuariosRegistradosService } from '../service/usuarios-registrados.service'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { ListarUsuariosRegistradosDto } from '../dto/usuarios-registrados.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'

@ApiTags('Usuarios Registrados')
@ApiBearerAuth()
@Controller('usuarios-registrados')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class UsuariosRegistradosController extends BaseController {
  constructor(private usuariosRegistrados: UsuariosRegistradosService) {
    super()
  }
  @ApiOperation({ summary: 'Listar pacientes asignados a un medico' })
  @Get('pacientes-asignados')
  async asignarPacienteAMedico(
    @Query() paginacionQueryDto: PaginacionQueryDto,
    @Req() req: Request
  ) {
    const idUsuarioRol = this.getUsuarioRol(req)
    // const usuarioAuditoria = this.getUser(req)

    const result = await this.usuariosRegistrados.listarPacientePorMedico(
      paginacionQueryDto,
      idUsuarioRol
    )
    return this.successListRows(result as any)
  }
  @ApiOperation({ summary: 'API para listar usuarios por rol' })
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

  @ApiOperation({ summary: 'API para listar pacientes de un medico' })
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

  @ApiOperation({
    summary:
      'API para listar pacientes que no fueron asignados a un medico especifico',
  })
  @Get('medicos/:id/pacientes-asignar')
  async listarPacienteParaAsignar(
    @Query() paginacionQueryDto: PaginacionQueryDto,
    @Param() params: ParamIdDto
  ) {
    const { id: idMedico } = params
    const result = await this.usuariosRegistrados.listarPacientesPorAsignar({
      params: paginacionQueryDto,
      idMedico,
    })
    return this.successListRows(result as any)
  }
}
