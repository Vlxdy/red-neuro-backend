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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/base'
import {
  BaseResponseDto,
  BaseResponseListRowsDto,
} from '@/common/dto/swagger/base-response.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  ApiBaseResponse,
  ApiBaseResponseListRows,
} from '@/common/decorators/api-base-responde.decorator'

import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import { ConsultorioService } from '../services/consultorio.service'
import {
  ActualizarConsultorioDto,
  ConsultorioResponseDto,
  CrearConsultorioDto,
} from '../dto/consultorio.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@Controller('consultorios')
@ApiTags('Consultorios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class ConsultorioController extends BaseController {
  constructor(private readonly consultorioService: ConsultorioService) {
    super()
  }

  @ApiOperation({ summary: 'Lista los ambientes o agrupadores configurados' })
  @ApiBaseResponseListRows(ConsultorioResponseDto)
  @Get()
  async listar(
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<ConsultorioResponseDto>> {
    const resultado =
      await this.consultorioService.listarConsultorios(paginacionQuery)
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Crea un nuevo ambiente o agrupador' })
  @ApiBaseResponse(ConsultorioResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearConsultorioDto
  ): Promise<BaseResponseDto<ConsultorioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.consultorioService.crearConsultorio(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({
    summary: 'Actualiza la información de un ambiente/agrupador',
  })
  @ApiBaseResponse(ConsultorioResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarConsultorioDto
  ): Promise<BaseResponseDto<ConsultorioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.consultorioService.actualizarConsultorio(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Cambiar estado del consultorio' })
  @ApiBaseResponse(ConsultorioResponseDto)
  @Patch(':id/cambiar-estado')
  async cambiarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<ConsultorioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.consultorioService.cambiarEstadoConsultorio(
      id,
      usuarioAuditoria
    )
    return this.success(resultado)
  }
}
