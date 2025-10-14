import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { EvaluacionNutricionalService } from '../services/evaluacion-nutricional.service'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import {
  ActualizarEvaluacionAntropometricaDto,
  EvaluacionInclude,
  QueryEvaluacionesDto,
} from '../dtos/evaluacion.dto'

@ApiTags('Evaluaciones')
@ApiBearerAuth()
@Controller('evaluacion-nutricional')
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
export class EvaluacionesController extends BaseController {
  constructor(
    private evaluacionesNutricionalesService: EvaluacionNutricionalService
  ) {
    super()
  }

  @ApiOperation({ summary: 'Listar evaluaciones nutricionales' })
  @Get()
  async listarEvaluaciones(@Query() query: QueryEvaluacionesDto) {
    if (!query.historiaClinicaId) {
      throw new BadRequestException(
        'historiaClinicaId es obligatorio para el listado'
      )
    }

    const [evaluaciones, total] =
      await this.evaluacionesNutricionalesService.listarEvaluacionesPorHistoriaClinica(
        {
          idHistoriaClinica: query.historiaClinicaId,
          paginacion: query,
        }
      )
    return this.successListRows([evaluaciones, total])
  }

  @ApiOperation({ summary: 'Obtener una evaluación nutricional' })
  @ApiQuery({
    name: 'include',
    required: false,
    isArray: true,
    enum: [
      'antropometria',
      'bioquimica',
      'dietetica',
      'clinica',
      'psicosocial',
    ],
  })
  @Get(':id')
  async obtenerEvaluacion(
    @Param() params: ParamIdDto,
    @Query('include') include?: EvaluacionInclude[]
  ) {
    const relaciones = Array.isArray(include)
      ? include
      : include
        ? [include]
        : undefined
    const evaluacion =
      await this.evaluacionesNutricionalesService.obtenerEvaluacion(params.id, {
        include: relaciones,
      })
    return this.success(evaluacion)
  }

  @Patch(':id')
  async modificarEvalucacion(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() data: ActualizarEvaluacionAntropometricaDto
  ) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const respuesta =
      await this.evaluacionesNutricionalesService.modificarEvaluacion({
        idEvaluacionNutricional: id,
        data,
        usuarioAuditoria,
      })
    return this.successCreate(respuesta)
  }

  // @ApiOperation({
  //   summary: 'API para obtener todas las evaluaciones nutricionales',
  // })
  // @Get()
  // async obtenerEvaluaciones(@Req() req: Request) {
  //   const usuarioAuditoria = this.getUser(req)
  //   const respuesta =
  //     await this.evaluacionesNutricionalesService.obtenerEvaluacionesNutricionales(
  //       usuarioAuditoria
  //     )
  //   return this.successListRows(respuesta)
  // }

  // @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  // @Post()
  // async crearCita(@Body() data: CrearCitaDto, @Req() req: Request) {
  //   const usuarioAuditoria = this.getUser(req)
  //   const respuesta = await this.citasService.crearCita(data, usuarioAuditoria)
  //   return this.successCreate(respuesta)
  // }
}
