import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { BaseController } from '@/common/base'
import { CrearUsuarioDto } from '../dto/crear-usuario.dto'
import { UsuarioService } from '../service/usuario.service'
import { Messages } from '@/common/constants/response-messages'
import { ParamUuidDto } from '@/common/dto/params-uuid.dto'
import { ActualizarContrasenaDto } from '../dto/actualizar-contrasena.dto'
import { ActualizarUsuarioRolDto } from '../dto/actualizar-usuario-rol.dto'
import { CrearUsuarioCiudadaniaDto } from '../dto/crear-usuario-ciudadania.dto'
import { FiltrosUsuarioDto } from '../dto/filtros-usuario.dto'
import { CrearUsuarioCuentaDto } from '../dto/crear-usuario-cuenta.dto'
import {
  ActivarCuentaDto,
  NuevaContrasenaDto,
  RecuperarCuentaDto,
  ValidarRecuperarCuentaDto,
} from '../dto/recuperar-cuenta.dto'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { ActualizarPerfilDto } from '@/core/usuario/dto/ActualizarPerfilDto'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'node:fs/promises'

@Controller('usuarios')
@ApiTags('Usuarios')
export class UsuarioController extends BaseController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly configService: ConfigService
  ) {
    super()
  }

  // GET users
  @ApiOperation({ summary: 'API para obtener el listado de usuarios' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Get()
  async listar(@Query() paginacionQueryDto: FiltrosUsuarioDto) {
    const result = await this.usuarioService.listar(paginacionQueryDto)
    return this.successListRows(result)
  }

  @ApiOperation({ summary: 'Obtiene la información del perfil del usuario' })
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Obtiene la información de un usuario por su ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Get(':id')
  async getUsuarioPorId(@Req() req: Request, @Param('id') id: string) {
    const user = req.user
    if (!user) {
      throw new BadRequestException(
        `Es necesario que esté autenticado para consumir este recurso.`
      )
    }
    const result = await this.usuarioService.buscarUsuarioPersonaPorId(id)
    return this.success(result)
  }

  //create user
  @ApiOperation({ summary: 'API para crear un nuevo usuario' })
  @ApiBearerAuth()
  @ApiBody({
    type: CrearUsuarioDto,
    description:
      'Esta API permite crear un nuevo usuario utilizando los datos proporcionados en el cuerpo de la solicitud.',
    required: true,
  })
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Post()
  async crear(@Req() req: Request, @Body() usuarioDto: CrearUsuarioDto) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.usuarioService.crear(usuarioDto, usuarioAuditoria)
    return this.successCreate(result)
  }

  //create user account
  @ApiOperation({ summary: 'API para crear una nueva Cuenta' })
  @Post('crear-cuenta')
  async crearUsuario(@Body() usuarioDto: CrearUsuarioCuentaDto) {
    const result = await this.usuarioService.crearCuenta(usuarioDto)
    return this.successCreate(result, Messages.NEW_USER_ACCOUNT)
  }

  @ApiOperation({ summary: 'Actualiza el perfil del usuario' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @Patch('/cuenta/perfil')
  async actualizarPerfil(
    @Req() req: Request,
    @Body() actualizarPerfilDto: ActualizarPerfilDto
  ) {
    const idUsuario = this.getUser(req)
    const result = await this.usuarioService.actualizarPerfil(
      idUsuario,
      actualizarPerfilDto
    )
    return this.successUpdate(result)
  }

  @ApiOperation({ summary: 'Actualiza la foto de perfil del usuario' })
  @Patch('cuenta/foto')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: async (_, __, cb) => {
          const configuredPath = process.env.STORAGE_NFS_PATH
          if (!configuredPath) {
            throw new Error(
              'STORAGE_NFS_PATH no está definido en la configuración'
            )
          }

          const destPath = `${configuredPath}/uploads/temp`

          // Ensure the directory exists
          await fs.mkdir(destPath, { recursive: true })

          cb(null, destPath)
        },
        filename: (_req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true)
        } else {
          cb(
            new BadRequestException(
              'Solo se permiten archivos de imagen (jpg, jpeg, png, gif)'
            ),
            false
          )
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  actualizarFotoPerfil(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo')
    }
    const idUsuario = this.getUser(req)
    return this.usuarioService.actualizarFotoPerfil(idUsuario, file)
  }

  @Delete('cuenta/foto')
  @UseGuards(JwtAuthGuard)
  eliminarFotoPerfil(@Req() req: Request) {
    const idUsuario = this.getUser(req)
    return this.usuarioService.eliminarFotoPerfil(idUsuario)
  }

  //restore user account
  @ApiOperation({ summary: 'API para recuperar una Cuenta' })
  @ApiBody({
    type: RecuperarCuentaDto,
    description:
      'Esta API permite recuperar una cuenta de usuario utilizando los datos proporcionados en el cuerpo de la solicitud.',
    required: true,
  })
  @Post('recuperar')
  async recuperarCuenta(@Body() recuperarCuentaDto: RecuperarCuentaDto) {
    const result = await this.usuarioService.recuperarCuenta(recuperarCuentaDto)
    return this.success(result, Messages.SUBJECT_EMAIL_ACCOUNT_RECOVERY)
  }

  // validate restore user account
  @ApiOperation({ summary: 'API para validar recuperación una Cuenta' })
  @ApiBody({
    type: ValidarRecuperarCuentaDto,
    description:
      'Esta API permite validar la recuperación de una cuenta de usuario utilizando los datos proporcionados en el cuerpo de la solicitud.',
    required: true,
  })
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
  @ApiOperation({ summary: 'API para activar una Cuenta' })
  @ApiBody({
    type: ActivarCuentaDto,
    description:
      'Esta API permite activar una cuenta de usuario utilizando el código de activación proporcionado en el cuerpo de la solicitud.',
    required: true,
  })
  @Patch('/cuenta/activacion')
  async activarCuenta(@Body() activarCuentaDto: ActivarCuentaDto) {
    const result = await this.usuarioService.activarCuenta(
      activarCuentaDto.codigo
    )
    return this.successUpdate(result, Messages.ACCOUNT_ACTIVED_SUCCESSFULLY)
  }

  // validate restore user account
  @ApiOperation({ summary: 'API para nueva Contraseña' })
  @ApiBody({
    type: NuevaContrasenaDto,
    description:
      'Esta API permite establecer una nueva contraseña para una cuenta de usuario utilizando los datos proporcionados en el cuerpo de la solicitud.',
    required: true,
  })
  @Patch('/cuenta/nueva-contrasena')
  async nuevaContrasena(@Body() nuevaContrasenaDto: NuevaContrasenaDto) {
    const result =
      await this.usuarioService.nuevaContrasenaTransaccion(nuevaContrasenaDto)
    return this.success(result, Messages.SUCCESS_DEFAULT)
  }

  @ApiOperation({
    summary:
      'API para crear un nuevo usuario relacionado con Ciudadanía Digital',
  })
  @ApiBearerAuth()
  @ApiBody({
    type: CrearUsuarioCiudadaniaDto,
    required: true,
  })
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
  @ApiOperation({ summary: 'Activa un usuario' })
  @ApiBearerAuth()
  @ApiProperty({
    type: ParamIdDto,
  })
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
  @ApiOperation({ summary: 'Inactiva un usuario' })
  @ApiBearerAuth()
  @ApiProperty({
    type: ParamIdDto,
  })
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

  @ApiOperation({
    summary: 'Actualiza la contrasena de un usuario authenticado',
  })
  @ApiBearerAuth()
  @ApiBody({
    type: ActualizarContrasenaDto,
    description:
      'Esta API permite actualizar la contraseña de un usuario autenticado utilizando los datos proporcionados en el cuerpo de la solicitud.',
    required: true,
  })
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

  @ApiOperation({ summary: 'API para restaurar la contraseña de un usuario' })
  @ApiBearerAuth()
  @ApiProperty({
    type: ParamIdDto,
  })
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

  @ApiOperation({ summary: 'API para reenviar Correo Activación' })
  @ApiBearerAuth()
  @ApiProperty({
    type: ParamIdDto,
  })
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
  @ApiOperation({ summary: 'Actualiza datos de un usuario' })
  @ApiBearerAuth()
  @ApiProperty({
    type: ParamIdDto,
  })
  @ApiBody({
    type: ActualizarUsuarioRolDto,
    description:
      'Esta API permite actualizar los datos de un usuario utilizando los atributos proporcionados en el cuerpo de la solicitud.',
    required: true,
  })
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

  @ApiOperation({
    summary: 'Desbloquea una cuenta bloqueada por muchos intentos fallidos',
  })
  @ApiQuery({
    name: 'id',
    type: ParamUuidDto,
  })
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
