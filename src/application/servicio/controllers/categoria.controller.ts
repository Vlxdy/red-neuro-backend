import {
  Body,
  Controller,
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
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { CategoriaService } from '../services/categoria.service'
import {
  ActualizarCategoriaDto,
  CategoriaResponseDto,
  CrearCategoriaDto,
  ListarCategoriasQueryDto,
} from '../dto/categoria.dto'
import { formatearCategoria } from '../utils/formateo.categoria'

@Controller('categorias')
@ApiTags('Categorías')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CategoriaController extends BaseController {
  constructor(private readonly categoriaService: CategoriaService) {
    super()
  }

  @ApiOperation({ summary: 'Lista las categorías configuradas' })
  @ApiBaseResponseListRows(CategoriaResponseDto)
  @Get()
  async listar(
    @Query() paginacionQuery: ListarCategoriasQueryDto
  ): Promise<BaseResponseListRowsDto<CategoriaResponseDto>> {
    const resultado =
      await this.categoriaService.listarCategorias(paginacionQuery)
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de una categoría' })
  @ApiBaseResponse(CategoriaResponseDto)
  @Get(':id')
  async obtenerPorId(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<CategoriaResponseDto>> {
    const resultado = await this.categoriaService.obtenerCategoriaPorId(id)
    return this.success(formatearCategoria(resultado))
  }

  @ApiOperation({ summary: 'Crea una categoría' })
  @ApiBaseResponse(CategoriaResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearCategoriaDto
  ): Promise<BaseResponseDto<CategoriaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.categoriaService.crearCategoria(
      dto,
      usuarioAuditoria
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza una categoría' })
  @ApiBaseResponse(CategoriaResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarCategoriaDto
  ): Promise<BaseResponseDto<CategoriaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.categoriaService.actualizarCategoria(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary: 'Cambiar estado de la categoría (activar/inactivar)',
  })
  @ApiBaseResponse(CategoriaResponseDto)
  @Patch(':id/cambiar-estado')
  async cambiarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<CategoriaResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.categoriaService.cambiarEstadoCategoria(
      id,
      usuarioAuditoria
    )
    return this.success(resultado)
  }
}
