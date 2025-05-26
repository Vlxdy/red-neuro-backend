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
import { BaseController } from '../../../common/base'
import { ParamIdDto } from '../../../common/dto/params-id.dto'
import { Request } from 'express'
import { JwtAuthGuard } from 'src/core/authentication/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ComentarioService } from '../services/comentario.service'
import { CrearComentarioDto } from '../dtos/comentario.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@ApiTags('Comentarios')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
@Controller('comentarios')
export class ComentarioController extends BaseController {
  constructor(private comentarioService: ComentarioService) {
    super()
  }

  @Patch('/:id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() comentarioDto: CrearComentarioDto
  ) {
    const { id: idComentario } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.comentarioService.actualizar(
      idComentario,
      comentarioDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @Patch('/:id/inactivar')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idComentario } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.comentarioService.inactivar(
      idComentario,
      usuarioAuditoria
    )
    return this.successDelete(result)
  }

  @Post(':id/reply')
  async responderComentario(
    @Body() comentarioDto: CrearComentarioDto,
    @Req() req: Request,
    @Param() params: ParamIdDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idComentarioPadre } = params
    const result = await this.comentarioService.responderComentario({
      comentarioDto,
      idComentarioPadre,
      usuarioAuditoria,
      idUsuarioRol: this.getUsuarioRol(req),
    })
    return this.successCreate(result)
  }

  @Get()
  async listarComentarios(
    @Req() req: Request,
    @Query() paginacionQueryDto: PaginacionQueryDto
  ) {
    const idUsuarioRol = this.getUsuarioRol(req)
    const result = await this.comentarioService.listarComentariosPaciente({
      idPaciente: idUsuarioRol,
      paginacionQueryDto,
    })
    return this.success(result)
  }
}
