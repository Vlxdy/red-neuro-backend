import { describe, expect, it } from '@jest/globals'
import { LoggerParams } from './LoggerParams'

describe('LoggerParams', () => {
  it('debería aceptar un solo contexto de auditoría', () => {
    new LoggerParams({ audit: 'request' })

    expect(LoggerParams.AUDIT).toEqual(['request'])
  })

  it('debería normalizar contextos separados por coma y espacio', () => {
    new LoggerParams({ audit: 'application, request   ws' })

    expect(LoggerParams.AUDIT).toEqual(['application', 'request', 'ws'])
  })

  it('debería remover comillas externas en la configuración de auditoría', () => {
    new LoggerParams({ audit: "'application request'" })

    expect(LoggerParams.AUDIT).toEqual(['application', 'request'])
  })
})
