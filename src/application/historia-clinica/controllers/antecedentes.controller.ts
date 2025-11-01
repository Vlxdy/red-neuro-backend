import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { BaseController } from '@/common/base'
import {
  ApiBearerAuth,
  ApiBody,
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
import { Request } from 'express'
import { ArchivoAdjuntoDto } from '../dtos/historia-clinica.dto'

@ApiTags('Antecedentes clínicos')
@ApiBearerAuth()
@Controller('historias-clinicas')
@UseGuards(JwtAuthGuard)
export class AntecedentesController extends BaseController {
  constructor(private readonly antecedenteService: AntecedenteService) {
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
  @ApiOperation({ summary: 'Adjuntar un archivo a una versión de antecedente' })
  @ApiParam({
    name: 'version',
    description: 'Número de versión del antecedente',
  })
  @ApiBody({ type: ArchivoAdjuntoDto })
  @ApiCreatedResponse({ description: 'Archivo adjuntado correctamente' })
  async adjuntarArchivo(
    @Param() params: ParamIdDto,
    @Param('version', ParseIntPipe) version: number,
    @Body() data: ArchivoAdjuntoDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const archivo = await this.antecedenteService.adjuntarArchivo({
      idHistoriaClinica: params.id,
      version,
      data,
      usuarioAuditoria,
    })
    return this.successCreate(archivo)
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
}
