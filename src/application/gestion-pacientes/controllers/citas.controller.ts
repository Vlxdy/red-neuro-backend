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
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import {
  ActualizarCitaDto,
  CrearCitaDto,
  ListarCitasQueryDto,
  ListarCitasSuccessResponseDto,
} from '../dto/citas.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import { CitasService } from '../services/citas.service'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'

@ApiTags('Citas')
@ApiBearerAuth()
@Controller('citas')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CitasController extends BaseController {
  constructor(private citasService: CitasService) {
    super()
  }

  @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  @Post()
  async crearCita(@Body() data: CrearCitaDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const respuesta = await this.citasService.crearCita({
      data,
      idMedico: idUsuarioRol,
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

  @ApiOperation({ summary: 'API para crear una evaluación nutricional' })
  @Patch(':id')
  async actualizarCita(
    @Body() data: ActualizarCitaDto,
    @Req() req: Request,
    @Param() param: ParamIdDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const { id: idCita } = param
    const respuesta = await this.citasService.actualizarCita({
      data,
      idCita,
      idMedico: idUsuarioRol,
      usuarioAuditoria,
    })
    return this.successCreate(respuesta)
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
    const respuesta = await this.citasService.revisarCita('0')
    return this.successCreate(respuesta)
  }
}
