import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ActualizarCitaDto, CrearCitaDto } from '../dto/citas.dto'
import { CrearEvaluacionDto } from '../../historia-clinica/dtos/evaluacion.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import { CitasService } from '../services/citas.service'
import { EvaluacionNutricionalService } from '@/application/historia-clinica/services/evaluacion-nutricional.service'
import { HistoriaClinicaService } from '@/application/historia-clinica/services/historia-clinico.service'
import { CrearHistoriaClinicaDto } from '@/application/historia-clinica/dtos/historia-clinica.dto'

@ApiTags('Citas')
@ApiBearerAuth()
@Controller('citas')
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
export class CitasController extends BaseController {
  constructor(
    private citasService: CitasService,
    private evaluacionService: EvaluacionNutricionalService,
    private readonly historiaClinicaService: HistoriaClinicaService
  ) {
    super()
  }

  @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  @Post()
  async crearCita(@Body() data: CrearCitaDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const respuesta = await this.citasService.crearCita(
      idUsuarioRol,
      data,
      usuarioAuditoria
    )
    return this.successCreate(respuesta)
  }

  @ApiOperation({ summary: 'API para crear una evaluación nutricional' })
  @Post(':id/evaluacion')
  async crearEvaluacion(
    @Body() data: CrearEvaluacionDto,
    @Req() req: Request,
    @Param() param: ParamIdDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idCita } = param
    const respuesta = await this.evaluacionService.crearEvaluacion(
      idCita,
      data,
      usuarioAuditoria
    )
    return this.successCreate(respuesta)
  }

  @ApiOperation({ summary: 'API para listar citas medicas de un paciente' })
  @Get()
  async listarCitas(@Req() req: Request) {
    const idRol = this.getRol(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const respuesta = await this.citasService.listarCitas({
      idUsuarioRol,
      idRol,
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

  @ApiOperation({ summary: 'API para crear historial médico' })
  @Post(':id/historial-medico')
  async crearHistoriaClinica(
    @Body() data: CrearHistoriaClinicaDto,
    @Param() param: ParamIdDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idCita } = param
    const respuesta = await this.historiaClinicaService.crearHistoriaClinica({
      idCita,
      idMedico: this.getUsuarioRol(req),
      data,
      usuarioAuditoria,
    })
    return this.successCreate(respuesta)
  }
}
