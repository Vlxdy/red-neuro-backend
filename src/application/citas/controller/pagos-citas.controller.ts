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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { BaseController } from '@/common/base'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  ApiBaseResponse,
  ApiBaseResponseArray,
} from '@/common/decorators/api-base-responde.decorator'
import { CitasMedicasService } from '../services/citas-medicas.service'
import {
  AnularCitaPagoDto,
  CitaPagoResponseDto,
  CorregirCitaPagoDto,
  HomeListadoQueryDto,
} from '../dto/cita.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'

@Controller('pagos')
@ApiTags('Gestión de Pagos de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PagosCitasController extends BaseController {
  constructor(private readonly citasService: CitasMedicasService) {
    super()
  }

  @ApiOperation({
    summary: 'Lista la bandeja de pagos pendientes por regularizar',
  })
  @ApiBaseResponseArray(CitaPagoResponseDto)
  @Get('pendientes')
  async listarPendientes(
    @Req() req: Request,
    @Query() filtros: HomeListadoQueryDto
  ): Promise<BaseResponseDto<CitaPagoResponseDto[]>> {
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.listarPagosPendientes(
      rolEjecutor,
      filtros.idLugar
    )
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Anula un pago de cita registrado previamente' })
  @ApiBaseResponse(CitaPagoResponseDto)
  @Post(':id/anular')
  async anularPago(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: AnularCitaPagoDto
  ): Promise<BaseResponseDto<CitaPagoResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.anularPagoCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary:
      'Corrige un pago creando un nuevo registro y marcando el anterior como reemplazado',
  })
  @ApiBaseResponse(CitaPagoResponseDto)
  @Post(':id/corregir')
  async corregirPago(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: CorregirCitaPagoDto
  ): Promise<BaseResponseDto<CitaPagoResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.corregirPagoCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
    )
    return this.successUpdate(resultado)
  }
}
