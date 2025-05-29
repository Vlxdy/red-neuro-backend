import { BaseController } from '@/common/base'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { CrearCarritoCompraDto } from '../dto/carrito-compra.dto'
import { CarritoCompra } from '../entity/carrito-compra.entity'
import { CarritoCompraService } from '../service/carrito-compra.service'

@Controller('carrito-compras')
@UseGuards(JwtAuthGuard)
export class CarritoCompraController extends BaseController {
  constructor(private readonly service: CarritoCompraService) {
    super()
  }

  @Post()
  async crear(@Body() data: CrearCarritoCompraDto, @Req() req: Request) {
    const usuario = this.getUser(req)
    const resultado = await this.service.crear(data, usuario)
    return this.successCreate(resultado)
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() data: Partial<CarritoCompra>,
    @Req() req: Request
  ) {
    const usuario = this.getUser(req)
    const resultado = await this.service.actualizar(id, data, usuario)
    return this.successUpdate(resultado)
  }

  @Patch(':id/inactivar')
  async inactivar(@Param('id') id: string, @Req() req: Request) {
    const usuario = this.getUser(req)
    const resultado = await this.service.inactivar(id, usuario)
    return this.successUpdate(resultado)
  }

  @Get(':id')
  async buscarPorId(@Param('id', ParseUUIDPipe) id: string) {
    const resultado = await this.service.buscarPorId(id)
    return this.success(resultado)
  }

  @Get('/paciente/:idUsuarioRol')
  async listarPorPaciente(
    @Param('idUsuarioRol') idUsuarioRol: string,
    @Query() paginacion: PaginacionQueryDto
  ) {
    const resultado = await this.service.listarPorIdPaciente(
      idUsuarioRol,
      paginacion
    )
    return this.successListRows(resultado)
  }
}
