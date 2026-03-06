import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/base'
import { ApiBaseResponseListRows } from '@/common/decorators/api-base-responde.decorator'
import { BaseResponseListRowsDto } from '@/common/dto/swagger/base-response.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { HistorialCitasService } from '../services/historial-citas.service'
import {
  FiltrosHistorialCitaPaginadoDto,
  HistorialCitaResponseDto,
} from '../dto/cita.dto'

@Controller('citas')
@ApiTags('Historial de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class HistorialCitasController extends BaseController {
  constructor(private readonly historialService: HistorialCitasService) {
    super()
  }

  @ApiOperation({
    summary: 'Lista el historial de una cita médica',
    description:
      'Devuelve el listado paginado del historial con detalle de cambios y datos del ejecutor, incluyendo información de personal/paciente cuando corresponda.',
  })
  @ApiBaseResponseListRows(HistorialCitaResponseDto)
  @Get(':id/historial')
  async listarHistorial(
    @Param() { id }: ParamIdDto,
    @Query() filtros: FiltrosHistorialCitaPaginadoDto
  ): Promise<BaseResponseListRowsDto<HistorialCitaResponseDto>> {
    const resultado = await this.historialService.listarHistorialCita(
      id,
      filtros
    )
    return this.successListRows(resultado)
  }
}
