import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { plainToClass } from 'class-transformer'
import { Status } from '../../../common/constants'
import { TextService } from '../../../common/lib/text.service'
import { ActualizarContrasenaDto } from '../dto/actualizar-contrasena.dto'
import { CrearUsuarioDto } from '../dto/crear-usuario.dto'
import { UsuarioController } from './usuario.controller'
import { UsuarioService } from '../service/usuario.service'
import { FiltrosUsuarioDto } from '../dto/filtros-usuario.dto'
import { CanActivate } from '@nestjs/common'
import { CasbinGuard } from '../../authorization/guards/casbin.guard'

const resUsuario = {
  id: TextService.generateUuid(),
  usuario: '7171717',
  correoElectonico: 'fake@yopmail.com',
  estado: 'ACTIVO',
}

const resListar = [1, resUsuario]

const resPerfil = {
  id: TextService.generateUuid(),
  usuario: '7171717',
  estado: Status.ACTIVE,
  roles: {},
  persona: {},
}

const mockRequest = {
  user: {
    id: TextService.generateUuid(),
  },
}

describe('UsuarioController', () => {
  let controller: UsuarioController
  let service: UsuarioService
  beforeAll(async () => {
    const mock_ForceFailGuard: CanActivate = {
      canActivate: jest.fn(() => true),
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: {
            listar: jest.fn(() => resListar),
            buscarUsuarioId: jest.fn(() => resPerfil),
            crear: jest.fn(() => resUsuario),
            activar: jest.fn(() => resUsuario),
            inactivar: jest.fn(() => resUsuario),
            actualizarContrasena: jest.fn(() => resUsuario),
            restaurarContrasena: jest.fn(() => resUsuario),
            buscarUsuarioPerfil: jest.fn(() => resUsuario),
          },
        },
        ConfigService,
      ],
    })
      .overrideGuard(CasbinGuard)
      .useValue(mock_ForceFailGuard)
      .compile()

    controller = module.get<UsuarioController>(UsuarioController)
    service = module.get<UsuarioService>(UsuarioService)
  })

  it('[listar] Debería listar usuarios', async () => {
    const pagination = new FiltrosUsuarioDto()
    const result = await controller.listar(pagination)

    expect(service.listar).toBeCalled()
    expect(result).toBeDefined()
    expect(result).toHaveProperty('finalizado')
    expect(result).toHaveProperty('mensaje')
    expect(result).toHaveProperty('datos')
    expect(result.datos).toHaveProperty('total')
    expect(result.datos).toHaveProperty('filas')
  })

  it('[obtenerPerfil] Debería obtener el perfil de un usuario', async () => {
    const perfil = await controller.obtenerPerfil(mockRequest)

    expect(perfil).toBeDefined()
    expect(perfil).toHaveProperty('finalizado')
    expect(perfil.finalizado).toEqual(true)
  })

  it('[crear] Debería crear un usuario', async () => {
    const datosUsuario = {
      correoElectronico: 'fake@yopmail.com',
      persona: {
        nroDocumento: '7171717',
        nombres: 'JUAN',
        primerApellido: 'PEREZ',
        segundoApellido: 'PEREZ',
        fechaNacimiento: '1999-11-11',
      },
      roles: [TextService.generateUuid()],
    }
    const usuarioDTo = plainToClass(CrearUsuarioDto, datosUsuario)
    const usuario = await controller.crear(mockRequest, usuarioDTo)

    expect(usuario).toBeDefined()
    expect(usuario).toHaveProperty('finalizado')
    expect(usuario.finalizado).toEqual(true)
  })

  it('[activar] Debería activar un usuario', async () => {
    const param = {
      id: TextService.generateUuid(),
    }
    const usuario = await controller.activar(mockRequest, param)

    expect(usuario).toBeDefined()
    expect(usuario).toHaveProperty('finalizado')
    expect(usuario.finalizado).toEqual(true)
  })

  it('[inactivar] Debería inactivar un usuario', async () => {
    const param = {
      id: TextService.generateUuid(),
    }
    const usuario = await controller.inactivar(mockRequest, param)

    expect(usuario).toBeDefined()
    expect(usuario).toHaveProperty('finalizado')
    expect(usuario.finalizado).toEqual(true)
  })

  it('[acualizarContrasena] Debería actualizar la contrasena de un usuario', async () => {
    const datosBody = {
      constrasenaActual: TextService.generateShortRandomText(),
      contrasenaNueva: TextService.generateShortRandomText(),
    }
    const body = plainToClass(ActualizarContrasenaDto, datosBody)
    const usuario = await controller.actualizarContrasena(mockRequest, body)

    expect(usuario).toBeDefined()
    expect(usuario).toHaveProperty('finalizado')
    expect(usuario.finalizado).toEqual(true)
  })

  it('[restaurarContrasena] Debería restaurar la contrasena de un usuario', async () => {
    const param = {
      id: TextService.generateUuid(),
    }
    const usuario = await controller.restaurarContrasena(mockRequest, param)

    expect(usuario).toBeDefined()
    expect(usuario).toHaveProperty('finalizado')
    expect(usuario.finalizado).toEqual(true)
  })
})
