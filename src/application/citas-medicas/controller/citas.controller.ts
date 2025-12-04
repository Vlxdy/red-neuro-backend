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
} from '@/common/decorators/api-base-responde.decorator'
import { CitasMedicasService } from '../citas-medicas.service'
import {
  ActualizarAgrupadorCitaDto,
  ActualizarCitaDto,
  ActualizarEtiquetasCitaDto,
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  CitaResponseDto,
  CrearCitaDto,
  FiltrosCitaDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'

@Controller('citas')
@ApiTags('Gestión de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CitasController extends BaseController {
  constructor(private readonly citasService: CitasMedicasService) {
    super()
  }

  @ApiOperation({ summary: 'Lista todas las citas con filtros opcionales' })
  @ApiBaseResponseArray(CitaResponseDto)
  @Get()
  listar(@Query() filtros: FiltrosCitaDto): BaseResponseDto<CitaResponseDto[]> {
    const resultado = this.citasService.listarCitas(filtros)
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Lista solamente las citas del médico autenticado' })
  @ApiBaseResponseArray(CitaResponseDto)
  @Get('mis-citas')
  listarMisCitas(
    @Req() req: Request,
    @Query() filtros: FiltrosCitaDto
  ): BaseResponseDto<CitaResponseDto[]> {
    const medicoId = String(req.user?.id || '')
    const resultado = this.citasService.listarMisCitas(medicoId, filtros)
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de una cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Get(':id')
  obtener(@Param() { id }: ParamIdDto): BaseResponseDto<CitaResponseDto> {
    const resultado = this.citasService.obtenerCita(id)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Crea una nueva cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Post()
  crear(@Body() dto: CrearCitaDto): BaseResponseDto<CitaResponseDto> {
    const resultado = this.citasService.crearCita(dto)
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza datos generales de la cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id')
  actualizar(
    @Param() { id }: ParamIdDto,
    @Body() dto: ActualizarCitaDto
  ): BaseResponseDto<CitaResponseDto> {
    const resultado = this.citasService.actualizarCita(id, dto)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza únicamente el estado de la cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/estado')
  actualizarEstado(
    @Param() { id }: ParamIdDto,
    @Body() dto: ActualizarEstadoCitaDto
  ): BaseResponseDto<CitaResponseDto> {
    const resultado = this.citasService.actualizarEstadoCita(id, dto)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Reprograma la fecha y hora de la cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/reprogramar')
  reprogramar(
    @Param() { id }: ParamIdDto,
    @Body() dto: ReprogramarCitaDto
  ): BaseResponseDto<CitaResponseDto> {
    const resultado = this.citasService.reprogramarCita(id, dto)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Cancela una cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/cancelar')
  cancelar(
    @Param() { id }: ParamIdDto,
    @Body() dto: CancelarCitaDto
  ): BaseResponseDto<CitaResponseDto> {
    const resultado = this.citasService.cancelarCita(id, dto)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Define las etiquetas de una cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/etiquetas')
  actualizarEtiquetas(
    @Param() { id }: ParamIdDto,
    @Body() dto: ActualizarEtiquetasCitaDto
  ): BaseResponseDto<CitaResponseDto> {
    const resultado = this.citasService.actualizarEtiquetas(id, dto)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Asigna un agrupador a la cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/agrupador')
  actualizarAgrupador(
    @Param() { id }: ParamIdDto,
    @Body() dto: ActualizarAgrupadorCitaDto
  ): BaseResponseDto<CitaResponseDto> {
    const resultado = this.citasService.actualizarAgrupadorCita(id, dto)
    return this.successUpdate(resultado)
  }
}
