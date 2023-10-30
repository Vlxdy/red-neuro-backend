import { nroDocumento } from './nro-documento.validator'

describe('NroDocumento validator', () => {
  it('Debería retornar false para entradas undefined o null', () => {
    expect(nroDocumento(undefined)).toBe(false)
    expect(nroDocumento(null)).toBe(false)
  })

  it('Debería retornar false para entradas con longitud < 4 y > 10', () => {
    expect(nroDocumento('123')).toBe(false)
    expect(nroDocumento('123456789012')).toBe(false)
  })

  it('Debería retornar true para entradas con formato extranjero', () => {
    expect(nroDocumento('E-12345')).toBe(true)
    expect(nroDocumento('e-12345')).toBe(true)
  })

  it('Debería retornar false para entradas con formato extranjero cuando se deshabilita la validación', () => {
    expect(nroDocumento('E-12345', { extranjero: false })).toBe(false)
    expect(nroDocumento('e-12345', { extranjero: false })).toBe(false)
  })

  it('Debería retornar true para entradas con formato con complemento', () => {
    expect(nroDocumento('12345-11')).toBe(true)
    expect(nroDocumento('12345-1A')).toBe(true)
    expect(nroDocumento('12345-AA')).toBe(true)
    expect(nroDocumento('12345-A1')).toBe(true)
  })

  it('Debería retornar false para entradas con formato con complemento cuando se deshabilita la validación', () => {
    expect(nroDocumento('12345-11', { complemento: false })).toBe(false)
    expect(nroDocumento('12345-1A', { complemento: false })).toBe(false)
    expect(nroDocumento('12345-AA', { complemento: false })).toBe(false)
    expect(nroDocumento('12345-A1', { complemento: false })).toBe(false)
  })
})
