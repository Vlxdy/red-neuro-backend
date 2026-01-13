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
  ActualizarEtiquetaDto,
  CrearEtiquetaDto,
  EtiquetaDeleteResponseDto,
  EtiquetaResponseDto,
} from '../dto/etiqueta.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'

@Controller('etiquetas')
@ApiTags('Etiquetas de Citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class EtiquetasController extends BaseController {
  constructor(private readonly citasService: CitasMedicasService) {
    super()
  }

  @ApiOperation({ summary: 'Lista todas las etiquetas disponibles' })
  @ApiBaseResponseArray(EtiquetaResponseDto)
  @Get()
  async listar(): Promise<BaseResponseDto<EtiquetaResponseDto[]>> {
    const resultado = await this.citasService.listarEtiquetas()
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Obtiene una etiqueta por su identificador' })
  @ApiBaseResponse(EtiquetaResponseDto)
  @Get(':id')
  async obtener(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<EtiquetaResponseDto>> {
    const resultado = await this.citasService.obtenerEtiqueta(id)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Crea una nueva etiqueta' })
  @ApiBaseResponse(EtiquetaResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearEtiquetaDto
  ): Promise<BaseResponseDto<EtiquetaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.citasService.crearEtiqueta(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza una etiqueta existente' })
  @ApiBaseResponse(EtiquetaResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarEtiquetaDto
  ): Promise<BaseResponseDto<EtiquetaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.citasService.actualizarEtiqueta(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary: 'Elimina una etiqueta y la retira de las citas asociadas',
  })
  @ApiBaseResponse(EtiquetaDeleteResponseDto)
  @Delete(':id')
  async eliminar(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<EtiquetaDeleteResponseDto>> {
    const resultado = await this.citasService.eliminarEtiqueta(id)
    return this.successDelete(resultado)
  }
}
