import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CitasService } from '../service/citas.service'
import { CrearCitaDto } from '../dto/citas.dto'
import { EvaluacionService } from '../service/evaluacion.service'
import { CrearEvaluacionDto } from '../dto/evaluacion.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'

@ApiTags('Citas')
@ApiBearerAuth()
@Controller('citas')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CitasController extends BaseController {
  constructor(
    private citasService: CitasService,
    private evaluacionService: EvaluacionService
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
    return this.successCreate(respuesta)
  }
}
