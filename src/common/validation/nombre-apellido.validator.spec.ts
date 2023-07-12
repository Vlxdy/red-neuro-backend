import { nombreApellido } from './nombre-apellido.validator'

describe('NombreApellido validator', () => {
  it('Debería retornar false para entradas undefined o null', () => {
    expect(nombreApellido(undefined)).toBe(false)
    expect(nombreApellido(null)).toBe(false)
  })

  it('Debería retornar false para entradas con longitud < 3 y > 30', () => {
    expect(nombreApellido('AN')).toBe(false)
    expect(nombreApellido('JUAN PEREZ DE LA SANTISIMA TRINIDAD')).toBe(false)
  })

  it('Debería retornar false para entradas con caracteres invalidos', () => {
    expect(nombreApellido('AN?!A.=)(')).toBe(false)
    expect(nombreApellido('_&%$/')).toBe(false)
  })

  it('Debería retornar true para entradas con acentos, ñ, apostrofes y dierecis', () => {
    expect(nombreApellido('José')).toBe(true)
    expect(nombreApellido('Pauliño')).toBe(true)
    expect(nombreApellido(`O'connor`)).toBe(true)
    expect(nombreApellido('Agüero')).toBe(true)
  })
})
