import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { MensajeriaService } from '../../external-services/mensajeria/mensajeria.service'
import { UsuarioService } from '../../usuario/service/usuario.service'
import { AuthenticationService } from './authentication.service'
import { RefreshTokensService } from './refreshTokens.service'
import { Configurations } from '../../../common/params'
import dayjs from 'dayjs'
import { TextService } from '../../../common/lib/text.service'
import { Persona } from '../../usuario/entity/persona.entity'
import { plainToClass } from 'class-transformer'
import { ConfigService } from '@nestjs/config'
import { PersonaService } from '../../usuario/service/persona.service'
import { PersonaRepository } from '../../usuario/repository/persona.repository'
import { UsuarioRolRepository } from '../../authorization/repository/usuario-rol.repository'
import { RolRepository } from '../../authorization/repository/rol.repository'
import { PersonaDto } from '../../usuario/dto/persona.dto'
import { UnauthorizedException } from '@nestjs/common'
import { Status } from '../../../common/constants'

const resSign = 'aaa.bbb.ccc'
const resBuscarUsuario = {
  id: 11111,
  usuario: 'user',
  contrasena: '$2b$10$Tq95LTM6Ofo0oEbD8J4/E.8xr13SVbNYXfX7y1Q.IconhxfHuKRVe',
  estado: 'ACTIVO',
  usuarioRol: [
    {
      estado: 'ACTIVO',
      rol: {
        rol: 'ADMINISTRADOR',
      },
    },
  ],
  intentos: 0,
}

const resPersona = {
  nombres: 'JUAN',
  primerApellido: 'PEREZ',
  segundoApellido: 'PEREZ',
  fechaNacimiento: '1999-11-11',
}

const refreshToken = { resfresh_token: '1' }

const resPerfil = {
  id: TextService.generateUuid(),
  usuario: '7171717',
  estado: Status.ACTIVE,
  roles: {},
  persona: {},
}

describe('AuthenticationService', () => {
  let service: AuthenticationService
  let usuarioService: UsuarioService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonaService,
        ConfigService,
        AuthenticationService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => resSign),
          },
        },
        {
          provide: UsuarioService,
          useValue: {
            buscarUsuario: jest
              .fn()
              .mockReturnValueOnce(resBuscarUsuario)
              .mockReturnValueOnce(resBuscarUsuario)
              .mockReturnValueOnce({ ...resBuscarUsuario, estado: 'INACTIVO' })
              .mockReturnValueOnce({
                ...resBuscarUsuario,
                intentos: Configurations.WRONG_LOGIN_LIMIT,
              })
              .mockReturnValueOnce({
                ...resBuscarUsuario,
                intentos: Configurations.WRONG_LOGIN_LIMIT - 1,
              })
              .mockReturnValueOnce({
                ...resBuscarUsuario,
                intentos: Configurations.WRONG_LOGIN_LIMIT,
                fechaBloqueo: dayjs().subtract(2, 'minutes').toDate(),
              }),
            actualizarDatosBloqueo: jest.fn(() => ({})),
            actualizarContadorBloqueos: jest.fn(() => ({})),
            buscarUsuarioPorCI: jest
              .fn()
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce({
                ...resBuscarUsuario,
                estado: 'INACTIVO',
                persona: resPersona,
              })
              .mockReturnValueOnce({
                ...resBuscarUsuario,
                estado: 'ACTIVO',
                persona: resPersona,
              }),
            buscarUsuarioId: jest.fn(() => resPerfil),
            obtenerRolActual: jest.fn().mockReturnValueOnce({ idRol: 1 }),
          },
        },
        {
          provide: RefreshTokensService,
          useValue: {
            create: jest.fn(() => refreshToken),
            createAccessToken: jest.fn(() => refreshToken),
          },
        },
        {
          provide: MensajeriaService,
          useValue: {
            sendEmail: jest.fn(() => ({ finalizado: true })),
          },
        },
        {
          provide: PersonaRepository,
          useValue: {},
        },
        {
          provide: UsuarioRolRepository,
          useValue: {},
        },
        {
          provide: RolRepository,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<AuthenticationService>(AuthenticationService)
    usuarioService = module.get<UsuarioService>(UsuarioService)
  })

  it('[autenticar] debería generar un token de acceso.', async () => {
    const user = {
      usuario: 'user',
      id: '11111',
      roles: [],
    }
    const credenciales = await service.autenticarOidc(user)
    // expect(credenciales).toHaveProperty('access_token');
    expect(credenciales?.data?.access_token).toEqual(resSign)
  })

  it('[validarUsuario] Debería validar un usuario exitosamente.', async () => {
    const usuario = await service.validarUsuario(
      'user',
      TextService.btoa(encodeURI('123'))
    )

    expect(usuario).toHaveProperty('id')
  })

  it('[validarUsuario] Debería lanzar una excepcion para un usuario con contrasena erronea.', async () => {
    try {
      await service.validarUsuario('user', TextService.btoa(encodeURI('1234')))
    } catch (error) {
      expect(error instanceof UnauthorizedException)
      expect(error.status).toEqual(401)
    }
  })

  it('[validarUsuario] Debería lanzar una excepcion para un usuario INACTIVO.', async () => {
    try {
      await service.validarUsuario('user', TextService.btoa(encodeURI('123')))
    } catch (error) {
      expect(error instanceof UnauthorizedException)
      expect(error.status).toEqual(401)
    }
  })

  it('[validarUsuario] Debería lanzar una excepcion si excedio el límite de intentos erroneos de inicio de sesion.', async () => {
    try {
      await service.validarUsuario('user', TextService.btoa(encodeURI('123')))
    } catch (error) {
      expect(error instanceof UnauthorizedException)
      expect(error.status).toEqual(401)
    }
  })

  it('[validarUsuario] Debería restablecer el límite de intentos si inicio sesion correctamente.', async () => {
    await service.validarUsuario('user', TextService.btoa(encodeURI('123')))

    expect(usuarioService.actualizarContadorBloqueos).toBeCalled()
  })

  it('[validarUsuario] Debería permitir iniciar sesion si la fecha límite bloqueo ya expiro.', async () => {
    try {
      await service.validarUsuario('user', TextService.btoa(encodeURI('1234')))
    } catch (error) {
      expect(error instanceof UnauthorizedException)
      expect(usuarioService.actualizarDatosBloqueo).toBeCalled()
      expect(usuarioService.actualizarContadorBloqueos).toBeCalled()
    }
  })

  it('[validarUsuarioOidc] Debería retornar null cuando no existe el usuario.', async () => {
    const persona = plainToClass(Persona, resPersona) as PersonaDto

    const result = await service.validarUsuarioOidc(persona)
    expect(result).toBeFalsy()
  })

  it('[validarUsuarioOidc] Debería retornar excepcion si el usuario está INACTIVO.', async () => {
    try {
      const persona = plainToClass(Persona, resPersona) as PersonaDto
      await service.validarUsuarioOidc(persona)
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException)
    }
  })

  it('[validarUsuarioOidc] Debería retornar el ID si el usuario está ACTIVO.', async () => {
    const persona = plainToClass(Persona, resPersona) as PersonaDto
    const result = await service.validarUsuarioOidc(persona)
    expect(result).toBeDefined()
    expect(result).toHaveProperty('id')
  })
})
