import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { BaseController } from '@/common/base'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  ApiBaseResponse,
  ApiBaseResponseListRows,
} from '@/common/decorators/api-base-responde.decorator'
import { CitasMedicasService } from '../services/citas-medicas.service'
import {
  CitaResponseDto,
  HomeBandejaQueryDto,
  HomeBandejaResponseDto,
  HomeProgramadasListadoQueryDto,
  HomeGrupoDiaResponseDto,
  HomeListadoQueryDto,
} from '../dto/cita.dto'

@Controller('citas/home')
@ApiTags('Gestión de Citas Home')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class HomeCitasController extends BaseController {
  constructor(private readonly citasService: CitasMedicasService) {
    super()
  }

  @ApiOperation({
    summary: 'Obtiene la bandeja Home (contadores + preview por bloques)',
  })
  @ApiBaseResponse(HomeBandejaResponseDto)
  @Get('bandeja')
  async homeBandeja(
    @Req() req: Request,
    @Query() filtros: HomeBandejaQueryDto
  ): Promise<BaseResponseDto<HomeBandejaResponseDto>> {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.obtenerHomeBandeja(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.success(resultado)
  }

  @ApiOperation({
    summary: 'Lista incremental de pendientes de aprobación asignadas',
  })
  @ApiBaseResponseListRows(CitaResponseDto)
  @Get('pendientes-aprobacion')
  async homePendientesAprobacion(
    @Req() req: Request,
    @Query() filtros: HomeListadoQueryDto
  ) {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.listarHomePendientesAprobacion(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Lista incremental de rechazadas solicitadas' })
  @ApiBaseResponseListRows(CitaResponseDto)
  @Get('rechazadas-solicitadas')
  async homeRechazadasSolicitadas(
    @Req() req: Request,
    @Query() filtros: HomeListadoQueryDto
  ) {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.listarHomeRechazadasSolicitadas(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Lista incremental de borradores' })
  @ApiBaseResponseListRows(CitaResponseDto)
  @Get('borradores')
  async homeBorradores(
    @Req() req: Request,
    @Query() filtros: HomeListadoQueryDto
  ) {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.listarHomeBorradores(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Lista incremental de citas con pago pendiente' })
  @ApiBaseResponseListRows(CitaResponseDto)
  @Get('pagos-pendientes')
  async homePagosPendientes(
    @Req() req: Request,
    @Query() filtros: HomeListadoQueryDto
  ) {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.listarHomePagosPendientes(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.successListRows(resultado)
  }

  @ApiOperation({
    summary: 'Lista incremental de programadas asignadas agrupadas por día',
  })
  @ApiBaseResponseListRows(HomeGrupoDiaResponseDto)
  @Get('programadas-asignadas')
  async homeProgramadasAsignadas(
    @Req() req: Request,
    @Query() filtros: HomeProgramadasListadoQueryDto
  ) {
    const idUsuarioSolicitante = this.getUser(req)
    const rol = this.getRolNombre(req)

    const resultado = await this.citasService.listarHomeProgramadasAsignadas(
      filtros,
      idUsuarioSolicitante,
      rol
    )

    return this.successListRows(resultado)
  }
}
