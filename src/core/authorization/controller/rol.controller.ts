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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'
import { Request } from 'express'

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
@Controller('autorizacion/roles')
export class RolController extends BaseController {
  constructor(private rolService: RolService) {
    super()
  }

  @ApiOperation({ summary: 'API para obtener el listado de Roles' })
  @Get()
  async listar() {
    const result = await this.rolService.listar()
    return this.successList(result)
  }

  @ApiOperation({ summary: 'API para obtener el listado de todos los Roles' })
  @Get('todos')
  async listarTodos(@Query() paginacionQueryDto: PaginacionQueryDto) {
    const result = await this.rolService.listarTodos(paginacionQueryDto)
    return this.successListRows(result)
  }

  @ApiOperation({ summary: 'API para crear un rol' })
  @ApiBody({
    type: CrearRolDto,
    description: 'new Rol',
    required: true,
  })
  @Post()
  async crear(@Req() req: Request, @Body() rolDto: CrearRolDto) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.rolService.crear(rolDto, usuarioAuditoria)
    return this.successCreate(result)
  }

  @ApiOperation({ summary: 'API para actualizar un rol' })
  @ApiProperty({
    type: ParamIdDto,
  })
  @ApiBody({
    type: ActualizarRolDto,
    description: 'new Rol',
    required: true,
  })
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

  @ApiOperation({ summary: 'API para activar un rol' })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch('/:id/activacion')
  async activar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idRol } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.rolService.activar(idRol, usuarioAuditoria)
    return this.successUpdate(result)
  }

  @ApiOperation({ summary: 'API para inactivar un rol' })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch('/:id/inactivacion')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idRol } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.rolService.inactivar(idRol, usuarioAuditoria)
    return this.successUpdate(result)
  }
}
