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
import { RolService } from '../service/rol.service'
import { BaseController } from '../../../common/base'
import { CasbinGuard } from '../guards/casbin.guard'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { CrearRolDto } from '../dto/crear-rol.dto'
import { ParamIdDto } from '../../../common/dto/params-id.dto'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'
import { ActualizarRolDto } from '../dto/actualizar-rol.dto'
import { Request } from 'express'

@UseGuards(JwtAuthGuard, CasbinGuard)
@Controller('autorizacion/roles')
export class RolController extends BaseController {
  constructor(private rolService: RolService) {
    super()
  }

  @Get()
  async listar() {
    const result = await this.rolService.listar()
    return this.successList(result)
  }

  @Get('todos')
  async listarTodos(@Query() paginacionQueryDto: PaginacionQueryDto) {
    const result = await this.rolService.listarTodos(paginacionQueryDto)
    return this.successListRows(result)
  }

  @Post()
  async crear(@Req() req: Request, @Body() rolDto: CrearRolDto) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.rolService.crear(rolDto, usuarioAuditoria)
    return this.successCreate(result)
  }

  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() rolDto: ActualizarRolDto
  ) {
    const { id: idRol } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.rolService.actualizar(
      idRol,
      rolDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @Patch('/:id/activacion')
  async activar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idRol } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.rolService.activar(idRol, usuarioAuditoria)
    return this.successUpdate(result)
  }

  @Patch('/:id/inactivacion')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idRol } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.rolService.inactivar(idRol, usuarioAuditoria)
    return this.successUpdate(result)
  }
}
