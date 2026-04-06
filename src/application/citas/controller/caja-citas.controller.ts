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
import { ApiBaseResponse } from '@/common/decorators/api-base-responde.decorator'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import {
  AperturaCajaDto,
  CajaListadoResponseDto,
  CajaMovimientosQueryDto,
  CajaMovimientosResponseDto,
  CajaSesionResponseDto,
  CierreCajaDto,
  ListarCajasQueryDto,
} from '../dto/cita.dto'
import { CitasMedicasService } from '../services/citas-medicas.service'
import { ParamIdDto } from '@/common/dto/params-id.dto'

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

  @ApiOperation({ summary: 'Lista cajas para bandeja/selector' })
  @ApiBaseResponse(CajaListadoResponseDto)
  @Get()
  async listarCajas(
    @Req() req: Request,
    @Query() filtros: ListarCajasQueryDto
  ): Promise<BaseResponseDto<CajaListadoResponseDto>> {
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.listarCajas(filtros, rolEjecutor)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Obtiene detalle de una caja' })
  @ApiBaseResponse(CajaSesionResponseDto)
  @Get(':id')
  async obtenerCaja(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<CajaSesionResponseDto>> {
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.obtenerCajaPorId(id, rolEjecutor)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Lista movimientos paginados de una caja' })
  @ApiBaseResponse(CajaMovimientosResponseDto)
  @Get(':id/movimientos')
  async listarMovimientosCaja(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Query() filtros: CajaMovimientosQueryDto
  ): Promise<BaseResponseDto<CajaMovimientosResponseDto>> {
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.listarMovimientosCaja(
      id,
      filtros,
      rolEjecutor
    )
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

  @ApiOperation({ summary: 'Cierra caja por identificador (solo jefe)' })
  @ApiBaseResponse(CajaSesionResponseDto)
  @Post(':id/cierre')
  async cerrarCajaPorId(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: CierreCajaDto
  ): Promise<BaseResponseDto<CajaSesionResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const idEjecutor = this.getUser(req)
    const rolEjecutor = this.getRolNombre(req)
    const resultado = await this.citasService.cerrarCajaPorId(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor,
      rolEjecutor
    )
    return this.successUpdate(resultado)
  }
}
