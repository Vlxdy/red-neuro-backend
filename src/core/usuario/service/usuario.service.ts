import { BaseService } from '@/common/base'
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { UsuarioRepository } from '../repository/usuario.repository'
import { Status, TipoDocumento, USUARIO_NORMAL } from '@/common/constants'
import { CrearUsuarioDto } from '../dto/crear-usuario.dto'
import { TextService } from '@/common/lib/text.service'
import { Messages } from '@/common/constants/response-messages'
import { PersonaDto } from '../dto/persona.dto'
import { ActualizarUsuarioRolDto } from '../dto/actualizar-usuario-rol.dto'
import { CrearUsuarioCiudadaniaDto } from '../dto/crear-usuario-ciudadania.dto'
import { ConfigService } from '@nestjs/config'
import { TemplateEmailService } from '@/common/templates/templates-email.service'
import { FiltrosUsuarioDto } from '../dto/filtros-usuario.dto'
import { EntityManager } from 'typeorm'
import { CrearUsuarioCuentaDto } from '../dto/crear-usuario-cuenta.dto'
import {
  NuevaContrasenaDto,
  RecuperarCuentaDto,
  ValidarRecuperarCuentaDto,
} from '../dto/recuperar-cuenta.dto'
import { PersonaRepository } from '../repository/persona.repository'
import { RolRepository } from '@/core/authorization/repository/rol.repository'
import { AuthorizationService } from '@/core/authorization/controller/authorization.service'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { MensajeriaService } from '@/core/external-services/mensajeria/mensajeria.service'
import { SegipService } from '@/core/external-services/iop/segip/segip.service'
import { UsuarioEstado } from '@/core/usuario/constant'
import { UsuarioRolEstado } from '@/core/authorization/constant'

@Injectable()
export class UsuarioService extends BaseService {
  constructor(
    @Inject(UsuarioRepository)
    private usuarioRepositorio: UsuarioRepository,
    @Inject(UsuarioRolRepository)
    private usuarioRolRepositorio: UsuarioRolRepository,
    @Inject(RolRepository)
    private rolRepositorio: RolRepository,
    @Inject(PersonaRepository)
    private personaRepositorio: PersonaRepository,
    private readonly mensajeriaService: MensajeriaService,
    private readonly authorizationService: AuthorizationService,
    private readonly segipServices: SegipService,
    private configService: ConfigService
  ) {
    super()
  }

  async listar(@Query() paginacionQueryDto: FiltrosUsuarioDto) {
    return await this.usuarioRepositorio.listar(paginacionQueryDto)
  }

  async buscarUsuario(usuario: string) {
    return await this.usuarioRepositorio.buscarUsuario(usuario)
  }

  async crear(usuarioDto: CrearUsuarioDto, usuarioAuditoria: string) {
    // verificar si el usuario ya fue registrado
    const usuario = await this.usuarioRepositorio.buscarUsuarioPorCI(
      usuarioDto.persona.nroDocumento
    )

    if (usuario) {
      throw new PreconditionFailedException(Messages.EXISTING_USER)
    }

    // verificar si el correo no esta registrado
    const correo = await this.usuarioRepositorio.buscarUsuarioPorCorreo(
      usuarioDto.correoElectronico
    )

    if (correo) {
      throw new PreconditionFailedException(Messages.EXISTING_EMAIL)
    }

    // Constrastación SEGIP
    const { persona, roles } = usuarioDto
    const contrastaSegip = await this.segipServices.contrastar(persona)

    if (!contrastaSegip?.finalizado) {
      throw new PreconditionFailedException(contrastaSegip?.mensaje)
    }

    const contrasena = TextService.generateShortRandomText()
    const datosCorreo = {
      correo: usuarioDto.correoElectronico,
      asunto: Messages.SUBJECT_EMAIL_ACCOUNT_ACTIVE,
    }

    const op = async (transaction: EntityManager) => {
      usuarioDto.contrasena = await TextService.encrypt(contrasena)
      usuarioDto.estado = UsuarioEstado.ACTIVE

      const persona = await this.personaRepositorio.crear(
        usuarioDto.persona,
        usuarioAuditoria,
        transaction
      )

      const usuario = await this.usuarioRepositorio.crear(
        persona.id,
        {
          ...usuarioDto,
          usuario: usuarioDto.usuario ?? usuarioDto?.persona?.nroDocumento,
        },
        usuarioAuditoria,
        transaction
      )

      await this.usuarioRolRepositorio.crear(
        usuario.id,
        roles,
        usuarioAuditoria,
        transaction
      )

      return usuario
    }

    const crearResult = await this.usuarioRepositorio.runTransaction(op)

    await this.enviarCorreoContrasenia(
      datosCorreo,
      usuarioDto.persona.nroDocumento,
      contrasena
    ).catch((error) => {
      const mensaje = `Falló al enviar la contraseña del usuario por correo electrónico`
      this.logger.error(error, mensaje)
    })

    return crearResult
  }

  async crearCuenta(usuarioDto: CrearUsuarioCuentaDto) {
    const { persona, ...datosUsuarios } = usuarioDto

    // verificar si el usuario ya fue registrado con su correo
    const usuario = await this.usuarioRepositorio.buscarUsuario(
      persona.nroDocumento
    )

    if (usuario) {
      throw new PreconditionFailedException(Messages.EXISTING_USER)
    }

    // verificar si el correo no esta registrado
    const correo = await this.usuarioRepositorio.buscarUsuarioPorCorreo(
      usuarioDto.correoElectronico
    )

    if (correo) {
      throw new PreconditionFailedException(Messages.EXISTING_EMAIL)
    }

    const rol = await this.rolRepositorio.buscarPorNombreRol('USUARIO')

    if (!rol) {
      throw new PreconditionFailedException(Messages.NO_PERMISSION_FOUND)
    }

    if (!TextService.validateLevelPassword(usuarioDto.contrasenaNueva)) {
      throw new PreconditionFailedException(Messages.INVALID_PASSWORD_SCORE)
    }

    // contrastación SEGIP
    const contrastaSegip = await this.segipServices.contrastar(persona)
    if (!contrastaSegip?.finalizado) {
      throw new PreconditionFailedException(contrastaSegip?.mensaje)
    }

    const op = async (transaction: EntityManager) => {
      const personaNueva = await this.personaRepositorio.crear(
        {
          ...persona,
          tipoDocumento: TipoDocumento.CI,
        },
        USUARIO_NORMAL,
        transaction
      )

      const usuarioNuevo = await this.usuarioRepositorio.crear(
        personaNueva.id,
        {
          usuario: persona.nroDocumento,
          correoElectronico: datosUsuarios.correoElectronico,
          estado: UsuarioEstado.PENDING,
          contrasena: await TextService.encrypt(
            TextService.decodeBase64(datosUsuarios.contrasenaNueva)
          ),
        },
        USUARIO_NORMAL,
        transaction
      )

      await this.usuarioRolRepositorio.crear(
        usuarioNuevo.id,
        [rol.id],
        USUARIO_NORMAL,
        transaction
      )

      const codigo = TextService.generateUuid()

      const urlActivacion = new URL(
        this.configService.get('URL_FRONTEND') ?? ''
      )
      urlActivacion.pathname = 'activacion'
      urlActivacion.searchParams.append('q', codigo)

      this.logger.info(`📩 urlActivacion: ${urlActivacion}`)

      await this.actualizarDatosActivacion(
        usuarioNuevo.id,
        codigo,
        USUARIO_NORMAL,
        transaction
      )

      const template =
        TemplateEmailService.armarPlantillaActivacionCuentaManual(
          urlActivacion.toString()
        )

      if (usuarioNuevo.correoElectronico) {
        await this.mensajeriaService
          .sendEmail(
            usuarioNuevo.correoElectronico,
            Messages.NEW_USER_ACCOUNT_VERIFY,
            template
          )
          .catch((err) => {
            const mensaje = `Falló al enviar el correo de activación de cuenta`
            this.logger.error(err, mensaje)
          })
      }

      const { id, usuario, correoElectronico, estado } = usuarioNuevo
      return { id, usuario, correoElectronico, estado }
    }
    return await this.usuarioRepositorio.runTransaction(op)
  }

  async activarCuenta(codigo: string) {
    const usuario =
      await this.usuarioRepositorio.buscarPorCodigoActivacion(codigo)

    if (!usuario) {
      throw new PreconditionFailedException(Messages.INVALID_USER)
    }

    await this.usuarioRepositorio.actualizar(
      usuario?.id,
      {
        estado: UsuarioEstado.ACTIVE,
        codigoActivacion: null,
      },
      usuario?.id
    )

    const usuarioActualizado = await this.usuarioRepositorio.buscarPorId(
      usuario.id
    )

    if (!usuarioActualizado) {
      throw new PreconditionFailedException(Messages.INVALID_USER)
    }

    return { id: usuarioActualizado.id, estado: usuarioActualizado.estado }
  }

  async recuperarCuenta(recuperarCuentaDto: RecuperarCuentaDto) {
    const usuario = await this.usuarioRepositorio.buscarUsuarioPorCorreo(
      recuperarCuentaDto.correoElectronico
    )

    if (!usuario) {
      this.logger.error('Usuario no encontrado')
      return 'Búsqueda terminada'
    }

    const codigo = TextService.generateUuid()
    const urlRecuperacion = new URL(
      this.configService.get('URL_FRONTEND') ?? ''
    )
    urlRecuperacion.pathname = 'recuperacion'
    urlRecuperacion.searchParams.append('q', codigo)

    // this.logger.info(`📩 urlRecuperacion: ${urlRecuperacion}`)

    await this.actualizarDatosRecuperacion(usuario.id, codigo)

    const template = TemplateEmailService.armarPlantillaRecuperacionCuenta(
      urlRecuperacion.toString()
    )

    if (usuario.correoElectronico) {
      await this.mensajeriaService
        .sendEmail(
          usuario.correoElectronico,
          Messages.SUBJECT_EMAIL_ACCOUNT_LOCKED,
          template
        )
        .catch((err) => {
          const mensaje = `Falló al enviar el correo de recuperación de cuenta`
          this.logger.error(err, mensaje)
        })
    }
    return 'Búsqueda terminada'
  }

  async validarRecuperar(validarRecuperarCuentaDto: ValidarRecuperarCuentaDto) {
    const usuario = await this.usuarioRepositorio.buscarPorCodigoRecuperacion(
      validarRecuperarCuentaDto.codigo
    )

    if (!usuario) {
      throw new PreconditionFailedException(Messages.INVALID_USER)
    }

    const codigo = TextService.generateUuid()

    await this.actualizarDatosTransaccionRecuperacion(usuario.id, codigo)

    const usuarioActualizado = await this.usuarioRepositorio.buscarPorId(
      usuario.id
    )

    if (!usuarioActualizado) {
      throw new PreconditionFailedException(Messages.INVALID_USER)
    }

    return { code: usuarioActualizado.codigoTransaccion }
  }

  async nuevaContrasenaTransaccion(nuevaContrasenaDto: NuevaContrasenaDto) {
    const usuario = await this.usuarioRepositorio.buscarPorCodigoTransaccion(
      nuevaContrasenaDto.codigo
    )

    if (!usuario) {
      throw new PreconditionFailedException(Messages.INVALID_USER)
    }

    if (
      !TextService.validateLevelPassword(nuevaContrasenaDto.contrasenaNueva)
    ) {
      throw new PreconditionFailedException(Messages.INVALID_PASSWORD_SCORE)
    }

    await this.usuarioRepositorio.actualizar(
      usuario.id,
      {
        fechaBloqueo: null,
        intentos: 0,
        codigoDesbloqueo: null,
        codigoTransaccion: null,
        codigoRecuperacion: null,
        contrasena: await TextService.encrypt(
          TextService.decodeBase64(nuevaContrasenaDto.contrasenaNueva)
        ),
        estado: UsuarioEstado.ACTIVE,
      },
      usuario.id
    )

    const usuarioActualizado = await this.usuarioRepositorio.buscarPorId(
      usuario.id
    )

    if (!usuarioActualizado) {
      throw new NotFoundException(Messages.INVALID_USER)
    }

    return { id: usuarioActualizado.id }
  }

  async crearConCiudadania(
    usuarioDto: CrearUsuarioCiudadaniaDto,
    usuarioAuditoria: string
  ) {
    const op = async (transaction: EntityManager) => {
      const persona = new PersonaDto()
      persona.nroDocumento = usuarioDto.usuario
      const usuario = await this.usuarioRepositorio.buscarUsuarioPorCI(
        persona.nroDocumento
      )

      if (usuario) {
        throw new PreconditionFailedException(Messages.EXISTING_USER)
      }

      const personaResult = await this.personaRepositorio.crear(
        persona,
        usuarioAuditoria,
        transaction
      )

      usuarioDto.estado = UsuarioEstado.ACTIVE

      const usuarioResult = await this.usuarioRepositorio.crear(
        personaResult.id,
        usuarioDto as CrearUsuarioDto,
        usuarioAuditoria,
        transaction
      )

      const rol = await this.rolRepositorio.buscarPorNombreRol(
        'USUARIO',
        transaction
      )

      if (!rol) {
        throw new NotFoundException(Messages.NO_PERMISSION_FOUND)
      }

      await this.usuarioRolRepositorio.crear(
        usuarioResult.id,
        [rol.id],
        usuarioAuditoria,
        transaction
      )

      return usuarioResult
    }
    return await this.usuarioRepositorio.runTransaction(op)
  }

  async crearConPersonaExistente(
    idPersona: string,
    nroDocumento: string,
    otrosDatos: { correoElectronico: string },
    usuarioAuditoria: string
  ) {
    const op = async (transaction: EntityManager) => {
      // verificar si el usuario ya fue registrado
      const usuario = await this.usuarioRepositorio.verificarExisteUsuarioPorCI(
        nroDocumento,
        transaction
      )

      if (usuario) {
        throw new PreconditionFailedException(Messages.EXISTING_USER)
      }

      const usuarioResult = await this.usuarioRepositorio.crear(
        idPersona,
        {
          estado: UsuarioEstado.ACTIVE,
          correoElectronico: otrosDatos?.correoElectronico,
          ciudadaniaDigital: true,
        },
        usuarioAuditoria,
        transaction
      )

      const rol = await this.rolRepositorio.buscarPorNombreRol(
        'USUARIO',
        transaction
      )

      if (!rol) {
        throw new NotFoundException(Messages.NO_PERMISSION_FOUND)
      }

      await this.usuarioRolRepositorio.crear(
        usuarioResult.id,
        [rol.id],
        usuarioAuditoria,
        transaction
      )

      return usuarioResult
    }

    const result = await this.usuarioRepositorio.runTransaction(op)

    return { id: result.id, estado: result.estado }
  }

  async crearConCiudadaniaV2(
    personaCiudadania: PersonaDto,
    otrosDatos: { correoElectronico: string },
    usuarioAuditoria: string
  ) {
    const op = async (transaction: EntityManager) => {
      const persona = new PersonaDto()
      // completar campos de Ciudadanía
      persona.tipoDocumento = personaCiudadania.tipoDocumento
      persona.nroDocumento = personaCiudadania.nroDocumento
      persona.fechaNacimiento = personaCiudadania.fechaNacimiento
      persona.nombres = personaCiudadania.nombres
      persona.primerApellido = personaCiudadania.primerApellido
      persona.segundoApellido = personaCiudadania.segundoApellido
      persona.telefono = personaCiudadania.telefono
      persona.uuidCiudadano = personaCiudadania.uuidCiudadano

      const usuario = await this.usuarioRepositorio.verificarExisteUsuarioPorCI(
        persona.nroDocumento,
        transaction
      )

      if (usuario) throw new PreconditionFailedException(Messages.EXISTING_USER)

      const rol = await this.rolRepositorio.buscarPorNombreRol(
        'USUARIO',
        transaction
      )

      if (!rol) {
        throw new NotFoundException(Messages.NO_PERMISSION_FOUND)
      }

      const nuevaPersona = await this.personaRepositorio.crear(
        persona,
        usuarioAuditoria,
        transaction
      )

      const nuevoUsuario = await this.usuarioRepositorio.crear(
        nuevaPersona.id,
        {
          usuario: personaCiudadania.nroDocumento,
          estado: UsuarioEstado.ACTIVE,
          correoElectronico: otrosDatos?.correoElectronico,
          ciudadaniaDigital: true,
        },
        usuarioAuditoria,
        transaction
      )

      await this.usuarioRolRepositorio.crear(
        nuevoUsuario.id,
        [rol.id],
        usuarioAuditoria,
        transaction
      )

      return nuevoUsuario
    }

    const result = await this.usuarioRepositorio.runTransaction(op)

    return { id: result.id, estado: result.estado }
  }

  async activar(idUsuario: string, usuarioAuditoria: string) {
    this.verificarPermisos(idUsuario, usuarioAuditoria)
    const usuario = await this.usuarioRepositorio.buscarPorId(idUsuario)
    const statusValid = [
      UsuarioEstado.CREATE,
      UsuarioEstado.INACTIVE,
      UsuarioEstado.PENDING,
    ]

    if (!(usuario && statusValid.includes(usuario.estado as Status))) {
      throw new NotFoundException(Messages.INVALID_USER)
    }

    // cambiar estado al usuario y generar una nueva contrasena
    const contrasena = TextService.generateShortRandomText()

    await this.usuarioRepositorio.actualizar(
      idUsuario,
      {
        contrasena: await TextService.encrypt(contrasena),
        estado: UsuarioEstado.ACTIVE,
      },
      usuarioAuditoria
    )

    const usuarioActualizado = await this.usuarioRepositorio.buscarPorId(
      usuario.id
    )

    if (!usuarioActualizado) {
      throw new PreconditionFailedException(Messages.INVALID_USER)
    }

    if (usuarioActualizado.correoElectronico) {
      // sí está bien ≥ enviar el mail con la contraseña generada
      const datosCorreo = {
        correo: usuarioActualizado.correoElectronico,
        asunto: Messages.SUBJECT_EMAIL_ACCOUNT_ACTIVE,
      }

      await this.enviarCorreoContrasenia(
        datosCorreo,
        usuario.usuario,
        contrasena
      ).catch((err) => {
        const mensaje = `Falló al enviar el correo de activación de cuenta`
        this.logger.error(err, mensaje)
      })
    }

    return { id: usuarioActualizado.id, estado: usuarioActualizado.estado }
  }

  async inactivar(idUsuario: string, usuarioAuditoria: string) {
    this.verificarPermisos(idUsuario, usuarioAuditoria)
    const usuario = await this.usuarioRepositorio.buscarPorId(idUsuario)

    if (!usuario) {
      throw new NotFoundException(Messages.INVALID_USER)
    }

    await this.usuarioRepositorio.actualizar(
      idUsuario,
      {
        estado: UsuarioEstado.INACTIVE,
      },

      usuarioAuditoria
    )

    const usuarioActualizado = await this.usuarioRepositorio.buscarPorId(
      usuario.id
    )

    if (!usuarioActualizado) {
      throw new NotFoundException(Messages.INVALID_USER)
    }

    return {
      id: usuarioActualizado.id,
      estado: usuarioActualizado.estado,
    }
  }

  async enviarCorreoContrasenia(
    datosCorreo: { correo: string; asunto: Messages },
    usuario: string,
    contrasena: string
  ) {
    const url = this.configService.get('URL_FRONTEND')
    const template = TemplateEmailService.armarPlantillaActivacionCuenta(
      url,
      usuario,
      contrasena
    )

    const result = await this.mensajeriaService.sendEmail(
      datosCorreo.correo,
      datosCorreo.asunto,
      template
    )
    return result.finalizado
  }

  verificarPermisos(usuarioAuditoria: string, id: string) {
    if (usuarioAuditoria === id) {
      throw new ForbiddenException(Messages.EXCEPTION_OWN_ACCOUNT_ACTION)
    }
  }

  async actualizarContrasena(
    idUsuario: string,
    contrasenaActual: string,
    contrasenaNueva: string
  ) {
    const hash = TextService.decodeBase64(contrasenaActual)
    const usuario =
      await this.usuarioRepositorio.buscarUsuarioRolPorId(idUsuario)

    if (!(usuario && (await TextService.compare(hash, usuario.contrasena)))) {
      throw new PreconditionFailedException(Messages.INVALID_CREDENTIALS)
    }
    // validar que la contraseña nueva cumpla nivel de seguridad
    const contrasena = TextService.decodeBase64(contrasenaNueva)

    if (!TextService.validateLevelPassword(contrasena)) {
      throw new PreconditionFailedException(Messages.INVALID_PASSWORD_SCORE)
    }

    // guardar en bd
    await this.usuarioRepositorio.actualizar(
      idUsuario,
      {
        contrasena: await TextService.encrypt(contrasena),
        estado: UsuarioEstado.ACTIVE,
      },
      idUsuario
    )

    const usuarioActualizado = await this.usuarioRepositorio.buscarPorId(
      usuario.id
    )

    if (!usuarioActualizado) {
      throw new PreconditionFailedException(Messages.INVALID_USER)
    }

    return {
      id: usuarioActualizado.id,
      estado: usuarioActualizado.estado,
    }
  }

  async restaurarContrasena(idUsuario: string, usuarioAuditoria: string) {
    this.verificarPermisos(idUsuario, usuarioAuditoria)
    const usuario = await this.usuarioRepositorio.buscarPorId(idUsuario)
    const statusValid = [UsuarioEstado.ACTIVE, UsuarioEstado.PENDING]

    if (!(usuario && statusValid.includes(usuario.estado as Status))) {
      throw new NotFoundException(Messages.INVALID_USER)
    }

    const op = async (transaccion: EntityManager) => {
      const contrasena = TextService.generateShortRandomText()
      await this.usuarioRepositorio.actualizar(
        idUsuario,
        {
          contrasena: await TextService.encrypt(contrasena),
        },
        usuarioAuditoria,
        transaccion
      )

      const usuarioActualizado = await this.usuarioRepositorio.buscarPorId(
        idUsuario,
        transaccion
      )

      if (!usuarioActualizado) {
        throw new NotFoundException(Messages.INVALID_USER)
      }

      if (usuarioActualizado.correoElectronico) {
        // sí está bien ≥ enviar el mail con la contraseña generada
        const datosCorreo = {
          correo: usuarioActualizado.correoElectronico,
          asunto: Messages.SUBJECT_EMAIL_ACCOUNT_RESET,
        }

        await this.enviarCorreoContrasenia(
          datosCorreo,
          usuarioActualizado.usuario,
          contrasena
        ).catch((error) => {
          const mensaje = `Ocurrió un error al enviar el correo electrónico para restaurar la contraseña`
          this.logger.error(error, mensaje)
        })
      }

      return usuarioActualizado
    }

    const usuarioResult = await this.usuarioRepositorio.runTransaction(op)

    return { id: usuarioResult.id, estado: usuarioResult.estado }
  }

  async reenviarCorreoActivacion(idUsuario: string, usuarioAuditoria: string) {
    const usuario = await this.usuarioRepositorio.buscarPorId(idUsuario)
    const statusValid = [UsuarioEstado.PENDING]

    if (!(usuario && statusValid.includes(usuario.estado as Status))) {
      throw new NotFoundException(Messages.INVALID_USER)
    }

    const op = async (transaction: EntityManager) => {
      const codigo = TextService.generateUuid()
      const urlActivacion = new URL(
        this.configService.get('URL_FRONTEND') ?? ''
      )
      urlActivacion.pathname = 'activacion'
      urlActivacion.searchParams.append('q', codigo)

      // this.logger.info(`📩 urlActivacion nuevo: ${urlActivacion}`)

      await this.actualizarDatosActivacion(
        usuario.id,
        codigo,
        usuarioAuditoria,
        transaction
      )

      const template =
        TemplateEmailService.armarPlantillaActivacionCuentaManual(
          urlActivacion.toString()
        )

      if (usuario.correoElectronico) {
        await this.mensajeriaService
          .sendEmail(
            usuario.correoElectronico,
            Messages.NEW_USER_ACCOUNT_VERIFY,
            template
          )
          .catch((error) => {
            const mensaje = `Ocurrió un error al enviar el correo electrónico de activación de cuenta`
            this.logger.error(error, mensaje)
          })
      }

      const usuarioActualizado = await this.usuarioRepositorio.buscarPorId(
        idUsuario,
        transaction
      )

      if (!usuarioActualizado) {
        throw new NotFoundException(Messages.INVALID_USER)
      }

      return usuarioActualizado
    }

    const usuarioResult = await this.usuarioRepositorio.runTransaction(op)

    return { id: idUsuario, estado: usuarioResult.estado }
  }

  async actualizarDatos(
    id: string,
    usuarioDto: ActualizarUsuarioRolDto,
    usuarioAuditoria: string
  ) {
    this.verificarPermisos(id, usuarioAuditoria)
    // 1. verificar que exista el usuario
    const op = async (transaction: EntityManager) => {
      const usuario = await this.usuarioRepositorio.buscarPorId(id, transaction)

      if (!usuario) {
        throw new NotFoundException(Messages.INVALID_USER)
      }

      const { persona } = usuarioDto

      if (persona) {
        //contrastación SEGIP

        const contrastaSegip = await this.segipServices.contrastar(persona)
        if (!contrastaSegip?.finalizado) {
          throw new PreconditionFailedException(contrastaSegip?.mensaje)
        }

        const personaResult = await this.personaRepositorio.buscarPersonaId(
          usuario.idPersona,
          transaction
        )
        if (!personaResult) {
          throw new PreconditionFailedException(Messages.INVALID_USER)
        }

        await this.usuarioRepositorio.ActualizarDatosPersonaId(
          personaResult.id,
          persona,
          transaction
        )
      }

      const { correoElectronico, roles, ciudadaniaDigital } = usuarioDto
      // 2. verificar que el email no este registrado

      if (
        correoElectronico &&
        correoElectronico !== usuario.correoElectronico
      ) {
        const existe = await this.usuarioRepositorio.buscarUsuarioPorCorreo(
          correoElectronico,
          transaction
        )
        if (existe) {
          throw new PreconditionFailedException(Messages.EXISTING_EMAIL)
        }
        await this.usuarioRepositorio.actualizar(
          id,
          {
            correoElectronico: correoElectronico,
          },
          usuarioAuditoria,
          transaction
        )
      }

      if (roles.length > 0) {
        // realizar reglas de roles
        await this.actualizarRoles(id, roles, usuarioAuditoria, transaction)
      }

      if (ciudadaniaDigital) {
        await this.usuarioRepositorio.actualizar(
          id,
          {
            ciudadaniaDigital: ciudadaniaDigital,
          },
          usuarioAuditoria
        )
      }

      return { id: usuario.id }
    }

    const usuarioResult = await this.usuarioRepositorio.runTransaction(op)

    return { id: usuarioResult.id }
  }

  async actualizarRoles(
    id: string,
    roles: Array<string>,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ) {
    const usuarioRoles =
      await this.usuarioRolRepositorio.obtenerRolesPorUsuario(id, transaccion)

    const { inactivos, activos, nuevos } = this.verificarUsuarioRoles(
      usuarioRoles,
      roles
    )

    // ACTIVAR roles inactivos
    if (inactivos.length > 0) {
      await this.usuarioRolRepositorio.activar(
        id,
        inactivos,
        usuarioAuditoria,
        transaccion
      )
    }
    // INACTIVAR roles activos
    if (activos.length > 0) {
      await this.usuarioRolRepositorio.inactivar(
        id,
        activos,
        usuarioAuditoria,
        transaccion
      )
    }
    // CREAR nuevos roles
    if (nuevos.length > 0) {
      await this.usuarioRolRepositorio.crear(
        id,
        nuevos,
        usuarioAuditoria,
        transaccion
      )
    }
  }

  verificarUsuarioRoles(
    usuarioRoles: Array<{
      rol: { id: string }
      estado: string
    }>,
    roles: Array<string>
  ) {
    const inactivos = roles.filter((rol) =>
      usuarioRoles.some(
        (usuarioRol) =>
          usuarioRol.rol.id === rol &&
          usuarioRol.estado === UsuarioRolEstado.INACTIVE
      )
    )

    const activos = usuarioRoles
      .filter(
        (usuarioRol) =>
          !roles.includes(usuarioRol.rol.id) &&
          usuarioRol.estado === UsuarioRolEstado.ACTIVE
      )
      .map((usuarioRol) => usuarioRol.rol.id)

    const nuevos = roles.filter((rol) =>
      usuarioRoles.every((usuarioRol) => usuarioRol.rol.id !== rol)
    )

    return {
      activos,
      inactivos,
      nuevos,
    }
  }

  async buscarUsuarioPerfil(id: string, idRol: string) {
    const perfil = await this.buscarUsuarioId(id)
    return { ...perfil, idRol }
  }

  async buscarUsuarioId(id: string) {
    const usuario = await this.usuarioRepositorio.buscarUsuarioRolPorId(id)

    if (!usuario) {
      throw new NotFoundException(Messages.INVALID_USER)
    }

    return {
      id: usuario.id,
      usuario: usuario.usuario,
      ciudadaniaDigital: usuario.ciudadaniaDigital,
      correoElectronico: usuario.correoElectronico,
      estado: usuario.estado,
      roles: await Promise.all(
        usuario.usuarioRol
          .filter((value) => value.estado === UsuarioRolEstado.ACTIVE)
          .map(async (usuarioRol) => {
            const { id, rol, nombre, descripcion } = usuarioRol.rol
            const modulos =
              await this.authorizationService.obtenerPermisosPorRol(rol)
            return {
              idRol: id,
              rol,
              nombre,
              descripcion,
              modulos,
            }
          })
      ),
      persona: usuario.persona,
    }
  }

  async buscarUsuarioPorCI(persona: PersonaDto) {
    return await this.usuarioRepositorio.buscarUsuarioPorCI(
      persona.nroDocumento
    )
  }

  async actualizarContadorBloqueos(idUsuario: string, intento: number) {
    return await this.usuarioRepositorio.actualizarContadorBloqueos(
      idUsuario,
      intento
    )
  }

  async actualizarDatosBloqueo(
    idUsuario: string,
    codigo: string | null,
    fechaBloqueo: Date | null
  ) {
    return await this.usuarioRepositorio.actualizarDatosBloqueo(
      idUsuario,
      codigo,
      fechaBloqueo
    )
  }

  async actualizarDatosRecuperacion(idUsuario: string, codigo: string) {
    return await this.usuarioRepositorio.actualizarDatosRecuperacion(
      idUsuario,
      codigo
    )
  }

  async actualizarDatosActivacion(
    idUsuario: string,
    codigo: string,
    usuarioAuditoria: string,
    transaction: EntityManager
  ) {
    return await this.usuarioRepositorio.actualizarDatosActivacion(
      idUsuario,
      codigo,
      usuarioAuditoria,
      transaction
    )
  }

  async actualizarDatosTransaccionRecuperacion(
    idUsuario: string,
    codigo: string
  ) {
    return await this.usuarioRepositorio.actualizarDatosTransaccion(
      idUsuario,
      codigo
    )
  }

  async desbloquearCuenta(codigo: string) {
    const usuario =
      await this.usuarioRepositorio.buscarPorCodigoDesbloqueo(codigo)
    if (usuario?.fechaBloqueo) {
      await this.usuarioRepositorio.actualizar(
        usuario.id,
        {
          fechaBloqueo: null,
          intentos: 0,
          codigoDesbloqueo: null,
        },
        USUARIO_NORMAL
      )
    }
    return { codigo }
  }

  async actualizarDatosPersona(datosPersona: PersonaDto) {
    return await this.usuarioRepositorio.actualizarDatosPersona(datosPersona)
  }

  obtenerRolActual(
    roles: Array<{ idRol: string; rol: string }>,
    idRol: string | null | undefined
  ) {
    if (roles.length < 1) {
      throw new UnauthorizedException(`El usuario no cuenta con roles.`)
    }

    // buscar el primer rol
    if (!idRol) {
      return roles[0]
    }

    // buscar el rol activo
    const rol = roles.find((item) => item.idRol === idRol)
    if (!rol) {
      throw new UnauthorizedException(`Rol no permitido.`)
    }
    return rol
  }

  async obtenerCodigoTest(idUser: string) {
    return await this.usuarioRepositorio.obtenerCodigoTest(idUser)
  }
}
