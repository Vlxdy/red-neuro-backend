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
import { ServicioService } from '../services/estudio.service'
import {
  ActualizarServicioDto,
  AsignarEspecialidadDto,
  CrearServicioDto,
  ServicioResponseDto,
} from '../dto/estudio.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { formatearServicio } from '../utils/formateo.estudio'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'

@Controller('servicios')
@ApiTags('Servicios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class ServicioController extends BaseController {
  constructor(private readonly servicioService: ServicioService) {
    super()
  }

  @ApiOperation({ summary: 'Lista los servicios configurados' })
  @ApiBaseResponseListRows(ServicioResponseDto)
  @Get()
  async listar(
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<ServicioResponseDto>> {
    const resultado =
      await this.servicioService.listarServicios(paginacionQuery)
    return this.successListRows(resultado)
  }

  @ApiOperation({
    summary: 'Lista los servicios paginados por especialidad',
  })
  @ApiBaseResponseListRows(ServicioResponseDto)
  @Get('especialidades/:id')
  async listarPorEspecialidad(
    @Param() { id }: ParamIdDto,
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<ServicioResponseDto>> {
    const resultado = await this.servicioService.listarServiciosPorEspecialidad(
      id,
      paginacionQuery
    )
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de un servicio' })
  @ApiBaseResponse(ServicioResponseDto)
  @Get(':id')
  async obtenerPorId(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<ServicioResponseDto>> {
    const resultado = await this.servicioService.obtenerServicioPorId(id)
    return this.success(formatearServicio(resultado))
  }

  @ApiOperation({ summary: 'Crea un nuevo servicio' })
  @ApiBaseResponse(ServicioResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearServicioDto
  ): Promise<BaseResponseDto<ServicioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.servicioService.crearServicio(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza la información de un servicio' })
  @ApiBaseResponse(ServicioResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarServicioDto
  ): Promise<BaseResponseDto<ServicioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.servicioService.actualizarServicio(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Elimina un servicio' })
  @ApiBaseResponse(ServicioResponseDto)
  @Delete(':id')
  async eliminar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<ServicioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.servicioService.eliminarServicio(
      id,
      usuarioAuditoria
    )
    return this.successDelete(resultado)
  }

  @ApiOperation({ summary: 'Cambiar estado del servicio' })
  @ApiBaseResponse(ServicioResponseDto)
  @Patch(':id/cambiar-estado')
  async cambiarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<ServicioResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.servicioService.cambiarEstadoServicio(
      id,
      usuarioAuditoria
    )
    return this.success(resultado)
  }

  @ApiOperation({
    summary: 'Asocia una especialidad a un servicio',
  })
  @ApiBaseResponse(ServicioResponseDto)
  @Post(':id/especialidades')
  async asignarEspecialidad(
    @Param() { id }: ParamIdDto,
    @Body() dto: AsignarEspecialidadDto
  ): Promise<BaseResponseDto<ServicioResponseDto>> {
    const resultado = await this.servicioService.asignarEspecialidad(id, dto)
    return this.success(resultado)
  }
}
