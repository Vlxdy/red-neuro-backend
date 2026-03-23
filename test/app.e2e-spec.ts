import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    process.env.MOBILE_ANDROID_MIN_VERSION = '1.8.0'
    process.env.MOBILE_ANDROID_STABLE_VERSION = '1.9.3'
    process.env.MOBILE_ANDROID_STORE_URL =
      'https://play.google.com/store/apps/details?id=test'

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })

  it('/estado (GET)', () => {
    return request(app.getHttpServer())
      .get('/estado')
      .expect(200)
      .expect((res) => {
        expect(res.body.datos.estado).toBeDefined()
        expect(res.body.datos.mobile).toBeNull()
      })
  })

  it('/estado (GET) con query mobile', () => {
    return request(app.getHttpServer())
      .get('/estado')
      .query({
        platform: 'android',
        version: '1.7.0',
        build: '100',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.datos.mobile).toEqual(
          expect.objectContaining({
            enabled: true,
            platform: 'android',
            status: 'required',
            forceUpdate: true,
          })
        )
      })
  })
})
