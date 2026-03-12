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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/base'
import {
  BaseResponseDto,
  BaseResponseListRowsDto,
} from '@/common/dto/swagger/base-response.dto'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  ApiBaseResponse,
  ApiBaseResponseListRows,
} from '@/common/decorators/api-base-responde.decorator'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import { OcupacionService } from '../services/ocupacion.service'
import {
  ActualizarOcupacionDto,
  CrearOcupacionDto,
  OcupacionResponseDto,
} from '../dto/ocupacion.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { formatearOcupacion } from '../utils/formateo-ocupacion.utils'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'

@Controller('ocupaciones')
@ApiTags('Ocupaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class OcupacionController extends BaseController {
  constructor(private readonly ocupacionService: OcupacionService) {
    super()
  }

  @ApiOperation({ summary: 'Lista las ocupaciones configuradas' })
  @ApiBaseResponseListRows(OcupacionResponseDto)
  @Get()
  async listar(
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<OcupacionResponseDto>> {
    const resultado =
      await this.ocupacionService.listarOcupaciones(paginacionQuery)
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de una ocupación' })
  @ApiBaseResponse(OcupacionResponseDto)
  @Get(':id')
  async obtenerPorId(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<OcupacionResponseDto>> {
    const resultado = await this.ocupacionService.obtenerOcupacionPorId(id)
    return this.success(formatearOcupacion(resultado))
  }

  @ApiOperation({ summary: 'Crea una nueva ocupación' })
  @ApiBaseResponse(OcupacionResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearOcupacionDto
  ): Promise<BaseResponseDto<OcupacionResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.ocupacionService.crearOcupacion(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza la información de una ocupación' })
  @ApiBaseResponse(OcupacionResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarOcupacionDto
  ): Promise<BaseResponseDto<OcupacionResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.ocupacionService.actualizarOcupacion(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Elimina una ocupación' })
  @ApiBaseResponse(OcupacionResponseDto)
  @Delete(':id')
  async eliminar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<OcupacionResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.ocupacionService.eliminarOcupacion(
      id,
      usuarioAuditoria
    )
    return this.successDelete(resultado)
  }

  @ApiOperation({ summary: 'Cambiar estado de la ocupación' })
  @ApiBaseResponse(OcupacionResponseDto)
  @Patch(':id/cambiar-estado')
  async cambiarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<OcupacionResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.ocupacionService.cambiarEstadoOcupacion(
      id,
      usuarioAuditoria
    )
    return this.success(resultado)
  }
}
