import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { BaseController } from '../../../common/base/base-controller'
import { ModuloService } from '../service/modulo.service'
import { CrearModuloDto, FiltroModuloDto } from '../dto/crear-modulo.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '../guards/casbin.guard'
import { ParamIdDto } from '../../../common/dto/params-id.dto'
import { ActualizarModuloDto } from '../dto/actualizar-modulo.dto'

@UseGuards(JwtAuthGuard, CasbinGuard)
@Controller('autorizacion/modulos')
export class ModuloController extends BaseController {
  constructor(private moduloService: ModuloService) {
    super()
  }

  @Get()
  async listar(@Query() paginacionQueryDto: FiltroModuloDto) {
    const result = await this.moduloService.listar(paginacionQueryDto)
    return this.successListRows(result)
  }

  @Post()
  async crear(@Req() req, @Body() moduloDto: CrearModuloDto) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.moduloService.crear(moduloDto, usuarioAuditoria)
    return this.successCreate(result)
  }

  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req,
    @Body() moduloDto: ActualizarModuloDto
  ) {
    const { id: idModulo } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.moduloService.actualizar(
      idModulo,
      moduloDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @Delete()
  async eliminar(@Param('id') id: string) {
    const result = await this.moduloService.eliminar(id)
    return this.successDelete(result)
  }

  // activar modulo
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/:id/activacion')
  async activar(@Req() req, @Param() params: ParamIdDto) {
    const { id: idModulo } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.moduloService.activar(idModulo, usuarioAuditoria)
    return this.successUpdate(result)
  }

  // inactivar modulo
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/:id/inactivacion')
  async inactivar(@Req() req, @Param() params: ParamIdDto) {
    const { id: idModulo } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.moduloService.inactivar(
      idModulo,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }
}
