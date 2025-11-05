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
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import {
  ActualizarCitaDto,
  AprobarCitaDto,
  CancelarCitaDto,
  CrearCitaDto,
  CitaDetalleResponseDto,
  ListarCitasQueryDto,
  ListarCitasPorRangoQueryDto,
  ListarAgendaCitasQueryDto,
  ListarCitasSuccessResponseDto,
  ReabrirCitaDto,
  RechazarCitaDto,
  ReprogramarCitaDto,
} from '../dto/citas.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import { CitasService } from '../services/citas.service'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { RolEnumId } from '@/core/authorization/rol.enum'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@ApiTags('Citas')
@ApiBearerAuth()
@Controller('citas')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CitasController extends BaseController {
  constructor(private citasService: CitasService) {
    super()
  }

  @ApiOperation({
    summary: 'Crear una cita desde el panel del profesional',
    description:
      'Registra una nueva cita aprobada asociada al paciente seleccionado. El médico se determina automáticamente según el rol autenticado.',
  })
  @ApiCreatedResponse({ description: 'Cita creada correctamente.' })
  @Post()
  async crearCita(@Body() data: CrearCitaDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const respuesta = await this.citasService.crearCita({
      data,
      idRol,
      idUsuarioRol,
      usuarioAuditoria,
    })
    return this.successCreate(respuesta)
  }

  @ApiOperation({
    summary: 'Listar citas médicas visibles para el usuario autenticado',
    description:
      'Permite filtrar las citas por un rango de fechas opcional. Si no se envía rango, devuelve el mes actual.',
  })
  @ApiQuery({
    name: 'fechaInicio',
    type: String,
    required: false,
    description:
      'Fecha inicial del rango a consultar en formato ISO 8601. Si solo se envía una fecha, se utiliza ese día completo como filtro.',
  })
  @ApiQuery({
    name: 'fechaFin',
    type: String,
    required: false,
    description:
      'Fecha final del rango a consultar en formato ISO 8601. Si solo se envía una fecha, se utiliza ese día completo como filtro.',
  })
  @ApiOkResponse({
    description: 'Listado de citas dentro del rango indicado.',
    type: ListarCitasSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Alguno de los parámetros de fecha tiene un formato inválido o la fecha inicial es posterior a la final.',
  })
  @ApiForbiddenResponse({
    description:
      'El rol autenticado no tiene permisos para acceder a las citas.',
  })
  @Get()
  async listarCitas(@Req() req: Request, @Query() query: ListarCitasQueryDto) {
    const idRol = this.getRol(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const respuesta = await this.citasService.listarCitas({
      idUsuarioRol,
      idRol,
      fechaInicio: query.fechaInicio,
      fechaFin: query.fechaFin,
    })
    return this.successListRows(respuesta as any)
  }

  @ApiOperation({
    summary: 'Listar citas por rango de fechas con filtros avanzados',
    description:
      'Permite aplicar filtros por rango de fechas, estado y rol del usuario autenticado. Si no se envía rango se utiliza el mes actual.',
  })
  @Get('rango-fechas')
  async listarCitasPorRango(
    @Req() req: Request,
    @Query() query: ListarCitasPorRangoQueryDto
  ) {
    const idRol = this.getRol(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const respuesta = await this.citasService.listarCitasPorRango({
      idUsuarioRol,
      idRol,
      fechaInicio: query.fechaInicio,
      fechaFin: query.fechaFin,
      estados: query.estados,
      idPaciente: query.idPaciente,
      idMedico: query.idMedico,
    })

    return this.successListRows(respuesta as any)
  }

  @ApiOperation({
    summary: 'Listar citas paginadas para la agenda',
    description:
      'Devuelve las citas paginadas y ordenadas por fecha más reciente, con filtros opcionales por día, estado y búsqueda.',
  })
  @Get('agenda')
  async listarAgendaCitas(
    @Req() req: Request,
    @Query() query: ListarAgendaCitasQueryDto
  ) {
    const idRol = this.getRol(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const respuesta = await this.citasService.listarAgendaCitas({
      idUsuarioRol,
      idRol,
      paginacion: query,
      fecha: query.fecha,
      estados: query.estados,
      idPaciente: query.idPaciente,
      idMedico: query.idMedico,
    })

    return this.successListRows(respuesta as any)
  }

  @ApiOperation({
    summary: 'Obtener los detalles completos de una cita médica',
    description:
      'Permite consultar la información detallada de una cita de acuerdo a los permisos del paciente, nutricionista o administrador.',
  })
  @ApiOkResponse({
    description: 'Detalle de la cita recuperado correctamente.',
    type: CitaDetalleResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'El usuario no tiene permisos para consultar esta cita.',
  })
  @ApiNotFoundResponse({ description: 'Cita no encontrada.' })
  @Get(':id')
  async obtenerCita(@Param() param: ParamIdDto, @Req() req: Request) {
    const idRol = this.getRol(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const { id: idCita } = param

    const detalle = await this.citasService.obtenerDetalleCita({
      idCita,
      idRol,
      idUsuarioRol,
    })

    return this.success(detalle)
  }

  @ApiOperation({ summary: 'Actualizar los datos de una cita' })
  @Patch(':id')
  async actualizarCita(
    @Body() data: ActualizarCitaDto,
    @Req() req: Request,
    @Param() param: ParamIdDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const { id: idCita } = param
    if (idRol === RolEnumId.PACIENTE) {
      await this.citasService.actualizarCitaPaciente({
        data,
        idCita,
        idRol,
        idUsuarioRol,
        usuarioAuditoria,
      })
      return this.successUpdate({ id: idCita })
    }

    const respuesta = await this.citasService.actualizarCita({
      data,
      idCita,
      idMedico: idUsuarioRol,
      idUsuarioRol,
      usuarioAuditoria,
    })
    return this.successUpdate(respuesta)
  }

  @ApiOperation({ summary: 'Enviar una cita en borrador a revisión' })
  @ApiOkResponse({ description: 'Cita enviada a revisión.' })
  @Post(':id/enviar')
  async enviarCita(@Param() param: ParamIdDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const { id: idCita } = param
    await this.citasService.enviarCitaRevision({
      idCita,
      idRol,
      idUsuarioRol,
      usuarioAuditoria,
    })
    return this.successUpdate({ id: idCita })
  }

  @ApiOperation({ summary: 'Cancelar una cita' })
  @ApiOkResponse({ description: 'Cita cancelada correctamente.' })
  @Post(':id/cancelar')
  async cancelarCita(
    @Param() param: ParamIdDto,
    @Body() body: CancelarCitaDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const { id: idCita } = param

    await this.citasService.cancelarCita({
      idCita,
      idRol,
      idUsuarioRol,
      usuarioAuditoria,
      data: body,
    })
    return this.successUpdate({ id: idCita })
  }

  @ApiOperation({ summary: 'Reabrir una cita pendiente o rechazada' })
  @ApiOkResponse({ description: 'Cita reabierta.' })
  @Post(':id/reabrir')
  async reabrirCita(
    @Param() param: ParamIdDto,
    @Body() body: ReabrirCitaDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const { id: idCita } = param

    await this.citasService.reabrirCita({
      idCita,
      idRol,
      idUsuarioRol,
      usuarioAuditoria,
      data: body,
    })
    return this.successUpdate({ id: idCita })
  }

  @ApiOperation({ summary: 'Aprobar una cita pendiente' })
  @ApiOkResponse({ description: 'Cita aprobada correctamente.' })
  @Post(':id/aprobar')
  async aprobarCita(
    @Param() param: ParamIdDto,
    @Body() body: AprobarCitaDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const { id: idCita } = param

    await this.citasService.aprobarCita({
      idCita,
      idRol,
      idUsuarioRol,
      usuarioAuditoria,
      data: body,
    })
    return this.successUpdate({ id: idCita })
  }

  @ApiOperation({ summary: 'Rechazar una cita pendiente' })
  @ApiOkResponse({ description: 'Cita rechazada correctamente.' })
  @Post(':id/rechazar')
  async rechazarCita(
    @Param() param: ParamIdDto,
    @Body() body: RechazarCitaDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const { id: idCita } = param

    await this.citasService.rechazarCita({
      idCita,
      idRol,
      idUsuarioRol,
      usuarioAuditoria,
      data: body,
    })
    return this.successUpdate({ id: idCita })
  }

  @ApiOperation({ summary: 'Reprogramar una cita aprobada' })
  @ApiOkResponse({ description: 'Cita reprogramada correctamente.' })
  @Post(':id/reprogramar')
  async reprogramarCita(
    @Param() param: ParamIdDto,
    @Body() body: ReprogramarCitaDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const { id: idCita } = param

    await this.citasService.reprogramarCita({
      idCita,
      idRol,
      idUsuarioRol,
      usuarioAuditoria,
      data: body,
    })
    return this.successUpdate({ id: idCita })
  }

  @ApiOperation({ summary: 'Consultar el historial de eventos de una cita' })
  @ApiOkResponse({
    description: 'Historial de la cita.',
  })
  @Get(':id/historial')
  async obtenerHistorial(
    @Param() param: ParamIdDto,
    @Req() req: Request,
    @Query() paginacionQuery: PaginacionQueryDto
  ) {
    const idRol = this.getRol(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const { id: idCita } = param

    const historial = await this.citasService.obtenerHistorialCita({
      idCita,
      idRol,
      idUsuarioRol,
      paginacionQuery,
    })

    return this.successListRows(historial)
  }

  @ApiOperation({ summary: 'API para eliminar una cita' })
  @Delete(':id')
  async eliminarCita(@Param() param: ParamIdDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const { id: idCita } = param
    const respuesta = await this.citasService.eliminarCita({
      id: idCita,
      idMedico: idUsuarioRol,
      usuarioAuditoria,
    })
    return this.successDelete(respuesta)
  }
  @ApiOperation({ summary: 'API para activar el cron de citas' })
  @Get('/cron-activar')
  async activarCitasCron() {
    const respuesta = await this.citasService.revisarCita('0', '0')
    return this.successCreate(respuesta)
  }
}
