import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ParametroService } from './parametro.service'
import { CrearParametroDto } from './dto/crear-parametro.dto'
import { JwtAuthGuard } from '../../core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '../../core/authorization/guards/casbin.guard'
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto'
import { BaseController } from '../../common/base/base-controller'
import { ParamGrupoDto } from './dto/grupo.dto'
import { ActualizarParametroDto } from './dto/actualizar-parametro.dto'
import { ParamIdDto } from '../../common/dto/params-id.dto'

@Controller('parametros')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class ParametroController extends BaseController {
  constructor(private parametroServicio: ParametroService) {
    super()
  }

  @Get()
  async listar(@Query() paginacionQueryDto: PaginacionQueryDto) {
    const result = await this.parametroServicio.listar(paginacionQueryDto)
    return this.successListRows(result)
  }

  @Get('/:grupo/listado')
  async listarPorGrupo(@Param() params: ParamGrupoDto) {
    const { grupo } = params
    const result = await this.parametroServicio.listarPorGrupo(grupo)
    return this.successList(result)
  }

  @Post()
  async crear(@Req() req, @Body() parametroDto: CrearParametroDto) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.parametroServicio.crear(
      parametroDto,
      usuarioAuditoria
    )
    return this.successCreate(result)
  }

  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req,
    @Body() parametroDto: ActualizarParametroDto
  ) {
    const { id: idParametro } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.parametroServicio.actualizarDatos(
      idParametro,
      parametroDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @Patch('/:id/activacion')
  async activar(@Req() req, @Param() params: ParamIdDto) {
    const { id: idParametro } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.parametroServicio.activar(
      idParametro,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @Patch('/:id/inactivacion')
  async inactivar(@Req() req, @Param() params: ParamIdDto) {
    const { id: idParametro } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.parametroServicio.inactivar(
      idParametro,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }
}
