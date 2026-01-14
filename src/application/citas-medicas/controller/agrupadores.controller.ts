import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/base'
import { BaseResponseDto } from '@/common/dto/swagger/base-response.dto'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  ApiBaseResponse,
  ApiBaseResponseArray,
} from '@/common/decorators/api-base-responde.decorator'
import { CitasMedicasService } from '../citas-medicas.service'
import {
  ActualizarAgrupadorDto,
  AgrupadorDeleteResponseDto,
  AgrupadorResponseDto,
  CrearAgrupadorDto,
} from '../dto/agrupador.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'

@Controller('agrupadores')
@ApiTags('Ambientes / Agrupadores de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class AgrupadoresController extends BaseController {
  constructor(private readonly citasService: CitasMedicasService) {
    super()
  }

  @ApiOperation({ summary: 'Lista los ambientes o agrupadores configurados' })
  @ApiBaseResponseArray(AgrupadorResponseDto)
  @Get()
  async listar(): Promise<BaseResponseDto<AgrupadorResponseDto[]>> {
    const resultado = await this.citasService.listarAgrupadores()
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Obtiene un ambiente/agrupador específico' })
  @ApiBaseResponse(AgrupadorResponseDto)
  @Get(':id')
  async obtener(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<AgrupadorResponseDto>> {
    const resultado = await this.citasService.obtenerAgrupador(id)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Crea un nuevo ambiente o agrupador' })
  @ApiBaseResponse(AgrupadorResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearAgrupadorDto
  ): Promise<BaseResponseDto<AgrupadorResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.citasService.crearAgrupador(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({
    summary: 'Actualiza la información de un ambiente/agrupador',
  })
  @ApiBaseResponse(AgrupadorResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarAgrupadorDto
  ): Promise<BaseResponseDto<AgrupadorResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.citasService.actualizarAgrupador(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Elimina un ambiente/agrupador' })
  @ApiBaseResponse(AgrupadorDeleteResponseDto)
  @Delete(':id')
  async eliminar(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<AgrupadorDeleteResponseDto>> {
    const resultado = await this.citasService.eliminarAgrupador(id)
    return this.successDelete(resultado)
  }
}
