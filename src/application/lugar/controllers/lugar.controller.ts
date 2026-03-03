import { BaseController } from '@/common/base'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import {
  BaseResponseDto,
  BaseResponseListRowsDto,
} from '@/common/dto/swagger/base-response.dto'
import {
  ApiBaseResponse,
  ApiBaseResponseListRows,
} from '@/common/decorators/api-base-responde.decorator'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { LugarService } from '../services/lugar.service'
import {
  ActualizarLugarDto,
  CrearLugarDto,
  LugarResponseDto,
} from '../dto/lugar.dto'

@Controller('lugares')
@ApiTags('Lugares')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class LugarController extends BaseController {
  constructor(private readonly service: LugarService) {
    super()
  }

  @ApiOperation({ summary: 'Lista lugares configuradas' })
  @ApiBaseResponseListRows(LugarResponseDto)
  @Get()
  async listar(
    @Query() paginacion: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<LugarResponseDto>> {
    return this.successListRows(await this.service.listar(paginacion))
  }

  @ApiOperation({ summary: 'Crea una institución' })
  @ApiBaseResponse(LugarResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearLugarDto
  ): Promise<BaseResponseDto<LugarResponseDto>> {
    return this.successCreate(await this.service.crear(dto, this.getUser(req)))
  }

  @ApiOperation({ summary: 'Actualiza una institución' })
  @ApiBaseResponse(LugarResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarLugarDto
  ): Promise<BaseResponseDto<LugarResponseDto>> {
    return this.successUpdate(
      await this.service.actualizar(id, dto, this.getUser(req))
    )
  }

  @ApiOperation({ summary: 'Cambia estado de la institución' })
  @ApiBaseResponse(LugarResponseDto)
  @Patch(':id/cambiar-estado')
  async cambiarEstado(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<LugarResponseDto>> {
    return this.success(await this.service.cambiarEstado(id, this.getUser(req)))
  }
}
