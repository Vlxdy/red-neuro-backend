import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { BaseController } from '../../../common/base'
import { ParamIdDto } from '../../../common/dto/params-id.dto'
import { Request, Response } from 'express'
import { JwtAuthGuard } from 'src/core/authentication/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { ComentarioService } from '../services/comentario.service'
import { CrearComentarioDto } from '../dtos/comentario.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { promises as fs } from 'fs'
import { extname } from 'path'
import { v4 as uuid } from 'uuid'
import {
  CHAT_TEMP_DIR,
  getChatMaxFileSizeBytes,
  getChatMaxFiles,
} from '../constants/comentario-archivos.constants'
import { chatFileFilter } from '@/utils/archivos'
import { ComentarioArchivosService } from '../services/comentario-archivos.service'
import { enviarArchivoAdjunto } from '../utils/comentario-archivo-response.util'

@ApiTags('Comentarios')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
@Controller('comentarios')
export class ComentarioController extends BaseController {
  constructor(
    private comentarioService: ComentarioService,
    private readonly comentarioArchivosService: ComentarioArchivosService
  ) {
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
      usuarioAuditoria,
      {
        idUsuarioRol: this.getUsuarioRol(req),
        idRol: this.getRol(req),
      }
    )
    return this.successUpdate(result)
  }

  @Patch('/:id/inactivar')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idComentario } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.comentarioService.inactivar(
      idComentario,
      usuarioAuditoria,
      {
        idUsuarioRol: this.getUsuarioRol(req),
        idRol: this.getRol(req),
      }
    )
    return this.successDelete(result)
  }

  @Post(':id/reply')
  @UseInterceptors(
    FilesInterceptor('archivos', getChatMaxFiles(), {
      storage: diskStorage({
        destination: async (_req, _file, cb) => {
          await fs.mkdir(CHAT_TEMP_DIR, { recursive: true })
          cb(null, CHAT_TEMP_DIR)
        },
        filename: (_req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`)
        },
      }),
      fileFilter: chatFileFilter,
      limits: {
        files: getChatMaxFiles(),
        fileSize: getChatMaxFileSizeBytes(),
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      additionalProperties: true,
    },
  })
  async responderComentario(
    @Body() comentarioDto: CrearComentarioDto,
    @Req() req: Request,
    @Param() params: ParamIdDto,
    @UploadedFiles() archivos: Express.Multer.File[]
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idComentarioPadre } = params
    let archivosTemporales: ComentarioArchivoTemporal[] = []
    try {
      archivosTemporales = this.comentarioArchivosService.mapUploadedFiles(
        archivos ?? []
      )
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error)
      )
    }
    const result = await this.comentarioService.responderComentario({
      comentarioDto,
      idComentarioPadre,
      usuarioAuditoria,
      actor: {
        idUsuarioRol: this.getUsuarioRol(req),
        idRol: this.getRol(req),
      },
      archivos: archivosTemporales,
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

  @Get(':id/archivos/:archivoId')
  async descargarArchivo(
    @Param() params: ParamIdDto,
    @Param('archivoId') archivoId: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { id: idComentario } = params

    if (!req.user) {
      throw new BadRequestException('No se pudo identificar al usuario')
    }

    const archivo = await this.comentarioService.obtenerArchivoDescargable({
      idComentario,
      idArchivo: archivoId,
      solicitante: req.user,
    })

    return enviarArchivoAdjunto(res, archivo)
  }
}
