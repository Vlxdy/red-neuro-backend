import {
  Controller,
  Get,
  Param,
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

@ApiTags('Pacientes')
@ApiBearerAuth()
@Controller('pacientes')
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
export class PacientesController extends BaseController {
  constructor(
    private pacientesService: PacientesService,
    private readonly historiaClinicaService: HistoriaClinicaService
  ) {
    super()
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
    return this.successListRows(result as any)
  }

  @Get()
  async listarPacientes(@Query() paginacionQueryDto: PaginacionQueryDto) {
    console.log('paginacionQueryDto', paginacionQueryDto)

    const result =
      await this.pacientesService.listarPacientes(paginacionQueryDto)
    return this.successListRows(result as any)
  }

  @Get(':id/historia-clinica')
  async obtenerHistoriaClinica(
    @Param() params: ParamIdDto,
    @Req() req: Request
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const idMedico = this.getUsuarioRol(req)
    const { id: idPaciente } = params
    const historiaClinica =
      await this.historiaClinicaService.obtenerHistoriaClinicaPorPacienteCompleto(
        {
          idPaciente,
        }
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
    console.log('esto esta en idMedico', idMedico)
    const reportePdf = await this.pacientesService.ReportePaciente(
      idMedico,
      idPaciente
    )
    response.setHeader('Content-Type', 'application/pdf')
    reportePdf.pipe(response)
    reportePdf.end()
  }
}
