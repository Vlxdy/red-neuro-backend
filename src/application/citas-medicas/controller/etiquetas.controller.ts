import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  listar(): BaseResponseDto<EtiquetaResponseDto[]> {
    const resultado = this.citasService.listarEtiquetas()
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Obtiene una etiqueta por su identificador' })
  @ApiBaseResponse(EtiquetaResponseDto)
  @Get(':id')
  obtener(@Param() { id }: ParamIdDto): BaseResponseDto<EtiquetaResponseDto> {
    const resultado = this.citasService.obtenerEtiqueta(id)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Crea una nueva etiqueta' })
  @ApiBaseResponse(EtiquetaResponseDto)
  @Post()
  crear(@Body() dto: CrearEtiquetaDto): BaseResponseDto<EtiquetaResponseDto> {
    const resultado = this.citasService.crearEtiqueta(dto)
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza una etiqueta existente' })
  @ApiBaseResponse(EtiquetaResponseDto)
  @Patch(':id')
  actualizar(
    @Param() { id }: ParamIdDto,
    @Body() dto: ActualizarEtiquetaDto
  ): BaseResponseDto<EtiquetaResponseDto> {
    const resultado = this.citasService.actualizarEtiqueta(id, dto)
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary: 'Elimina una etiqueta y la retira de las citas asociadas',
  })
  @ApiBaseResponse(EtiquetaDeleteResponseDto)
  @Delete(':id')
  eliminar(
    @Param() { id }: ParamIdDto
  ): BaseResponseDto<EtiquetaDeleteResponseDto> {
    const resultado = this.citasService.eliminarEtiqueta(id)
    return this.successDelete(resultado)
  }
}
