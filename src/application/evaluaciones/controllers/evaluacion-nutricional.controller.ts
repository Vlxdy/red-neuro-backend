import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { EvaluacionNutricionalService } from '../services/evaluacion-nutricional.service'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request, Response } from 'express'
import {
  ActualizarEvaluacionAntropometricaDto,
  EvaluacionInclude,
  QueryEvaluacionesDto,
} from '../../historia-clinica/dtos/evaluacion.dto'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { v4 as uuid } from 'uuid'
import {
  EVAL_NUTRI_TEMP_DIR,
  getEvalNutriMaxFileSizeBytes,
  getEvalNutriMaxFiles,
} from '../constants/evaluacion-archivos.constants'
import { promises as fs } from 'fs'
import { fileFilter } from '@/utils/archivos'
import { EvaluacionArchivosService } from '../services/evaluacion-archivos.service'

@ApiTags('Evaluaciones')
@ApiBearerAuth()
@Controller('evaluacion-nutricional')
// @UseGuards(JwtAuthGuard, CasbinGuard)
@UseGuards(JwtAuthGuard)
export class EvaluacionesController extends BaseController {
  constructor(
    private evaluacionesNutricionalesService: EvaluacionNutricionalService,
    private readonly evaluacionArchivosService: EvaluacionArchivosService
  ) {
    super()
  }

  @ApiOperation({ summary: 'Listar evaluaciones nutricionales' })
  @Get()
  async listarEvaluaciones(@Query() query: QueryEvaluacionesDto) {
    if (!query.historiaClinicaId) {
      throw new BadRequestException(
        'historiaClinicaId es obligatorio para el listado'
      )
    }

    const [evaluaciones, total] =
      await this.evaluacionesNutricionalesService.listarEvaluacionesPorHistoriaClinica(
        {
          idHistoriaClinica: query.historiaClinicaId,
          paginacion: query,
        }
      )
    return this.successListRows([evaluaciones, total])
  }

  @ApiOperation({ summary: 'Obtener una evaluación nutricional' })
  @ApiQuery({
    name: 'include',
    required: false,
    isArray: true,
    enum: [
      'antropometria',
      'bioquimica',
      'dietetica',
      'clinica',
      'psicosocial',
    ],
  })
  @Get(':id')
  async obtenerEvaluacion(
    @Param() params: ParamIdDto,
    @Query('include') include?: EvaluacionInclude[]
  ) {
    const relaciones = Array.isArray(include)
      ? include
      : include
        ? [include]
        : undefined
    const evaluacion =
      await this.evaluacionesNutricionalesService.obtenerEvaluacion(params.id, {
        include: relaciones,
      })
    return this.success(evaluacion)
  }

  @ApiOperation({
    summary: 'Descargar un archivo adjunto de la evaluación nutricional',
  })
  @Get(':id/archivos/:archivoId')
  async descargarArchivo(
    @Param('id') idEvaluacion: string,
    @Param('archivoId') idArchivo: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    this.getUser(req)
    if (!req.user) {
      throw new BadRequestException('No se pudo identificar al usuario')
    }

    const archivo =
      await this.evaluacionesNutricionalesService.obtenerArchivoDescargable({
        idEvaluacion,
        idArchivo,
        solicitante: req.user,
      })

    const dispositionName = encodeURIComponent(archivo.nombreArchivo)
    const fallbackName = archivo.nombreArchivo.replace(/"/g, "'")
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fallbackName}"; filename*=UTF-8''${dispositionName}`
    )
    res.setHeader('Content-Type', archivo.mimeType)

    if (archivo.tipo === 'path') {
      return res.sendFile(archivo.path)
    }

    return res.send(archivo.buffer)
  }

  @Patch(':id')
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
  async modificarEvaluacion(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() data: ActualizarEvaluacionAntropometricaDto,
    @UploadedFiles() archivos: Express.Multer.File[]
  ) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    let archivosTemporales
    try {
      archivosTemporales = this.evaluacionArchivosService.mapUploadedFiles(
        archivos ?? []
      )
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error)
      )
    }
    const respuesta =
      await this.evaluacionesNutricionalesService.modificarEvaluacion({
        idEvaluacionNutricional: id,
        data,
        usuarioAuditoria,
        archivos: archivosTemporales,
      })
    return this.successCreate(respuesta)
  }
}
