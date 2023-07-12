import { CanActivate } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthZManagementService } from 'nest-authz'
import { CasbinGuard } from '../guards/casbin.guard'
import { AuthorizationController } from './authorization.controller'
import { AuthorizationService } from './authorization.service'
import { Order } from '../../../common/constants'

const resPolitica = {
  sujeto: 'ADMINISTRADOR',
  objeto: '/usuarios',
  accion: 'GET',
  app: 'backend',
}

const resListar = [1, resPolitica]

const resListarCasbin = ['ADMINISTRADOR', '/usuarios', 'GET', 'backend']
describe('AuthorizationController', () => {
  let controller: AuthorizationController
  beforeEach(async () => {
    const mock_ForceFailGuard: CanActivate = {
      canActivate: jest.fn(() => true),
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizationController],
      providers: [
        {
          provide: AuthorizationService,
          useValue: {
            listarPoliticas: jest.fn(() => resListar),
            obtenerRoles: jest.fn(() => [resListarCasbin]),
            crearPolitica: jest.fn(() => resPolitica),
            eliminarPolitica: jest.fn(() => resPolitica),
          },
        },
        {
          provide: AuthZManagementService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(CasbinGuard)
      .useValue(mock_ForceFailGuard)
      .compile()

    controller = module.get<AuthorizationController>(AuthorizationController)
  })

  it('[listar] Debería listar políticas en formato filas y total', async () => {
    const result = await controller.listarPoliticas({
      limite: 0,
      pagina: 0,
      get saltar(): number {
        return 0
      },
      filtro: 'q',
      get sentido() {
        return Order.DESC
      },
      get orden() {
        return undefined
      },
      get descendente() {
        return false
      },
    })
    expect(result).toBeDefined()
    expect(result).toHaveProperty('finalizado')
    expect(result).toHaveProperty('mensaje')
    expect(result).toHaveProperty('datos')
    expect(result.datos).toHaveProperty('total')
    expect(result.datos).toHaveProperty('filas')
  })
  it('[obtenerRoles] Debería listar politicas en formato casbin', async () => {
    const result = await controller.obtenerRoles()
    expect(result).toBeDefined()
    expect(result).toHaveProperty('finalizado')
    expect(result).toHaveProperty('mensaje')
    expect(result).toHaveProperty('datos')
    expect(result.datos).toBeInstanceOf(Array)
  })

  it('[crearPolitica] Debería crear una política', async () => {
    const politica = { ...resPolitica }
    const result = await controller.crearPolitica(politica)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('finalizado')
    expect(result.finalizado).toEqual(true)
  })

  it('[eliminarPolitica] Debería eliminar una política', async () => {
    const politica = { ...resPolitica }
    const result = await controller.eliminarPolitica(politica)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('finalizado')
    expect(result.finalizado).toEqual(true)
  })
})
