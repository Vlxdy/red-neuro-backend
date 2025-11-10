import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { HistoriaClinicaService } from '../services/historia-clinico.service'
import { EvaluacionNutricionalService } from '../../evaluaciones/services/evaluacion-nutricional.service'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request, Response } from 'express'
import {
  CreateEvaluacionAntropometricaDto,
  QueryEvaluacionesDto,
} from '../dtos/evaluacion.dto'
import { ComentarioService } from '../../comunicacion/services/comentario.service'
import { CrearComentarioDto } from '../dtos/comentario.dto'
import { AntecedenteService } from '../services/antecedentes.service'
import { CreateAntecedenteDto } from '../dtos/antecedentes.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { promises as fs } from 'fs'

import { v4 as uuid } from 'uuid'

import { chatFileFilter, fileFilter } from '@/utils/archivos'
import {
  CHAT_TEMP_DIR,
  getChatMaxFileSizeBytes,
  getChatMaxFiles,
} from '../constants/comentario-archivos.constants'
import {
  ComentarioArchivosService,
  ComentarioArchivoTemporal,
} from '../../comunicacion/services/comentario-archivos.service'
import { enviarArchivoAdjunto } from '../utils/comentario-archivo-response.util'
import { EvaluacionArchivosService } from '@/application/evaluaciones/services/evaluacion-archivos.service'
import {
  EVAL_NUTRI_TEMP_DIR,
  getEvalNutriMaxFiles,
  getEvalNutriMaxFileSizeBytes,
} from '@/application/evaluaciones/constants/evaluacion-archivos.constants'

@ApiTags('Historia clinica')
@ApiBearerAuth()
@Controller('historia-clinica')
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
export class HistoriaClinicaController extends BaseController {
  constructor(
    private historiaClinicaService: HistoriaClinicaService,
    private evaluacionNutricionalService: EvaluacionNutricionalService,
    private comentarioService: ComentarioService,
    private antecedenteService: AntecedenteService,
    private readonly evaluacionArchivosService: EvaluacionArchivosService,
    private readonly comentarioArchivosService: ComentarioArchivosService
  ) {
    super()
  }

  @Post(':id/evaluacion-nutricional')
  @UseInterceptors(
    FilesInterceptor('archivosAdjuntos', getEvalNutriMaxFiles(), {
      storage: diskStorage({
        destination: async (_req, _file, cb) => {
          await fs.mkdir(EVAL_NUTRI_TEMP_DIR, { recursive: true })
          cb(null, EVAL_NUTRI_TEMP_DIR)
        },
        filename: (_req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`)
        },
      }),
      fileFilter,
      limits: {
        files: getEvalNutriMaxFiles(),
        fileSize: getEvalNutriMaxFileSizeBytes(),
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivosAdjuntos: {
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
  async crearEvaluacionNutricional(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() data: CreateEvaluacionAntropometricaDto,
    @UploadedFiles() archivosAdjuntos: Express.Multer.File[]
  ) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const idMedico = this.getUsuarioRol(req)
    const usuarioRol = this.getRol(req)
    let archivosTemporales
    try {
      archivosTemporales = this.evaluacionArchivosService.mapUploadedFiles(
        archivosAdjuntos ?? []
      )
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error)
      )
    }
    const respuesta = await this.evaluacionNutricionalService.crearEvaluacion({
      idHistoriaClinica: id,
      data,
      usuarioRol,
      usuarioAuditoria,
      idMedico,
      archivos: archivosTemporales,
    })
    return this.successCreate(respuesta)
  }

  @Get(':id/evaluacion-nutricional')
  async listarEvaluacionesNutricinales(
    @Param() params: ParamIdDto,
    // @Req() req: Request,
    @Query() paginacion: QueryEvaluacionesDto
  ) {
    const { id: idHistoriaClinica } = params
    // const usuarioAuditoria = this.getUser(req)
    // const idMedico = this.getUsuarioRol(req)
    const respuesta =
      await this.evaluacionNutricionalService.listarEvaluacionesPorHistoriaClinica(
        {
          idHistoriaClinica,
          paginacion,
        }
      )
    return this.successListRows(respuesta as any)
  }

  @Get(':id/comentarios')
  async listarComentarios(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Query() paginacionQueryDto: PaginacionQueryDto
  ) {
    const { id: idHistoriaClinica } = params
    const result = await this.comentarioService.listarPorRecurso({
      paginacionQueryDto,
      idHistoriaClinica,
      actor: {
        idUsuarioRol: this.getUsuarioRol(req),
        idRol: this.getRol(req),
      },
    })
    return this.successListRows(result)
  }

  @Get(':id/comentarios/:comentarioId/archivos/:archivoId')
  async descargarArchivoComentario(
    @Param('id') idHistoriaClinica: string,
    @Param('comentarioId') comentarioId: string,
    @Param('archivoId') archivoId: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    if (!req.user) {
      throw new BadRequestException('No se pudo identificar al usuario')
    }

    const archivo = await this.comentarioService.obtenerArchivoDescargable({
      idComentario: comentarioId,
      idArchivo: archivoId,
      solicitante: req.user as any,
      idHistoriaClinica,
    })

    return enviarArchivoAdjunto(res, archivo)
  }

  @Post(':id/comentarios')
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
  async crearComentario(
    @Req() req: Request,
    @Body() comentarioDto: CrearComentarioDto,
    @Param() params: ParamIdDto,
    @UploadedFiles() archivos: Express.Multer.File[]
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idHistoriaClinica } = params
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
    const result = await this.comentarioService.crear({
      comentarioDto,
      idHistoriaClinica,
      usuarioAuditoria,
      actor: {
        idUsuarioRol: this.getUsuarioRol(req),
        idRol: this.getRol(req),
      },
      archivos: archivosTemporales,
    })
    return this.successCreate(result)
  }

  @Post(':id/antecedentes')
  async crearAntecedente(
    @Req() req: Request,
    @Body() antecedenteDto: CreateAntecedenteDto,
    @Param() params: ParamIdDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idHistoriaClinica } = params
    const result = await this.antecedenteService.crearAntecedente({
      data: antecedenteDto,
      idHistoriaClinica,
      usuarioAuditoria,
    })
    return this.successCreate(result)
  }

  @Get()
  async obtenerHistoriasClinica(@Req() req: Request) {
    const idPaciente = this.getUsuarioRol(req)
    const historiasClinicas =
      await this.historiaClinicaService.obtenerHistoriaClinicaPorPacienteCompleto(
        {
          idPaciente,
        }
      )
    return this.success(historiasClinicas)
  }
}
