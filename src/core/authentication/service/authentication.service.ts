import { BaseService } from '@/common/base'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TextService } from '@/common/lib/text.service'
import { RefreshTokensService } from './refreshTokens.service'
import { USUARIO_NORMAL, USUARIO_SISTEMA } from '@/common/constants'
import { Configurations } from '@/common/params'
import { Messages } from '@/common/constants/response-messages'
import dayjs from 'dayjs'
import { ConfigService } from '@nestjs/config'
import { TemplateEmailService } from '@/common/templates/templates-email.service'
import { CambioRolDto } from '../dto/index.dto'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { PersonaService } from '@/core/usuario/service/persona.service'
import { UsuarioService } from '@/core/usuario/service/usuario.service'
import { MensajeriaService } from '@/core/external-services/mensajeria/mensajeria.service'
import { PersonaDto } from '@/core/usuario/dto/persona.dto'
import { PersonaEstado, UsuarioEstado } from '@/core/usuario/constant'
import { UsuarioRolEstado } from '@/core/authorization/constant'

@Injectable()
export class AuthenticationService extends BaseService {
  // eslint-disable-next-line max-params
  constructor(
    private readonly personaService: PersonaService,
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly mensajeriaService: MensajeriaService,
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    super()
  }

  private async verificarBloqueo(usuario: Usuario) {
    if (usuario.intentos < Configurations.WRONG_LOGIN_LIMIT) {
      return false
    }

    if (usuario.fechaBloqueo) {
      return !(usuario.fechaBloqueo && dayjs().isAfter(usuario.fechaBloqueo))
    }

    // generar código y fecha de desbloqueo
    const codigo = TextService.generateUuid()
    const fechaBloqueo = dayjs().add(
      Configurations.MINUTES_LOGIN_LOCK,
      'minute'
    )
    await this.usuarioService.actualizarDatosBloqueo(
      usuario.id,
      codigo,
      fechaBloqueo.toDate()
    )
    // enviar código por email
    const urlDesbloqueo = new URL(this.configService.get('URL_FRONTEND') ?? '')
    urlDesbloqueo.pathname = 'desbloqueo'
    urlDesbloqueo.searchParams.append('q', codigo)

    const template = TemplateEmailService.armarPlantillaBloqueoCuenta(
      urlDesbloqueo.toString()
    )

    await this.mensajeriaService
      .sendEmail(
        usuario.correoElectronico ?? '',
        Messages.SUBJECT_EMAIL_ACCOUNT_LOCKED,
        template
      )
      .catch((err) => {
        const mensaje = `Falló al enviar el correo de desbloqueo de cuenta`
        this.logger.error(err, mensaje)
      })

    return true
  }

  async generarIntentoBloqueo(usuario: Usuario) {
    if (dayjs().isAfter(usuario.fechaBloqueo)) {
      // restaurar datos bloqueo
      await this.usuarioService.actualizarDatosBloqueo(usuario.id, null, null)
      await this.usuarioService.actualizarContadorBloqueos(usuario.id, 1)
      return
    }
    const intento = usuario.intentos + 1
    await this.usuarioService.actualizarContadorBloqueos(usuario.id, intento)
  }

  async validarUsuario(usuario: string, contrasena: string) {
    const respuesta = await this.usuarioService.buscarUsuario(usuario)

    if (!respuesta) {
      return null
    }

    if (respuesta?.usuarioRol.length === 0) {
      throw new UnauthorizedException(Messages.NO_PERMISSION_USER)
    }

    if (respuesta?.estado === UsuarioEstado.PENDING) {
      throw new UnauthorizedException(Messages.PENDING_USER)
    }

    if (respuesta?.estado === UsuarioEstado.INACTIVE) {
      throw new UnauthorizedException(Messages.INACTIVE_USER)
    }

    // verificar si la cuenta esta bloqueada
    const verificacionBloqueo = await this.verificarBloqueo(respuesta)

    if (verificacionBloqueo) {
      throw new UnauthorizedException(Messages.USER_BLOCKED)
    }

    const pass = TextService.decodeBase64(contrasena)

    if (!(await TextService.compare(pass, respuesta.contrasena))) {
      await this.generarIntentoBloqueo(respuesta)
      throw new UnauthorizedException(Messages.INVALID_USER_CREDENTIALS)
    }
    // si se logra autenticar con éxito => reiniciar contador de intentos a 0
    if (respuesta.intentos > 0) {
      await this.usuarioService.actualizarContadorBloqueos(respuesta.id, 0)
    }

    return {
      id: respuesta.id,
      roles: respuesta.usuarioRol
        .filter((usuarioRol) => usuarioRol.estado === UsuarioRolEstado.ACTIVE)
        .map((usuarioRol) => usuarioRol.rol.rol),
    }
  }

  async autenticar(user: PassportUser) {
    const usuario = await this.usuarioService.buscarUsuarioId(user.id)

    const rol = this.usuarioService.obtenerRolActual(usuario.roles, user.idRol)

    const payload: PayloadType = {
      id: user.id,
      roles: user.roles,
      idRol: rol.idRol,
      rol: rol.rol,
    }
    // crear refresh_token
    const refreshToken = await this.refreshTokensService.create(user.id)
    // construir respuesta
    const data = {
      access_token: this.jwtService.sign(payload),
      ...usuario,
      idRol: rol.idRol,
      rol: rol.rol,
    }
    return {
      refresh_token: { id: refreshToken.id },
      data,
    }
  }

  async cambiarRol(user: PassportUser, data: CambioRolDto) {
    const usuarioRol = {
      ...user,
      idRol: data.idRol,
    }

    return await this.autenticar(usuarioRol)
  }

  async validarUsuarioOidc(persona: PersonaDto) {
    const respuesta = await this.usuarioService.buscarUsuarioPorCI(persona)

    if (!respuesta) {
      return null
    }

    if (respuesta?.usuarioRol.length === 0) {
      throw new UnauthorizedException(Messages.NO_PERMISSION_USER)
    }

    const { persona: datosPersona } = respuesta

    if (respuesta.estado === UsuarioEstado.INACTIVE) {
      throw new UnauthorizedException(Messages.INACTIVE_USER)
    }

    // actualizar datos persona
    if (
      datosPersona.nombres !== persona.nombres ||
      datosPersona.primerApellido !== persona.primerApellido ||
      datosPersona.segundoApellido !== persona.segundoApellido ||
      datosPersona.fechaNacimiento !== persona.fechaNacimiento
    ) {
      await this.usuarioService.actualizarDatosPersona(persona)
    }

    return {
      id: respuesta.id,
      roles: respuesta.usuarioRol.map((usuarioRol) => usuarioRol.rol.rol),
    }
  }

  async validarOCrearUsuarioOidc(
    persona: PersonaDto,
    datosUsuario: {
      correoElectronico: string
    }
  ) {
    const respuesta = await this.usuarioService.buscarUsuarioPorCI(persona)

    if (!respuesta) {
      // No existe persona, o no cuenta con un usuario - registrar

      const respPersona = await this.personaService.buscarPersonaPorCI(persona)

      if (!respPersona) {
        // No existe la persona en base de datos, crear registro completo de persona

        await this.usuarioService.crearConCiudadaniaV2(
          persona,
          datosUsuario,
          USUARIO_NORMAL
        )

        const respuesta = await this.usuarioService.buscarUsuarioPorCI(persona)

        if (!respuesta) {
          return null
        }

        return {
          id: respuesta.id,
          roles: respuesta.usuarioRol.map((usuarioRol) => usuarioRol.rol.rol),
        }
      }

      // Persona existe en base de datos, solo crear usuario
      if (respPersona.estado === PersonaEstado.INACTIVE) {
        throw new UnauthorizedException(Messages.INACTIVE_PERSON)
      }

      // Actualizar datos persona
      if (
        respPersona.nombres !== persona.nombres ||
        respPersona.primerApellido !== persona.primerApellido ||
        respPersona.segundoApellido !== persona.segundoApellido ||
        respPersona.fechaNacimiento !== persona.fechaNacimiento ||
        respPersona.telefono !== persona.telefono ||
        respPersona.uuidCiudadano !== persona.uuidCiudadano
      ) {
        await this.usuarioService.actualizarDatosPersona(persona)
      }
      // Crear usuario y rol
      await this.usuarioService.crearConPersonaExistente(
        respPersona.id,
        respPersona.nroDocumento,
        datosUsuario,
        USUARIO_NORMAL
      )

      const respuesta = await this.usuarioService.buscarUsuarioPorCI(persona) //??

      if (!respuesta) {
        return null
      }

      return {
        id: respuesta.id,
        roles: respuesta.usuarioRol.map((usuarioRol) => usuarioRol.rol.rol),
      }
    }

    // Persona y usuario existen en BD

    const { estado, persona: datosPersona } = respuesta

    if (estado === UsuarioEstado.INACTIVE) {
      throw new UnauthorizedException(Messages.INACTIVE_USER)
    }

    if (
      datosPersona.nombres !== persona.nombres ||
      datosPersona.primerApellido !== persona.primerApellido ||
      datosPersona.segundoApellido !== persona.segundoApellido ||
      datosPersona.fechaNacimiento !== persona.fechaNacimiento ||
      datosPersona.telefono !== persona.telefono ||
      datosPersona.uuidCiudadano !== persona.uuidCiudadano
    ) {
      // Actualizar datos de persona
      await this.usuarioService.actualizarDatosPersona(persona)
    }

    if (datosUsuario.correoElectronico !== respuesta.correoElectronico) {
      // Actualizar correo si es diferente en ciudadanía
      await this.usuarioService.actualizarDatos(
        respuesta.id,
        {
          correoElectronico: datosUsuario.correoElectronico,
          roles: respuesta.usuarioRol.map((value) => value.rol.id),
        },
        USUARIO_SISTEMA
      )
    }
    /// En caso de que el usuario haya sido registrado localmente, pero luego haya iniciado sesión con Ciudadanía
    if (!respuesta.ciudadaniaDigital) {
      await this.usuarioService.actualizarDatos(
        respuesta.id,
        {
          roles: respuesta.usuarioRol.map((value) => value.rol.id),
          ciudadaniaDigital: true,
        },
        USUARIO_SISTEMA
      )
    }

    return {
      id: respuesta.id,
      roles: respuesta.usuarioRol.map((usuarioRol) => usuarioRol.rol.rol),
    }
  }

  async autenticarOidc(user: PassportUser) {
    const usuario = await this.usuarioService.buscarUsuarioId(user.id)

    const rol = this.usuarioService.obtenerRolActual(usuario.roles, user.idRol)

    const payload: PayloadType = {
      id: user.id,
      roles: user.roles,
      idRol: rol.idRol,
      rol: rol.rol,
    }
    // crear refresh_token
    const refreshToken = await this.refreshTokensService.create(user.id)
    // construir respuesta
    const data = {
      access_token: this.jwtService.sign(payload),
    }
    return {
      refresh_token: { id: refreshToken.id },
      data,
    }
  }
}
