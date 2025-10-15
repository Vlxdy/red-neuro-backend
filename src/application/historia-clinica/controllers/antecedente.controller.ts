import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HistoriaClinicaService } from '../services/historia-clinico.service'
import { EvaluacionNutricionalService } from '../services/evaluacion-nutricional.service'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import {
  CreateEvaluacionAntropometricaDto,
  QueryEvaluacionesDto,
} from '../dtos/evaluacion.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { ComentarioService } from '../services/comentario.service'
import { CrearComentarioDto } from '../dtos/comentario.dto'
import { AntecedenteService } from '../services/antecedentes.service'
import { CreateAntecedenteDto } from '../dtos/antecedentes.dto'

@ApiTags('Historia clinica')
@ApiBearerAuth()
@Controller('historia-clinica')
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
export class HistoriaClinicaController extends BaseController {
  constructor(
    private historiaClinicaService: HistoriaClinicaService,
    private evaluacionNutricionalService: EvaluacionNutricionalService,
    private comentarioService: ComentarioService,
    private antecedenteService: AntecedenteService
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
    @Body() data: CreateEvaluacionAntropometricaDto
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

  @Get(':id/evaluacion-nutricional')
  async listarEvaluacionesNutricinales(
    @Param() params: ParamIdDto,
    // @Req() req: Request,
    @Query() paginacion: QueryEvaluacionesDto
  ) {
    const { id: idHistoriaClinica } = params
    // const usuarioAuditoria = this.getUser(req)
    // const idMedico = this.getUsuarioRol(req)
    const respuesta =
      await this.evaluacionNutricionalService.listarEvaluacionesPorHistoriaClinica(
        {
          idHistoriaClinica,
          paginacion,
        }
      )
    return this.successListRows(respuesta as any)
  }

  @Get(':id/comentarios')
  async listarComentarios(
    @Param() params: ParamIdDto,
    @Query() paginacionQueryDto: PaginacionQueryDto
  ) {
    const { id: idHistoriaClinica } = params
    const result = await this.comentarioService.listarPorRecurso(
      paginacionQueryDto,
      idHistoriaClinica
    )
    return this.successListRows(result)
  }

  @Post(':id/comentarios')
  async crearComentario(
    @Req() req: Request,
    @Body() comentarioDto: CrearComentarioDto,
    @Param() params: ParamIdDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idHistoriaClinica } = params
    const result = await this.comentarioService.crear({
      idUsuarioRol: this.getUsuarioRol(req),
      comentarioDto,
      idHistoriaClinica,
      usuarioAuditoria,
    })
    return this.successCreate(result)
  }

  @Post(':id/antecedentes')
  async crearAntecedente(
    @Req() req: Request,
    @Body() antecedenteDto: CreateAntecedenteDto,
    @Param() params: ParamIdDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idHistoriaClinica } = params
    const result = await this.antecedenteService.crearAntecedente({
      data: antecedenteDto,
      idHistoriaClinica,
      usuarioAuditoria,
    })
    return this.successCreate(result)
  }
}
