import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { PacientesService } from '../services/pacientes.service'
import { PacientesAsignadosDto } from '../dto/usuarios-registrados.dto'
import { HistoriaClinicaService } from '@/application/historia-clinica/services/historia-clinico.service'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { CitasService } from '../services/citas.service'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { ActualizarDatosPersonalesPacienteDto } from '../dto/actualizar-datos-paciente.dto'
import {
  ActualizarPacienteDto,
  CrearPacienteDto,
} from '../dto/crear-paciente.dto'

@ApiTags('Pacientes')
@ApiBearerAuth()
@Controller('pacientes')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PacientesController extends BaseController {
  constructor(
    private pacientesService: PacientesService,
    private readonly historiaClinicaService: HistoriaClinicaService,
    private readonly citasService: CitasService
  ) {
    super()
  }

  @ApiOperation({ summary: 'Crear un nuevo paciente' })
  @Post()
  async crearPaciente(@Body() body: CrearPacienteDto, @Req() req: Request) {
    const idUsuarioRol = this.getUsuarioRol(req)
    const usuarioAuditoria = this.getUser(req)

    const resultado = await this.pacientesService.crearPaciente({
      datos: body,
      idUsuarioRol,
      usuarioAuditoria,
    })

    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualizar los datos de un paciente' })
  @Put(':id')
  async actualizarPaciente(
    @Param() params: ParamIdDto,
    @Body() body: ActualizarPacienteDto,
    @Req() req: Request
  ) {
    const { id } = params
    const idUsuarioRol = this.getUsuarioRol(req)
    const usuarioAuditoria = this.getUser(req)

    const resultado = await this.pacientesService.actualizarPaciente({
      idPaciente: id,
      datos: body,
      idUsuarioRol,
      usuarioAuditoria,
    })

    return this.successUpdate(resultado)
  }
  @ApiOperation({ summary: 'Listar pacientes asignados a un medico' })
  @Get('asignados')
  async asignarPacienteAMedico(
    @Query() paginacionQueryDto: PacientesAsignadosDto,
    @Req() req: Request
  ) {
    const idUsuarioRol = this.getUsuarioRol(req)
    // const usuarioAuditoria = this.getUser(req)

    const result = await this.pacientesService.listarPacientePorMedico(
      paginacionQueryDto,
      idUsuarioRol
    )
    return this.successListRows(result)
  }

  @Get()
  async listarPacientes(@Query() paginacionQueryDto: PaginacionQueryDto) {
    const result =
      await this.pacientesService.listarPacientes(paginacionQueryDto)
    return this.successListRows(result as any)
  }

  @Get(':id/historia-clinica')
  async obtenerHistoriaClinica(
    @Param() params: ParamIdDto,
    @Req() req: Request
  ) {
    // TODO: Validar que solo muestre a los medicos que estan autorizados
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const idMedico = this.getUsuarioRol(req)
    const { id: idPaciente } = params
    const historiaClinica =
      await this.historiaClinicaService.obtenerHistoriaClinicaPorPacienteCompleto(
        { idPaciente }
      )
    return this.success(historiaClinica)
  }

  @Get(':id/reporte')
  async obtenerReporteDePaciente(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Res() response: Response
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const idMedico = '3' //this.getUsuarioRol(req)
    const { id: idPaciente } = params
    const reportePdf = await this.pacientesService.ReportePaciente({
      usuarioAuditoria: idMedico,
      idPaciente,
    })
    response.setHeader('Content-Type', 'application/pdf')
    reportePdf.pipe(response)
    reportePdf.end()
  }

  @Get(':id/citas')
  async obtenerCitasPorPaciente(
    @Param() params: ParamIdDto,
    @Query() query: PaginacionQueryDto
  ) {
    const { id: idPaciente } = params

    const citas = await this.citasService.obtenerCitasPorPacientePaginado({
      idPaciente,
      paginacion: query,
    })
    return this.successListRows(citas)
  }

  @ApiOperation({
    summary:
      'Actualizar los datos de contacto y género de un paciente asignado',
  })
  @Patch(':id/datos-personales')
  async actualizarDatosPersonalesPaciente(
    @Param() params: ParamIdDto,
    @Body() body: ActualizarDatosPersonalesPacienteDto,
    @Req() req: Request
  ) {
    const { id: idPaciente } = params
    const idNutricionista = this.getUsuarioRol(req)
    const usuarioAuditoria = this.getUser(req)

    const resultado =
      await this.pacientesService.actualizarDatosPersonalesPaciente({
        idPaciente,
        idNutricionista,
        usuarioAuditoria,
        datos: body,
      })

    return this.successUpdate(resultado)
  }
}
