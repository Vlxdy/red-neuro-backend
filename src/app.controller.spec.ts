import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'
import { MobileVersionService } from './mobile-version/mobile-version.service'
import { beforeAll, describe, expect, it } from '@jest/globals'

describe('App controller', () => {
  let controller: AppController
  beforeAll(async () => {
    process.env.MOBILE_ANDROID_MIN_VERSION = '1.8.0'
    process.env.MOBILE_ANDROID_STABLE_VERSION = '1.9.3'
    process.env.MOBILE_ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=test'

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AppController],
      providers: [MobileVersionService],
    }).compile()

    controller = module.get<AppController>(AppController)
  })

  it('[listar] Debería devolver el status', () => {
    const result = controller.verificarEstado({})
    expect(result).toBeDefined()
    expect(result).toHaveProperty('datos.estado')
    expect(result).toHaveProperty('datos.hora')
    expect(result).toHaveProperty('datos.commit_sha')
  })

  it('[mobile] Debería marcar actualización obligatoria cuando la versión sea menor a la mínima', () => {
    const result = controller.verificarEstado({
      platform: 'android',
      version: '1.7.0',
      build: '100',
    })

    expect(result.datos.mobile).toEqual(
      expect.objectContaining({
        enabled: true,
        status: 'required',
        forceUpdate: true,
        shouldUpdate: true,
        minVersion: '1.8.0',
        stableVersion: '1.9.3',
      })
    )
  })

  it('[mobile] Debería marcar actualización recomendada cuando la versión sea menor a la estable', () => {
    const result = controller.verificarEstado({
      platform: 'android',
      version: '1.8.5',
      build: '101',
    })

    expect(result.datos.mobile).toEqual(
      expect.objectContaining({
        enabled: true,
        status: 'recommended',
        forceUpdate: false,
        shouldUpdate: true,
      })
    )
  })

  it('[mobile] Debería marcar estado ok cuando la versión sea igual o mayor a la estable', () => {
    const result = controller.verificarEstado({
      platform: 'android',
      version: '1.9.3',
      build: '102',
    })

    expect(result.datos.mobile).toEqual(
      expect.objectContaining({
        enabled: true,
        status: 'ok',
        forceUpdate: false,
        shouldUpdate: false,
      })
    )
  })
})
