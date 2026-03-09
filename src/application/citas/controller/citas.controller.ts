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
  CancelarCitaDto,
  CantidadCitasPorDiaResponseDto,
  CitaResponseDto,
  ConfirmarCitaDto,
  CrearCitaDto,
  EditarBorradorCitaDto,
  EnviarCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  MarcarNoAsistioCitaDto,
  RechazarCitaDto,
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
    @Req() req: Request,
    @Query() filtros: FiltrosCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto[]>> {
    const idUsuarioSolicitante = this.getUsuarioRol(req)
    const resultado = await this.citasService.listarCitas(
      filtros,
      idUsuarioSolicitante
    )
    return this.successList(resultado)
  }

  @ApiOperation({
    summary: 'Lista todas las citas paginadas con filtros opcionales',
  })
  @ApiBaseResponseListRows(CitaResponseDto)
  @Get('paginado')
  async listarPaginado(
    @Req() req: Request,
    @Query() filtros: FiltrosCitaPaginadoDto
  ) {
    const idUsuarioSolicitante = this.getUsuarioRol(req)
    const resultado = await this.citasService.listarCitasPaginadas(
      filtros,
      idUsuarioSolicitante
    )
    return this.successListRows(resultado)
  }

  @ApiOperation({
    summary:
      'Obtiene la cantidad de citas por día dentro de un rango de fechas',
  })
  @ApiBaseResponseArray(CantidadCitasPorDiaResponseDto)
  @Get('cantidad-por-dia')
  async obtenerCantidadPorDia(
    @Req() req: Request,
    @Query() filtros: FiltrosCitaDto
  ): Promise<BaseResponseDto<CantidadCitasPorDiaResponseDto[]>> {
    const idUsuarioSolicitante = this.getUsuarioRol(req)
    const resultado = await this.citasService.obtenerCantidadCitasPorDia(
      filtros,
      idUsuarioSolicitante
    )
    return this.successList(resultado)
  }

  @ApiOperation({
    summary: 'Lista solamente las citas del personal autenticado',
    deprecated: true,
  })
  @ApiBaseResponseArray(CitaResponseDto)
  @Get('mis-citas')
  async listarMisCitas(
    @Req() req: Request,
    @Query() filtros: FiltrosCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto[]>> {
    const idPersonal = this.getUsuarioRol(req)
    const resultado = await this.citasService.listarMisCitas(
      filtros,
      idPersonal,
      idPersonal
    )
    return this.successList(resultado)
  }

  @ApiOperation({
    summary: 'Ejecuta manualmente el proceso automático de no asistió',
  })
  @ApiBaseResponse(Number)
  @Post('ejecutar-auto-no-asistio')
  async ejecutarAutoNoAsistio(): Promise<BaseResponseDto<number>> {
    const resultado = await this.citasService.ejecutarAutoNoAsistio()
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de una cita' })
  @ApiBaseResponse(CitaResponseDto)
  @Get(':id')
  async obtener(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const idUsuarioSolicitante = this.getUsuarioRol(req)
    const resultado = await this.citasService.obtenerCita(
      id,
      undefined,
      idUsuarioSolicitante
    )
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

  @ApiOperation({ summary: 'Edita una cita en estado borrador' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/editar-borrador')
  async editarBorrador(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: EditarBorradorCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.editarBorradorCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaActualizada(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary: 'Envía una cita borrador o rechazada al flujo operativo',
  })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/enviar')
  async enviar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: EnviarCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.enviarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Confirma una cita solicitada' })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/confirmar')
  async confirmar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ConfirmarCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.confirmarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Rechaza una cita solicitada' })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/rechazar')
  async rechazar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: RechazarCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.rechazarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Completa una cita confirmada' })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/completar')
  async completar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.completarCita(
      id,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Marca una cita confirmada como no asistida' })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/no-asistio')
  async marcarNoAsistio(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: MarcarNoAsistioCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.marcarNoAsistioCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary: 'Elimina lógicamente una cita borrador (estado INACTIVO)',
  })
  @ApiBaseResponse(CitaResponseDto)
  @Delete(':id')
  async eliminarBorrador(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUsuarioRol(req)
    const resultado = await this.citasService.eliminarBorrador(
      id,
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

  @ApiOperation({ summary: 'Cancela una cita confirmada' })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/cancelar')
  async cancelarPost(
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
