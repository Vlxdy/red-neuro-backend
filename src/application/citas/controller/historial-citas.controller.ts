import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/base'
import { ApiBaseResponseArray } from '@/common/decorators/api-base-responde.decorator'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { CitasMedicasService } from '../services/citas-medicas.service'
import { HistorialCitaResponseDto } from '../dto/cita.dto'

@Controller('citas')
@ApiTags('Historial de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class HistorialCitasController extends BaseController {
  constructor(private readonly citasService: CitasMedicasService) {
    super()
  }

  @ApiOperation({ summary: 'Lista el historial de una cita médica' })
  @ApiBaseResponseArray(HistorialCitaResponseDto)
  @Get(':id/historial')
  async listarHistorial(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<HistorialCitaResponseDto[]>> {
    const resultado = await this.citasService.listarHistorialCita(id)
    return this.successList(resultado)
  }
}
