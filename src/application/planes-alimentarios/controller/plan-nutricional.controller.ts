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
import {
  ActualizarPlanNutricionalDto,
  CrearPlanNutricionalDto,
} from '../dto/plan-nutricional.dto'
import { PlanNutricionalService } from '../service/plan-nutricional.service'

@Controller('planes-nutricionales')
@UseGuards(JwtAuthGuard)
export class PlanNutricionalController extends BaseController {
  constructor(private readonly service: PlanNutricionalService) {
    super()
  }

  @Post()
  async crear(@Body() data: CrearPlanNutricionalDto, @Req() req: Request) {
    const usuario = this.getUser(req)
    const resultado = await this.service.crear(data, usuario)
    return this.successCreate(resultado)
  }

  @Post('/multiple')
  async crearMultiple(
    @Body() data: CrearPlanNutricionalDto[],
    @Req() req: Request
  ) {
    const usuario = this.getUser(req)
    const resultado = await this.service.crearMultiple(data, usuario)
    return this.successCreate(resultado)
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() data: ActualizarPlanNutricionalDto,
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

  @Get('/paciente/:idUsuarioRol/fecha/:fecha')
  async buscarPorFecha(
    @Param('idUsuarioRol') idUsuarioRol: string,
    @Param('fecha') fecha: string
  ) {
    const resultado = await this.service.buscarPorUsuarioRolYFecha(
      idUsuarioRol,
      fecha
    )
    return this.success(resultado)
  }

  @Get()
  async listarTodos(@Query() paginacion: PaginacionQueryDto) {
    const resultado = await this.service.listarTodos(paginacion)
    return this.successListRows(resultado)
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
