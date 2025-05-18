import { Controller, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { EvaluacionNutricionalService } from '../services/evaluacion-nutricional.service'

@ApiTags('Evaluaciones')
@ApiBearerAuth()
@Controller('evaluaciones')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class EvaluacionesController extends BaseController {
  constructor(private citasService: EvaluacionNutricionalService) {
    super()
  }

  // @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  // @Post()
  // async crearCita(@Body() data: CrearCitaDto, @Req() req: Request) {
  //   const usuarioAuditoria = this.getUser(req)
  //   const respuesta = await this.citasService.crearCita(data, usuarioAuditoria)
  //   return this.successCreate(respuesta)
  // }
}
