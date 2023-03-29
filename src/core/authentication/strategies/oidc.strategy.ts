import { LoggerService } from '../../logger/logger.service'
import { UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import {
  Client,
  Issuer,
  Strategy,
  TokenSet,
  UserinfoResponse,
} from 'openid-client'
import { PersonaDto } from '../../usuario/dto/persona.dto'
import { AuthenticationService } from '../service/authentication.service'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const buildOpenIdClient = async (): Promise<Client | undefined> => {
  const logger = LoggerService.getInstance()
  try {
    const issuer = await Issuer.discover(process.env.OIDC_ISSUER || '')
    return new issuer.Client({
      client_id: process.env.OIDC_CLIENT_ID || '',
      client_secret: process.env.OIDC_CLIENT_SECRET,
    })
  } catch (error) {
    const t = 0
    logger.error('////// ERROR DE CONEXIÓN CON CIUDADANÍA //////', error)
    logger.error(
      `El servicio se levantará sin esta característica dentro de ${t} segundos`
    )
    await new Promise((resolve) => setTimeout(() => resolve(1), t * 1000))
  }
}

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
        throw new UnauthorizedException()
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
      process.stdout.write('')
      throw err
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
