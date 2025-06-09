import { Test, TestingModule } from '@nestjs/testing'
import { RolService } from './rol.service'
import { RolRepository } from '../repository/rol.repository'
import { UsuarioRolRepository } from '../repository/usuario-rol.repository'

const resRolesList = {
  id: '1e9215f2-47cd-45e4-a593-4289413503e0',
  rol: 'ADMINISTRADOR',
}

describe('RolService', () => {
  let service: RolService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolService,
        {
          provide: RolRepository,
          useValue: {
            listar: jest.fn(() => [resRolesList]),
          },
        },
        {
          provide: UsuarioRolRepository,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<RolService>(RolService)
  })

  it('[listar] Debería obtener la lista de roles', async () => {
    const usuarios = await service.listar()

    expect(usuarios).toBeDefined()
    expect(usuarios).toBeInstanceOf(Array)
  })
})
