import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/base'
import {
  BaseResponseDto,
  BaseResponseListRowsDto,
} from '@/common/dto/swagger/base-response.dto'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  ApiBaseResponse,
  ApiBaseResponseListRows,
} from '@/common/decorators/api-base-responde.decorator'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { PacienteService } from '../services/paciente.service'
import {
  ActualizarPacienteDto,
  CrearPacienteDto,
  PacienteResponseDto,
} from '../dto/paciente.dto'
import { formatearPaciente } from '../utils/formateo-paciente'

@Controller('pacientes')
@ApiTags('Pacientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PacienteController extends BaseController {
  constructor(private readonly pacienteService: PacienteService) {
    super()
  }

  @ApiOperation({ summary: 'Lista los pacientes registrados' })
  @ApiBaseResponseListRows(PacienteResponseDto)
  @Get()
  async listar(
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<PacienteResponseDto>> {
    const resultado =
      await this.pacienteService.listarPacientes(paginacionQuery)
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de un paciente' })
  @ApiBaseResponse(PacienteResponseDto)
  @Get(':id')
  async obtenerPorId(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<PacienteResponseDto>> {
    const resultado = await this.pacienteService.obtenerPacientePorId(id)
    return this.success(formatearPaciente(resultado))
  }

  @ApiOperation({ summary: 'Crea un nuevo paciente' })
  @ApiBaseResponse(PacienteResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearPacienteDto
  ): Promise<BaseResponseDto<PacienteResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.pacienteService.crearPaciente(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza la información de un paciente' })
  @ApiBaseResponse(PacienteResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarPacienteDto
  ): Promise<BaseResponseDto<PacienteResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.pacienteService.actualizarPaciente(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Elimina un paciente' })
  @ApiBaseResponse(PacienteResponseDto)
  @Delete(':id')
  async eliminar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<PacienteResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.pacienteService.eliminarPaciente(
      id,
      usuarioAuditoria
    )
    return this.successDelete(resultado)
  }

  @ApiOperation({ summary: 'Cambiar estado del paciente' })
  @ApiBaseResponse(PacienteResponseDto)
  @Patch(':id/cambiar-estado')
  async cambiarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<PacienteResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.pacienteService.cambiarEstadoPaciente(
      id,
      usuarioAuditoria
    )
    return this.success(resultado)
  }
}
