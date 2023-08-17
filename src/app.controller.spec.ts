import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'

describe('App controller', () => {
  let controller: AppController
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AppController],
      providers: [],
    }).compile()

    controller = module.get<AppController>(AppController)
  })

  it('[listar] Debería devolver el status', async () => {
    const result = await controller.verificarEstado()
    expect(result).toBeDefined()
    expect(result).toHaveProperty('estado')
    expect(result).toHaveProperty('hora')
    expect(result).toHaveProperty('commit_sha')
  })
})
