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
import { BaseController } from '../../../common/base'
import { ModuloService } from '../service/modulo.service'
import { CrearModuloDto, FiltroModuloDto } from '../dto/crear-modulo.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '../guards/casbin.guard'
import { ParamIdDto } from '../../../common/dto/params-id.dto'
import { ActualizarModuloDto } from '../dto/actualizar-modulo.dto'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'
import { Request } from 'express'

@ApiBearerAuth()
@ApiTags('Módulos')
@UseGuards(JwtAuthGuard, CasbinGuard)
@Controller('autorizacion/modulos')
export class ModuloController extends BaseController {
  constructor(private moduloService: ModuloService) {
    super()
  }

  @ApiOperation({ summary: 'API para obtener el listado de Módulos' })
  @Get()
  async listar(@Query() paginacionQueryDto: FiltroModuloDto) {
    const result = await this.moduloService.listar(paginacionQueryDto)
    return this.successListRows(result)
  }

  @ApiOperation({ summary: 'API para crear un Módulo' })
  @ApiBody({
    type: CrearModuloDto,
    description: 'new Modulo',
    required: true,
  })
  @Post()
  async crear(@Req() req: Request, @Body() moduloDto: CrearModuloDto) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.moduloService.crear(moduloDto, usuarioAuditoria)
    return this.successCreate(result)
  }

  @ApiOperation({ summary: 'API para actualizar un Módulo' })
  @ApiProperty({
    type: ParamIdDto,
  })
  @ApiBody({
    type: ActualizarModuloDto,
    description: 'Modulo',
    required: true,
  })
  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req: Request,
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

  @ApiOperation({ summary: 'API para eliminar un Módulo' })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Delete()
  async eliminar(@Param('id') id: string) {
    const result = await this.moduloService.eliminar(id)
    return this.successDelete(result)
  }

  // activar modulo
  @ApiOperation({ summary: 'API para activar un Módulo' })
  @ApiProperty({
    type: ParamIdDto,
  })
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/:id/activacion')
  async activar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idModulo } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.moduloService.activar(idModulo, usuarioAuditoria)
    return this.successUpdate(result)
  }

  // inactivar modulo
  @ApiOperation({ summary: 'API para inactivar un Módulo' })
  @ApiProperty({
    type: ParamIdDto,
  })
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/:id/inactivacion')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idModulo } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.moduloService.inactivar(
      idModulo,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }
}
