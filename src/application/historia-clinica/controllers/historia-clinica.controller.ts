import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HistoriaClinicaService } from '../services/historia-clinico.service'
import { EvaluacionNutricionalService } from '../services/evaluacion-nutricional.service'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import { CrearEvaluacionDto } from '../dtos/evaluacion.dto'

@ApiTags('Historia clinica')
@ApiBearerAuth()
@Controller('historia-clinica')
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
export class HistoriaClinicaController extends BaseController {
  constructor(
    private historiaClinicaService: HistoriaClinicaService,
    private evaluacionNutricionalService: EvaluacionNutricionalService
  ) {
    super()
  }

  // @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  // @Post()
  // async crearCita(@Body() data: CrearCitaDto, @Req() req: Request) {
  //   const usuarioAuditoria = this.getUser(req)
  //   const respuesta = await this.citasService.crearCita(data, usuarioAuditoria)
  //   return this.successCreate(respuesta)
  // }
  @Post(':id/evaluacion-nutricional')
  async crearEvaluacionNutricional(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() data: CrearEvaluacionDto
  ) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const idMedico = this.getUsuarioRol(req)
    const respuesta = await this.evaluacionNutricionalService.crearEvaluacion({
      idHistoriaClinica: id,
      data,
      usuarioAuditoria,
      idMedico,
    })
    return this.successCreate(respuesta)
  }
}
