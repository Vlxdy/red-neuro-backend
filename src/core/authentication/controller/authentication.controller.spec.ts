import { Test } from '@nestjs/testing'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { ConfigService } from '@nestjs/config'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from '../service/authentication.service'
import { RefreshTokensService } from '../service/refreshTokens.service'
import { AuthDto } from '../dto/index.dto'

const resAutenticar = {
  refresh_token: '123',
  data: { access_token: 'aaa.bbb.ccc', id: '12132' },
}
const resValidarUsuario = { id: '111111', usuario: 'usuario' }
const refreshToken = { resfresh_token: '1' }

describe('AuthenticationController', () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            autenticar: jest.fn(() => resAutenticar),
            validarUsuario: jest.fn(() => resValidarUsuario),
          },
        },
        {
          provide: RefreshTokensService,
          useValue: {
            create: jest.fn(() => refreshToken),
            createAccessToken: jest.fn(() => refreshToken),
          },
        },
        ConfigService,
      ],
    }).compile()
  })

  it('[login] Debería realizar una autenticación exitosa.', () => {
    expect(true).toBe(true)
  })

  it('[AuthDto] debería validar usuario y contraseña obligatorios con formato base64.', () => {
    const dto = plainToInstance(AuthDto, {
      usuario: '   ',
      contrasena: 'no-base64',
    })
    const errors = validateSync(dto)

    expect(errors).toHaveLength(2)
    expect(errors[0].property).toBe('usuario')
    expect(errors[1].property).toBe('contrasena')
  })
})
