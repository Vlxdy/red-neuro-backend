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
  ActualizarAgrupadorDto,
  AgrupadorDeleteResponseDto,
  AgrupadorResponseDto,
  CrearAgrupadorDto,
} from '../dto/agrupador.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'

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
  listar(): BaseResponseDto<AgrupadorResponseDto[]> {
    const resultado = this.citasService.listarAgrupadores()
    return this.successList(resultado)
  }

  @ApiOperation({ summary: 'Obtiene un ambiente/agrupador específico' })
  @ApiBaseResponse(AgrupadorResponseDto)
  @Get(':id')
  obtener(@Param() { id }: ParamIdDto): BaseResponseDto<AgrupadorResponseDto> {
    const resultado = this.citasService.obtenerAgrupador(id)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Crea un nuevo ambiente o agrupador' })
  @ApiBaseResponse(AgrupadorResponseDto)
  @Post()
  crear(@Body() dto: CrearAgrupadorDto): BaseResponseDto<AgrupadorResponseDto> {
    const resultado = this.citasService.crearAgrupador(dto)
    return this.successCreate(resultado)
  }

  @ApiOperation({
    summary: 'Actualiza la información de un ambiente/agrupador',
  })
  @ApiBaseResponse(AgrupadorResponseDto)
  @Patch(':id')
  actualizar(
    @Param() { id }: ParamIdDto,
    @Body() dto: ActualizarAgrupadorDto
  ): BaseResponseDto<AgrupadorResponseDto> {
    const resultado = this.citasService.actualizarAgrupador(id, dto)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Elimina un ambiente/agrupador' })
  @ApiBaseResponse(AgrupadorDeleteResponseDto)
  @Delete(':id')
  eliminar(
    @Param() { id }: ParamIdDto
  ): BaseResponseDto<AgrupadorDeleteResponseDto> {
    const resultado = this.citasService.eliminarAgrupador(id)
    return this.successDelete(resultado)
  }
}
