import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

import { ListarUsuariosRegistradosDto } from '../dto/usuarios-registrados.dto'
import { UsuariosRegistradosService } from '../services/usuarios-registrados.service'

@ApiTags('Usuarios Registrados')
@ApiBearerAuth()
@Controller('usuarios-registrados')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class UsuariosRegistradosController extends BaseController {
  constructor(private usuariosRegistrados: UsuariosRegistradosService) {
    super()
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
}
