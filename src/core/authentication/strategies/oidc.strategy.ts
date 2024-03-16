import { UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Client, Strategy, TokenSet, UserinfoResponse } from 'openid-client'
import { AuthenticationService } from '../service/authentication.service'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Messages } from '@/common/constants/response-messages'
import { PersonaDto } from '@/core/usuario/dto/persona.dto'
import { LoggerService } from '@/core/logger'

dayjs.extend(customParseFormat)

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  protected logger = LoggerService.getInstance()
  client: Client

  constructor(
    private autenticacionService: AuthenticationService,
    client: Client
  ) {
    super({
      client: client,
      params: {
        redirect_uri: process.env.OIDC_REDIRECT_URI,
        scope: process.env.OIDC_SCOPE,
      },
      passReqToCallback: false,
      usePKCE: false,
    })

    this.client = client
  }

  async validate(tokenset: TokenSet): Promise<PassportUser> {
    try {
      const userinfo: UserinfoResponse<userInfoType> =
        await this.client.userinfo(tokenset)

      const ci = <DocumentoIdentidadType>userinfo?.profile?.documento_identidad
      if (!ci) {
        throw new Error(
          'El cliente de ciudadanía (client.userinfo(tokenset)) no devolvió el campo "profile.documento_identidad"'
        )
      }

      if (!userinfo.fecha_nacimiento) {
        throw new Error(
          'El cliente de ciudadanía (client.userinfo(tokenset)) no devolvió el campo "fecha_nacimiento"'
        )
      }

      if (!userinfo.email) {
        throw new Error(
          'El cliente de ciudadanía (client.userinfo(tokenset)) no devolvió el campo "email"'
        )
      }

      if (!userinfo.celular) {
        throw new Error(
          'El cliente de ciudadanía (client.userinfo(tokenset)) no devolvió el campo "celular"'
        )
      }

      if (!userinfo.sub) {
        throw new Error(
          'El cliente de ciudadanía (client.userinfo(tokenset)) no devolvió el campo "sub"'
        )
      }

      /*if (/[a-z]/i.test(ci.numero_documento)) {
        ci.complemento = ci.numero_documento.slice(-2);
        ci.numero_documento = ci.numero_documento.slice(0, -2);
      }*/

      const fechaNacimiento = dayjs(
        String(userinfo.fecha_nacimiento),
        'DD/MM/YYYY',
        true
      ).toDate()

      const persona = new PersonaDto()
      persona.tipoDocumento = ci.tipo_documento
      persona.nroDocumento = ci.numero_documento
      persona.fechaNacimiento = fechaNacimiento
      const nombre = userinfo.profile?.nombre
      persona.nombres = nombre.nombres
      persona.primerApellido = nombre.primer_apellido
      persona.segundoApellido = nombre.segundo_apellido
      // const correoElectronico = userinfo.email;
      persona.telefono = userinfo.celular
      persona.uuidCiudadano = userinfo.sub

      const datosUsuario = {
        correoElectronico: userinfo.email,
      }

      // Solo validar usuario
      /*const usuario = await this.autenticacionService.validarUsuarioOidc(
        persona,
      );*/

      // Para validar y crear usuario
      const usuario = await this.autenticacionService.validarOCrearUsuarioOidc(
        persona,
        datosUsuario
      )

      if (!usuario || !usuario.roles || usuario.roles.length === 0) {
        throw new UnauthorizedException(Messages.EXCEPTION_UNAUTHORIZED)
      }

      return {
        id: usuario.id,
        roles: usuario.roles || [],
        idToken: tokenset.id_token,
        accessToken: tokenset.access_token,
        refreshToken: tokenset.refresh_token,
        exp: tokenset.expires_at,
      }
    } catch (err) {
      return {
        idToken: tokenset.id_token,
        error: err.message || Messages.EXCEPTION_UNAUTHORIZED,
        id: '',
        roles: [],
      }
    }
  }
}

export interface DocumentoIdentidadType {
  tipo_documento: string
  numero_documento: string
  complemento: string
}

export interface NombreType {
  nombres: string
  primer_apellido: string
  segundo_apellido: string
}

export interface ProfileType {
  documento_identidad: DocumentoIdentidadType
  nombre: NombreType
}

export interface userInfoType {
  sub: string
  profile: ProfileType
  fecha_nacimiento: string
  email: string
  celular: string
}
