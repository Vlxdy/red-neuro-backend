import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { BaseController } from '../../../common/base'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { CrearUsuarioDto } from '../dto/crear-usuario.dto'
import { UsuarioService } from '../service/usuario.service'
import { Messages } from '../../../common/constants/response-messages'
import { ParamUuidDto } from '../../../common/dto/params-uuid.dto'
import { ActualizarContrasenaDto } from '../dto/actualizar-contrasena.dto'
import { ActualizarUsuarioRolDto } from '../dto/actualizar-usuario-rol.dto'
import { CrearUsuarioCiudadaniaDto } from '../dto/crear-usuario-ciudadania.dto'
import { FiltrosUsuarioDto } from '../dto/filtros-usuario.dto'
import { CasbinGuard } from '../../authorization/guards/casbin.guard'
import { CrearUsuarioCuentaDto } from '../dto/crear-usuario-cuenta.dto'
import {
  ActivarCuentaDto,
  NuevaContrasenaDto,
  RecuperarCuentaDto,
  ValidarRecuperarCuentaDto,
} from '../dto/recuperar-cuenta.dto'
import { ParamIdDto } from '../../../common/dto/params-id.dto'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

@Controller('usuarios')
export class UsuarioController extends BaseController {
  constructor(
    private usuarioService: UsuarioService,
    private configService: ConfigService
  ) {
    super()
  }

  // GET users
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Get()
  async listar(@Query() paginacionQueryDto: FiltrosUsuarioDto) {
    const result = await this.usuarioService.listar(paginacionQueryDto)
    return this.successListRows(result)
  }

  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Get('/cuenta/perfil')
  async obtenerPerfil(@Req() req: Request) {
    const user = req.user
    if (!user) {
      throw new BadRequestException(
        `Es necesario que esté autenticado para consumir este recurso.`
      )
    }
    const result = await this.usuarioService.buscarUsuarioPerfil(
      user.id,
      user.idRol!
    )
    return this.success(result)
  }

  //create user
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Post()
  async crear(@Req() req: Request, @Body() usuarioDto: CrearUsuarioDto) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.usuarioService.crear(usuarioDto, usuarioAuditoria)
    return this.successCreate(result)
  }

  //create user account
  @Post('crear-cuenta')
  async crearUsuario(@Body() usuarioDto: CrearUsuarioCuentaDto) {
    const result = await this.usuarioService.crearCuenta(usuarioDto)
    return this.successCreate(result, Messages.NEW_USER_ACCOUNT)
  }

  //restore user account
  @Post('recuperar')
  async recuperarCuenta(@Body() recuperarCuentaDto: RecuperarCuentaDto) {
    const result = await this.usuarioService.recuperarCuenta(recuperarCuentaDto)
    return this.success(result, Messages.SUBJECT_EMAIL_ACCOUNT_RECOVERY)
  }

  // validate restore user account
  @Post('validar-recuperar')
  async validarRecuperarCuenta(
    @Body() validarRecuperarCuentaDto: ValidarRecuperarCuentaDto
  ) {
    const result = await this.usuarioService.validarRecuperar(
      validarRecuperarCuentaDto
    )
    return this.success(result, Messages.SUCCESS_DEFAULT)
  }

  // activar usuario
  @Patch('/cuenta/activacion')
  async activarCuenta(@Body() activarCuentaDto: ActivarCuentaDto) {
    const result = await this.usuarioService.activarCuenta(
      activarCuentaDto.codigo
    )
    return this.successUpdate(result, Messages.ACCOUNT_ACTIVED_SUCCESSFULLY)
  }

  // validate restore user account
  @Patch('/cuenta/nueva-contrasena')
  async nuevaContrasena(@Body() nuevaContrasenaDto: NuevaContrasenaDto) {
    const result =
      await this.usuarioService.nuevaContrasenaTransaccion(nuevaContrasenaDto)
    return this.success(result, Messages.SUCCESS_DEFAULT)
  }

  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Post('/cuenta/ciudadania')
  async crearConCiudadania(
    @Req() req: Request,
    @Body() usuarioDto: CrearUsuarioCiudadaniaDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.usuarioService.crearConCiudadania(
      usuarioDto,
      usuarioAuditoria
    )
    return this.successCreate(result)
  }

  // activar usuario
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/:id/activacion')
  async activar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idUsuario } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.usuarioService.activar(
      idUsuario,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  // inactivar usuario
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/:id/inactivacion')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id: idUsuario } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.usuarioService.inactivar(
      idUsuario,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/cuenta/contrasena')
  async actualizarContrasena(
    @Req() req: Request,
    @Body() body: ActualizarContrasenaDto
  ) {
    const idUsuario = this.getUser(req)
    const { contrasenaActual, contrasenaNueva } = body
    const result = await this.usuarioService.actualizarContrasena(
      idUsuario,
      contrasenaActual,
      contrasenaNueva
    )
    return this.successUpdate(result)
  }

  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/:id/restauracion')
  async restaurarContrasena(@Req() req: Request, @Param() params: ParamIdDto) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idUsuario } = params
    const result = await this.usuarioService.restaurarContrasena(
      idUsuario,
      usuarioAuditoria
    )
    return this.successUpdate(result, Messages.SUCCESS_RESTART_PASSWORD)
  }

  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/:id/reenviar')
  async reenviarCorreoActivacion(
    @Req() req: Request,
    @Param() params: ParamIdDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const { id: idUsuario } = params
    const result = await this.usuarioService.reenviarCorreoActivacion(
      idUsuario,
      usuarioAuditoria
    )
    return this.successUpdate(result, Messages.SUCCESS_RESEND_MAIL_ACTIVATION)
  }

  //update user
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch(':id')
  async actualizarDatos(
    @Req() req: Request,
    @Param() params: ParamIdDto,
    @Body() usuarioDto: ActualizarUsuarioRolDto
  ) {
    const { id: idUsuario } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.usuarioService.actualizarDatos(
      idUsuario,
      usuarioDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @Get('cuenta/desbloqueo')
  async desbloquearCuenta(@Query() query: ParamUuidDto) {
    const { id: idDesbloqueo } = query
    const result = await this.usuarioService.desbloquearCuenta(idDesbloqueo)
    return this.successUpdate(result, Messages.SUCCESS_ACCOUNT_UNLOCK)
  }

  @Get('/test/codigo/:id')
  async obtenerCodigo(@Param() params: ParamIdDto) {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }
    const { id: idUsuario } = params
    const result = await this.usuarioService.obtenerCodigoTest(idUsuario)
    return this.success(result, Messages.SUCCESS_DEFAULT)
  }
}
