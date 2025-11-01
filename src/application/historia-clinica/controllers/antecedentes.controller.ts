import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { AntecedenteService } from '../services/antecedentes.service'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import {
  CerrarAntecedenteDto,
  CreateAntecedenteDto,
  UpdateAntecedenteDto,
} from '../dtos/antecedentes.dto'
import { Request, Response } from 'express'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import fs from 'fs/promises'
import { extname } from 'path'
import { v4 as uuid } from 'uuid'
import {
  EVAL_NUTRI_TEMP_DIR,
  getEvalNutriMaxFiles,
  getEvalNutriMaxFileSizeBytes,
} from '../constants/evaluacion-archivos.constants'
import { fileFilter } from '@/utils/archivos'
import {
  EvaluacionArchivosService,
  EvaluacionArchivoTemporal,
} from '../services/evaluacion-archivos.service'

@ApiTags('Antecedentes clínicos')
@ApiBearerAuth()
@Controller('historias-clinicas')
@UseGuards(JwtAuthGuard)
export class AntecedentesController extends BaseController {
  constructor(
    private readonly antecedenteService: AntecedenteService,
    private readonly evaluacionArchivosService: EvaluacionArchivosService
  ) {
    super()
  }

  @Post(':id/antecedentes')
  @ApiOperation({ summary: 'Crear una nueva versión de antecedentes clínicos' })
  @ApiCreatedResponse({
    description: 'Antecedente creado correctamente',
    type: Object,
  })
  async crearAntecedente(
    @Param() params: ParamIdDto,
    @Body() data: CreateAntecedenteDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const antecedente = await this.antecedenteService.crearAntecedente({
      idHistoriaClinica: params.id,
      data,
      usuarioAuditoria,
    })
    return this.successCreate(antecedente)
  }

  @Patch(':id/antecedentes')
  @ApiOperation({ summary: 'Actualizar un antecedente en estado borrador' })
  @ApiOkResponse({ description: 'Antecedente actualizado correctamente' })
  async actualizarAntecedente(
    @Param() params: ParamIdDto,
    @Body() data: UpdateAntecedenteDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const antecedente = await this.antecedenteService.actualizarAntecedente({
      idHistoriaClinica: params.id,
      data,
      usuarioAuditoria,
    })
    return this.successUpdate(antecedente)
  }

  @Put(':id/antecedentes/cierre')
  @ApiOperation({ summary: 'Cerrar un antecedente y marcarlo como completo' })
  @ApiOkResponse({ description: 'Antecedente cerrado correctamente' })
  async cerrarAntecedente(
    @Param() params: ParamIdDto,
    @Body() data: CerrarAntecedenteDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const antecedente = await this.antecedenteService.cerrarAntecedente({
      idHistoriaClinica: params.id,
      data,
      usuarioAuditoria,
    })
    return this.successUpdate(antecedente)
  }

  @Get(':id/antecedentes')
  @ApiOperation({
    summary: 'Obtener la versión vigente de antecedentes clínicos',
  })
  @ApiOkResponse({ description: 'Antecedente recuperado correctamente' })
  async obtenerVigente(@Param() params: ParamIdDto) {
    const antecedente =
      await this.antecedenteService.buscarAntecedentePorHistoriaClinica(
        params.id
      )
    return this.success(antecedente)
  }

  @Get(':id/antecedentes/versiones')
  @ApiOperation({
    summary: 'Listar todas las versiones de antecedentes clínicos',
  })
  @ApiOkResponse({ description: 'Listado de versiones obtenido con éxito' })
  async listarVersiones(@Param() params: ParamIdDto) {
    const versiones = await this.antecedenteService.listarVersiones(params.id)
    return this.successList(versiones)
  }

  @Get(':id/antecedentes/versiones/:version')
  @ApiOperation({
    summary: 'Obtener una versión específica de antecedentes clínicos',
  })
  @ApiParam({
    name: 'version',
    description: 'Número de versión del antecedente',
  })
  @ApiOkResponse({
    description: 'Versión de antecedente recuperada correctamente',
  })
  async obtenerVersion(
    @Param() params: ParamIdDto,
    @Param('version', ParseIntPipe) version: number
  ) {
    const antecedente = await this.antecedenteService.obtenerVersion({
      idHistoriaClinica: params.id,
      version,
    })
    return this.success(antecedente)
  }

  @Post(':id/antecedentes/:version/archivos')
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
    },
  })
  @ApiOperation({ summary: 'Adjuntar archivos a una versión de antecedente' })
  @ApiParam({
    name: 'version',
    description: 'Número de versión del antecedente',
  })
  @ApiCreatedResponse({ description: 'Archivos adjuntados correctamente' })
  async adjuntarArchivos(
    @Param() params: ParamIdDto,
    @Param('version', ParseIntPipe) version: number,
    @UploadedFiles() archivosAdjuntos: Express.Multer.File[],
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    let archivosTemporales: EvaluacionArchivoTemporal[]
    try {
      archivosTemporales = this.evaluacionArchivosService.mapUploadedFiles(
        archivosAdjuntos ?? []
      )
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error)
      )
    }

    const archivos = await this.antecedenteService.adjuntarArchivos({
      idHistoriaClinica: params.id,
      version,
      archivos: archivosTemporales,
      usuarioAuditoria,
    })

    return this.successCreate(archivos)
  }

  @Delete(':id/antecedentes/:version/archivos/:archivoId')
  @ApiOperation({
    summary: 'Eliminar un archivo asociado a una versión de antecedente',
  })
  @ApiParam({
    name: 'version',
    description: 'Número de versión del antecedente',
  })
  @ApiParam({
    name: 'archivoId',
    description: 'Identificador del archivo adjunto',
  })
  @ApiOkResponse({ description: 'Archivo eliminado correctamente' })
  async eliminarArchivo(
    @Param() params: ParamIdDto,
    @Param('version', ParseIntPipe) version: number,
    @Param('archivoId') archivoId: string,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.antecedenteService.eliminarArchivo({
      idHistoriaClinica: params.id,
      version,
      idArchivo: archivoId,
      usuarioAuditoria,
    })
    return this.successDelete(resultado)
  }

  @Get(':id/antecedentes/:version/archivos/:archivoId')
  @ApiOperation({ summary: 'Descargar un archivo adjunto de antecedentes' })
  @ApiParam({
    name: 'version',
    description: 'Número de versión del antecedente',
  })
  @ApiParam({
    name: 'archivoId',
    description: 'Identificador del archivo adjunto',
  })
  @ApiOkResponse({ description: 'Archivo recuperado correctamente' })
  async descargarArchivo(
    @Param() params: ParamIdDto,
    @Param('version', ParseIntPipe) version: number,
    @Param('archivoId') archivoId: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    this.getUser(req)
    if (!req.user) {
      throw new BadRequestException('No se pudo identificar al usuario')
    }

    const archivo = await this.antecedenteService.obtenerArchivoDescargable({
      idHistoriaClinica: params.id,
      version,
      idArchivo: archivoId,
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
}
