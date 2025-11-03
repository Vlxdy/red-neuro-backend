import { BaseController } from '@/common/base'
import {
  PaginacionQueryDto,
  RangoFechasQueryDto,
} from '@/common/dto/paginacion-query.dto'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  Body,
  Controller,
  ForbiddenException,
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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import {
  ActualizarPlanNutricionalDto,
  CrearPlanNutricionalDto,
  GenerarPlanNutricionalDto,
  GetPlanNutricionalParamsDto,
  PlanNutricionalGeneradoResponseDto,
  PlanNutricionalSeguimientoResponseDto,
  RegistrarSeguimientoPlanDto,
} from '../dto/plan-nutricional.dto'
import { PlanNutricionalService } from '../service/plan-nutricional.service'
import { RolEnumId } from '@/core/authorization/rol.enum'

@ApiTags('Planes nutricionales')
@ApiBearerAuth()
@Controller('planes-nutricionales')
@UseGuards(JwtAuthGuard)
export class PlanNutricionalController extends BaseController {
  constructor(private readonly service: PlanNutricionalService) {
    super()
  }

  private asegurarProfesional(idRol: string) {
    if (
      idRol !== RolEnumId.ADMINISTRADOR &&
      idRol !== RolEnumId.NUTRICIONISTA
    ) {
      throw new ForbiddenException(
        'No tiene permisos para ejecutar esta acción.'
      )
    }
  }

  private validarConsultaPaciente(
    idRol: string,
    idUsuarioRolAutenticado: string,
    idSolicitado: string
  ) {
    if (
      idRol === RolEnumId.PACIENTE &&
      idUsuarioRolAutenticado !== idSolicitado
    ) {
      throw new ForbiddenException(
        'Solo puede consultar los planes asociados a su cuenta.'
      )
    }
  }

  @ApiOperation({
    summary: 'Generar un plan nutricional automáticamente sin persistirlo',
  })
  @ApiCreatedResponse({ type: PlanNutricionalGeneradoResponseDto })
  @Post('generar')
  async generar(@Body() data: GenerarPlanNutricionalDto, @Req() req: Request) {
    const idRol = this.getRol(req)
    this.asegurarProfesional(idRol)
    this.getUser(req)
    const resultado = await this.service.generar(data)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Crear un plan nutricional' })
  @ApiCreatedResponse({ type: PlanNutricionalGeneradoResponseDto })
  @Post()
  async crear(@Body() data: CrearPlanNutricionalDto, @Req() req: Request) {
    const usuario = this.getUser(req)
    const idRol = this.getRol(req)
    this.asegurarProfesional(idRol)
    const resultado = await this.service.crear(data, usuario)
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Crear múltiples planes nutricionales' })
  @Post('/multiple')
  async crearMultiple(
    @Body() data: CrearPlanNutricionalDto[],
    @Req() req: Request
  ) {
    const usuario = this.getUser(req)
    const idRol = this.getRol(req)
    this.asegurarProfesional(idRol)
    const resultado = await this.service.crearMultiple(data, usuario)
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualizar un plan nutricional existente' })
  @ApiOkResponse({ type: PlanNutricionalGeneradoResponseDto })
  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() data: ActualizarPlanNutricionalDto,
    @Req() req: Request
  ) {
    const usuario = this.getUser(req)
    const idRol = this.getRol(req)
    this.asegurarProfesional(idRol)
    const resultado = await this.service.actualizar(id, data, usuario)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Inactivar un plan nutricional' })
  @Patch(':id/inactivar')
  async inactivar(@Param('id') id: string, @Req() req: Request) {
    const usuario = this.getUser(req)
    const idRol = this.getRol(req)
    this.asegurarProfesional(idRol)
    const resultado = await this.service.inactivar(id, usuario)
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary: 'Registrar el seguimiento diario de un plan nutricional',
  })
  @ApiOkResponse({ type: PlanNutricionalSeguimientoResponseDto })
  @Patch(':id/seguimiento')
  async registrarSeguimiento(
    @Param('id') id: string,
    @Body() data: RegistrarSeguimientoPlanDto,
    @Req() req: Request
  ) {
    const actor = {
      idUsuario: this.getUser(req),
      idUsuarioRol: this.getUsuarioRol(req),
      rolId: this.getRol(req) as RolEnumId,
    }
    const resultado = await this.service.registrarSeguimiento(id, data, actor)
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Obtener un plan nutricional por su identificador' })
  @ApiOkResponse({ type: PlanNutricionalGeneradoResponseDto })
  @Get(':id')
  async buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    const idRol = this.getRol(req)
    this.asegurarProfesional(idRol)
    const resultado = await this.service.buscarPorId(id)
    return this.success(resultado)
  }

  @ApiOperation({
    summary: 'Buscar plan nutricional activo por paciente y fecha',
  })
  @Get('/paciente/:idPaciente/fecha/:fecha')
  async buscarPorFecha(
    @Param() params: GetPlanNutricionalParamsDto,
    @Req() req: Request
  ) {
    const { idPaciente, fecha } = params
    const rolUsuario = this.getRol(req)
    const idUsuarioRol = this.getUsuarioRol(req)
    this.validarConsultaPaciente(rolUsuario, idUsuarioRol, idPaciente)
    const resultado = await this.service.buscarPorUsuarioRolYFecha(
      idPaciente,
      fecha,
      rolUsuario as RolEnumId
    )
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Listar todos los planes nutricionales' })
  @Get()
  async listarTodos(
    @Query() paginacion: PaginacionQueryDto,
    @Req() req: Request
  ) {
    const idRol = this.getRol(req)
    this.asegurarProfesional(idRol)
    const resultado = await this.service.listarTodos(paginacion)
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Listar planes nutricionales por paciente' })
  @Get('/paciente/:idUsuarioRol')
  async listarPorPaciente(
    @Param('idUsuarioRol') idUsuarioRol: string,
    @Query() paginacion: PaginacionQueryDto,
    @Req() req: Request
  ) {
    const idRol = this.getRol(req)
    const idUsuarioAutenticado = this.getUsuarioRol(req)
    this.validarConsultaPaciente(idRol, idUsuarioAutenticado, idUsuarioRol)
    const resultado = await this.service.listarPorIdPaciente(
      idUsuarioRol,
      paginacion
    )
    return this.successListRows(resultado)
  }

  @ApiOperation({
    summary:
      'Listar el consolidado de alimentos de los planes nutricionales de un paciente en un rango',
  })
  @Get('/paciente/:idUsuarioRol/carrito-compras')
  async listarPorPacienteEntreFechas(
    @Param('idUsuarioRol') idUsuarioRol: string,
    @Query() { desde, hasta }: RangoFechasQueryDto,
    @Req() req: Request
  ) {
    const idRol = this.getRol(req)
    const idUsuarioAutenticado = this.getUsuarioRol(req)
    this.validarConsultaPaciente(idRol, idUsuarioAutenticado, idUsuarioRol)
    const resultado = await this.service.listarPorIdPacienteEntreFechas(
      idUsuarioRol,
      desde,
      hasta
    )
    return this.successList(resultado)
  }
}
