import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'
import { CitasService } from '../services/citas.service'
import { CrearCitaDto } from '../dto/citas.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'

@ApiTags('Profesionales - Citas')
@ApiBearerAuth()
@Controller('profesionales')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class ProfesionalesCitasController extends BaseController {
  constructor(private readonly citasService: CitasService) {
    super()
  }

  @ApiOperation({
    summary: 'Crear una cita confirmada para un paciente asignado',
    description:
      'Disponible para nutricionistas y administradores. La cita se registra confirmada y notifica inmediatamente al paciente.',
  })
  @ApiCreatedResponse({ description: 'Cita confirmada creada correctamente.' })
  @Post(':id/citas/confirmada')
  async crearCitaConfirmada(
    @Param() param: ParamIdDto,
    @Body() body: CrearCitaDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    const idRol = this.getRol(req)
    const { id: idProfesional } = param

    const resultado = await this.citasService.crearCitaConfirmada({
      idProfesional,
      idRol,
      idUsuarioRol,
      data: body,
      usuarioAuditoria,
    })

    return this.successCreate(resultado)
  }
}
