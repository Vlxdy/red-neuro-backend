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
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { BaseController } from '@/common/base'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'
import { PlanesAlimentariosService } from '../service'
import { ActualizarPlanAlimentarioDto, CrearPlanAlimentarioDto } from '../dto'

@ApiTags('Planes Alimentarios')
@ApiBearerAuth()
@Controller('planes-alimentarios')
@UseGuards(JwtAuthGuard)
export class PlanesAlimentariosController extends BaseController {
  constructor(private planAlimentarioService: PlanesAlimentariosService) {
    super()
  }

  @ApiOperation({ summary: 'API para obtener el listado de parámetros' })
  @Get()
  async listar(@Query() paginacionQueryDto: PaginacionQueryDto) {
    const result = await this.planAlimentarioService.listar(paginacionQueryDto)
    return this.successListRows(result)
  }

  @ApiOperation({ summary: 'API para crear un nuevo parámetro' })
  @ApiBody({
    type: CrearPlanAlimentarioDto,
    description:
      'Esta API permite crear un nuevo parámetro utilizando los datos proporcionados en el cuerpo de la solicitud.',
    required: true,
  })
  @Post()
  async crear(
    @Req() req: Request,
    @Body() parametroDto: CrearPlanAlimentarioDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.planAlimentarioService.crear(
      parametroDto,
      usuarioAuditoria
    )
    return this.successCreate(result)
  }

  @ApiOperation({ summary: 'API para actualizar un parámetro' })
  @ApiProperty({
    type: ParamIdDto,
  })
  @ApiBody({
    type: ActualizarPlanAlimentarioDto,
    description:
      'Esta API permite actualizar un parámetro existente utilizando los atributos proporcionados en el cuerpo de la solicitud.',
    required: true,
  })
  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() parametroDto: ActualizarPlanAlimentarioDto
  ) {
    const { id: idParametro } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.planAlimentarioService.actualizarDatos(
      idParametro,
      parametroDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }
}
