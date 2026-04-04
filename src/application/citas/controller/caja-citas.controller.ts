import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { BaseController } from '@/common/base'
import { ApiBaseResponse } from '@/common/decorators/api-base-responde.decorator'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import {
  AperturaCajaDto,
  CajaSesionResponseDto,
  CierreCajaDto,
} from '../dto/cita.dto'
import { CitasMedicasService } from '../services/citas-medicas.service'

@Controller('caja')
@ApiTags('Caja de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CajaCitasController extends BaseController {
  constructor(private readonly citasService: CitasMedicasService) {
    super()
  }

  @ApiOperation({ summary: 'Obtiene la caja actualmente abierta' })
  @ApiBaseResponse(CajaSesionResponseDto)
  @Get('actual')
  async cajaActual(
    @Req() req: Request
  ): Promise<BaseResponseDto<CajaSesionResponseDto | null>> {
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.obtenerCajaActual(rolEjecutor)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Abre una nueva caja manualmente (solo jefe)' })
  @ApiBaseResponse(CajaSesionResponseDto)
  @Post('apertura')
  async abrirCaja(
    @Req() req: Request,
    @Body() dto: AperturaCajaDto
  ): Promise<BaseResponseDto<CajaSesionResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.abrirCaja(
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Cierra caja manualmente (solo jefe)' })
  @ApiBaseResponse(CajaSesionResponseDto)
  @Post('cierre')
  async cerrarCaja(
    @Req() req: Request,
    @Body() dto: CierreCajaDto
  ): Promise<BaseResponseDto<CajaSesionResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.cerrarCaja(
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
    )
    return this.successUpdate(resultado)
  }
}
