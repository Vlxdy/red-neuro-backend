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
import { EspecialidadService } from '../services/especialidad.service'
import {
  ActualizarEspecialidadDto,
  CrearEspecialidadDto,
  EspecialidadResponseDto,
} from '../dto/especialidad.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { formatearEspecialidad } from '../utils/formateo-especialidad.utils'

@Controller('especialidades')
@ApiTags('Especialidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class EspecialidadController extends BaseController {
  constructor(private readonly especialidadService: EspecialidadService) {
    super()
  }

  @ApiOperation({ summary: 'Lista las especialidades médicas configuradas' })
  @ApiBaseResponseListRows(EspecialidadResponseDto)
  @Get()
  async listar(
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<EspecialidadResponseDto>> {
    const resultado =
      await this.especialidadService.listarEspecialidades(paginacionQuery)
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de una especialidad médica' })
  @ApiBaseResponse(EspecialidadResponseDto)
  @Get(':id')
  async obtenerPorId(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<EspecialidadResponseDto>> {
    const resultado =
      await this.especialidadService.obtenerEspecialidadPorId(id)
    return this.success(formatearEspecialidad(resultado))
  }

  @ApiOperation({ summary: 'Crea una nueva especialidad médica' })
  @ApiBaseResponse(EspecialidadResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearEspecialidadDto
  ): Promise<BaseResponseDto<EspecialidadResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.especialidadService.crearEspecialidad(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza la información de una especialidad' })
  @ApiBaseResponse(EspecialidadResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarEspecialidadDto
  ): Promise<BaseResponseDto<EspecialidadResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.especialidadService.actualizarEspecialidad(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Elimina una especialidad médica' })
  @ApiBaseResponse(EspecialidadResponseDto)
  @Delete(':id')
  async eliminar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<EspecialidadResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.especialidadService.eliminarEspecialidad(
      id,
      usuarioAuditoria
    )
    return this.successDelete(resultado)
  }

  @ApiOperation({ summary: 'Cambiar estado de la especialidad' })
  @ApiBaseResponse(EspecialidadResponseDto)
  @Patch(':id/cambiar-estado')
  async cambiarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<EspecialidadResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.especialidadService.cambiarEstadoEspecialidad(
      id,
      usuarioAuditoria
    )
    return this.success(resultado)
  }
}
