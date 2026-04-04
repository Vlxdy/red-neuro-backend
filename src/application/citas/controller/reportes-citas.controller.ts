import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { BaseController } from '@/common/base'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { ApiBaseResponse } from '@/common/decorators/api-base-responde.decorator'
import { CitasMedicasService } from '../services/citas-medicas.service'
import { ReportePagosQueryDto, ReportePagosResponseDto } from '../dto/cita.dto'

@Controller('reportes')
@ApiTags('Reportes de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class ReportesCitasController extends BaseController {
  constructor(private readonly citasService: CitasMedicasService) {
    super()
  }

  @ApiOperation({
    summary:
      'Reporte de pagos por rango de fechas (agregado por personal, servicio y tipo)',
  })
  @ApiBaseResponse(ReportePagosResponseDto)
  @Get('pagos')
  async reportePagos(
    @Req() req: Request,
    @Query() filtros: ReportePagosQueryDto
  ): Promise<BaseResponseDto<ReportePagosResponseDto>> {
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.obtenerReportePagos(
      filtros,
      rolEjecutor
    )
    return this.success(resultado)
  }
}
