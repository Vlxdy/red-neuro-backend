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
import { Request } from 'express'
import { BaseController } from '@/common/base'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  ApiBaseResponse,
  ApiBaseResponseArray,
  ApiBaseResponseListRows,
} from '@/common/decorators/api-base-responde.decorator'
import { CitasMedicasService } from '../services/citas-medicas.service'
import { CitasGateway } from '../gateways/citas.gateway'
import {
  ActualizarCitaDto,
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  CantidadCitasPorDiaQueryDto,
  CantidadCitasPorDiaResponseDto,
  CitaResponseDto,
  CrearCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'

@Controller('citas')
@ApiTags('Gestión de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CitasController extends BaseController {
  constructor(
    private readonly citasService: CitasMedicasService,
    private readonly citasGateway: CitasGateway
  ) {
    super()
  }

  @ApiOperation({ summary: 'Lista todas las citas con filtros opcionales' })
  @ApiBaseResponseArray(CitaResponseDto)
  @Get()
  async listar(
    @Query() filtros: FiltrosCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto[]>> {
    const resultado = await this.citasService.listarCitas(filtros)
    return this.successList(resultado)
  }

  @ApiOperation({
    summary: 'Lista todas las citas paginadas con filtros opcionales',
  })
  @ApiBaseResponseListRows(CitaResponseDto)
  @Get('paginado')
  async listarPaginado(@Query() filtros: FiltrosCitaPaginadoDto) {
    const resultado = await this.citasService.listarCitasPaginadas(filtros)
    return this.successListRows(resultado)
  }

  @ApiOperation({
    summary:
      'Obtiene la cantidad de citas por día dentro de un rango de fechas',
  })
  @ApiBaseResponseArray(CantidadCitasPorDiaResponseDto)
  @Get('cantidad-por-dia')
  async obtenerCantidadPorDia(
    @Query() filtros: CantidadCitasPorDiaQueryDto
  ): Promise<BaseResponseDto<CantidadCitasPorDiaResponseDto[]>> {
    const resultado =
      await this.citasService.obtenerCantidadCitasPorDia(filtros)
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Lista solamente las citas del médico autenticado' })
  @ApiBaseResponseArray(CitaResponseDto)
  @Get('mis-citas')
  async listarMisCitas(
    @Req() req: Request,
    @Query() filtros: FiltrosCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto[]>> {
    // const medicoId = String(req.user?.id || '')
    const resultado = await this.citasService.listarMisCitas(filtros)
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de una cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Get(':id')
  async obtener(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const resultado = await this.citasService.obtenerCita(id)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Crea una nueva cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.crearCita(
      dto,
      usuarioAuditoria,
      undefined,
      idEjecutor
    )
    this.citasGateway.emitCitaCreada(resultado)
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza datos generales de la cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.actualizarCita(
      id,
      dto,
      usuarioAuditoria,
      undefined,
      idEjecutor
    )
    this.citasGateway.emitCitaActualizada(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza únicamente el estado de la cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/estado')
  async actualizarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarEstadoCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.actualizarEstadoCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Reprograma la fecha y hora de la cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/reprogramar')
  async reprogramar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ReprogramarCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.reprogramarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaReprogramada(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Cancela una cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/cancelar')
  async cancelar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: CancelarCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.cancelarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaCancelada(resultado)
    return this.successUpdate(resultado)
  }
}
