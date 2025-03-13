import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ConsultasService } from '../service/consultas.service'
import { CrearConsultaDto } from '../dto/asignaciones.dto'

@ApiTags('Consultas')
@ApiBearerAuth()
@Controller('consultas')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class ConsultasController extends BaseController {
  constructor(private consultasService: ConsultasService) {
    super()
  }

  @ApiOperation({ summary: 'API para asignar medicos a los pacientes' })
  @Post()
  async crearConsulta(@Body() data: CrearConsultaDto, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const respuesta = await this.consultasService.crearConsulta(
      data,
      usuarioAuditoria
    )
    return this.successCreate(respuesta)
  }
}
