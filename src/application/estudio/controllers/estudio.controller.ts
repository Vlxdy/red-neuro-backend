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
import { EstudioService } from '../services/estudio.service'
import {
  ActualizarEstudioDto,
  AsignarEspecialidadDto,
  CrearEstudioDto,
  EstudioResponseDto,
} from '../dto/estudio.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { formatearEstudio } from '../utils/formateo.estudio'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'

@Controller('estudios')
@ApiTags('Estudios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class EstudioController extends BaseController {
  constructor(private readonly estudioService: EstudioService) {
    super()
  }

  @ApiOperation({ summary: 'Lista los estudios médicos configurados' })
  @ApiBaseResponseListRows(EstudioResponseDto)
  @Get()
  async listar(
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<EstudioResponseDto>> {
    const resultado = await this.estudioService.listarEstudios(paginacionQuery)
    return this.successListRows(resultado)
  }

  @ApiOperation({
    summary: 'Lista los estudios médicos paginados por especialidad',
  })
  @ApiBaseResponseListRows(EstudioResponseDto)
  @Get('especialidades/:id')
  async listarPorEspecialidad(
    @Param() { id }: ParamIdDto,
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<EstudioResponseDto>> {
    const resultado = await this.estudioService.listarEstudiosPorEspecialidad(
      id,
      paginacionQuery
    )
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de un estudio médico' })
  @ApiBaseResponse(EstudioResponseDto)
  @Get(':id')
  async obtenerPorId(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<EstudioResponseDto>> {
    const resultado = await this.estudioService.obtenerEstudioPorId(id)
    return this.success(formatearEstudio(resultado))
  }

  @ApiOperation({ summary: 'Crea un nuevo estudio médico' })
  @ApiBaseResponse(EstudioResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearEstudioDto
  ): Promise<BaseResponseDto<EstudioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.estudioService.crearEstudio(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza la información de un estudio médico' })
  @ApiBaseResponse(EstudioResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarEstudioDto
  ): Promise<BaseResponseDto<EstudioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.estudioService.actualizarEstudio(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Elimina un estudio médico' })
  @ApiBaseResponse(EstudioResponseDto)
  @Delete(':id')
  async eliminar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<EstudioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.estudioService.eliminarEstudio(
      id,
      usuarioAuditoria
    )
    return this.successDelete(resultado)
  }

  @ApiOperation({ summary: 'Cambiar estado del estudio médico' })
  @ApiBaseResponse(EstudioResponseDto)
  @Patch(':id/cambiar-estado')
  async cambiarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<EstudioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.estudioService.cambiarEstadoEstudio(
      id,
      usuarioAuditoria
    )
    return this.success(resultado)
  }

  @ApiOperation({
    summary: 'Asocia una especialidad a un estudio médico',
  })
  @ApiBaseResponse(EstudioResponseDto)
  @Post(':id/especialidades')
  async asignarEspecialidad(
    @Param() { id }: ParamIdDto,
    @Body() dto: AsignarEspecialidadDto
  ): Promise<BaseResponseDto<EstudioResponseDto>> {
    const resultado = await this.estudioService.asignarEspecialidad(id, dto)
    return this.success(resultado)
  }
}
