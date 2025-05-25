import { Controller, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { EvaluacionNutricionalService } from '../services/evaluacion-nutricional.service'

@ApiTags('Evaluaciones')
@ApiBearerAuth()
@Controller('evaluaciones-nutricionales')
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
export class EvaluacionesController extends BaseController {
  constructor(
    private evaluacionesNutricionalesService: EvaluacionNutricionalService
  ) {
    super()
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
