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
  CitaPagoResponseDto,
  CitaResponseDto,
  CompletarAtencionConPagoDto,
  CrearCitaDto,
  CrearCitaPagoDto,
  EditarBorradorCitaDto,
  EditarProgramadaCitaDto,
  EnviarCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  MarcarNoAsistioCitaDto,
  MisResumenCitasDto,
  MisResumenResponseDto,
  MisSolicitadasQueryDto,
  MisSolicitadasResponseDto,
  MisTimelineQueryDto,
  MisTimelineResponseDto,
  ProgramarControlCitaDto,
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

  @ApiOperation({ summary: 'Obtiene el resumen operativo de citas desde hoy' })
  @ApiBaseResponse(MisResumenResponseDto)
  @Get('mis-resumen')
  async misResumen(
    @Req() req: Request,
    @Query() filtros: MisResumenCitasDto
  ): Promise<BaseResponseDto<MisResumenResponseDto>> {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.obtenerMisResumen(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.success(resultado)
  }

  @ApiOperation({
    summary: 'Lista citas solicitadas con paginación por cursor',
  })
  @ApiBaseResponse(MisSolicitadasResponseDto)
  @Get('mis-solicitadas')
  async misSolicitadas(
    @Req() req: Request,
    @Query() filtros: MisSolicitadasQueryDto
  ): Promise<BaseResponseDto<MisSolicitadasResponseDto>> {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.listarMisSolicitadas(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.successList(resultado)
  }

  @ApiOperation({
    summary: 'Lista timeline de citas agrupado por fecha y con cursor',
  })
  @ApiBaseResponse(MisTimelineResponseDto)
  @Get('mis-timeline')
  async misTimeline(
    @Req() req: Request,
    @Query() filtros: MisTimelineQueryDto
  ): Promise<BaseResponseDto<MisTimelineResponseDto>> {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.listarMisTimeline(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Lista todas las citas con filtros opcionales' })
  @ApiBaseResponseArray(CitaResponseDto)
  @Get()
  async listar(
    @Req() req: Request,
    @Query() filtros: FiltrosCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto[]>> {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)
    const resultado = await this.citasService.listarCitas(
      filtros,
      idUsuarioSolicitante,
      rol
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
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)
    const resultado = await this.citasService.listarCitasPaginadas(
      filtros,
      idUsuarioSolicitante,
      rol
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
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)
    const resultado = await this.citasService.obtenerCantidadCitasPorDia(
      filtros,
      idUsuarioSolicitante,
      rol
    )
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Registra un pago asociado a una cita' })
  @ApiBaseResponse(CitaPagoResponseDto)
  @Post(':id/pagos')
  async registrarPago(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: CrearCitaPagoDto
  ): Promise<BaseResponseDto<CitaPagoResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.registrarPagoCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Lista los pagos registrados de una cita' })
  @ApiBaseResponseArray(CitaPagoResponseDto)
  @Get(':id/pagos')
  async listarPagosPorCita(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<CitaPagoResponseDto[]>> {
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.listarPagosCita(id, rolEjecutor)
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
    const idPersonal = this.getUser(req)
    const rol = this.getRolNombre(req)
    const resultado = await this.citasService.listarMisCitas(
      filtros,
      idPersonal,
      idPersonal,
      rol
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
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)
    const resultado = await this.citasService.obtenerCita(
      id,
      undefined,
      idUsuarioSolicitante,
      rol
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
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.crearCita(
      dto,
      usuarioAuditoria,
      undefined,
      idEjecutor,
      rolEjecutor
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
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.editarBorradorCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
    )
    this.citasGateway.emitCitaActualizada(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Edita una cita en estado programada' })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/editar-programada')
  async editarProgramada(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: EditarProgramadaCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.editarProgramadaCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
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
    const idEjecutor = this.getUser(req)
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
    @Req() req: Request
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const resultado = await this.citasService.confirmarCita(
      id,
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
    const idEjecutor = this.getUser(req)
    const resultado = await this.citasService.rechazarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Completa una atención y registra su pago atómico' })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/completar-atencion')
  async completarAtencion(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: CompletarAtencionConPagoDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.completarAtencionConPago(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary:
      'Programa una cita de control y completa la cita actual manteniendo el historial',
  })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/programar-control')
  async programarControl(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ProgramarControlCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const resultado = await this.citasService.programarControlCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    const citaPrincipalActualizada = await this.citasService.obtenerCita(
      id,
      undefined,
      undefined,
      undefined,
      true
    )
    this.citasGateway.emitCitaEstadoActualizado(citaPrincipalActualizada)
    this.citasGateway.emitCitaReprogramada(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Marca una cita programada como no asistida' })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/no-asistio')
  async marcarNoAsistio(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: MarcarNoAsistioCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
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
    const idEjecutor = this.getUser(req)
    const resultado = await this.citasService.eliminarBorrador(
      id,
      usuarioAuditoria,
      idEjecutor
    )
    this.citasGateway.emitCitaEstadoActualizado(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary:
      'Reprograma citas en estado NO_ASISTIO o CANCELADA, creando una nueva con los datos enviados (excepto paciente)',
  })
  @ApiBaseResponse(CitaResponseDto)
  @Patch(':id/reprogramar')
  async reprogramar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ReprogramarCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const resultado = await this.citasService.reprogramarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    const citaPrincipalActualizada = await this.citasService.obtenerCita(
      id,
      undefined,
      undefined,
      undefined,
      true
    )
    this.citasGateway.emitCitaEstadoActualizado(citaPrincipalActualizada)
    this.citasGateway.emitCitaReprogramada(resultado)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Cancela una cita programada' })
  @ApiBaseResponse(CitaResponseDto)
  @Post(':id/cancelar')
  async cancelarPost(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: CancelarCitaDto
  ): Promise<BaseResponseDto<CitaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
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
