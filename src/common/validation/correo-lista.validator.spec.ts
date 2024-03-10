import { correoLista } from './correo-lista.validator'
describe('CorreoLista validator', () => {
  it('Debería retornar false para entradas undefined o null', () => {
    expect(correoLista(undefined)).toBe(false)
    expect(correoLista(null)).toBe(false)
  })

  it('Debería retornar false para correos sin el formato correcto', () => {
    expect(correoLista('juan.mail.com')).toBe(false)
    expect(correoLista('@juan.mail.com')).toBe(false)
    expect(correoLista('juan@')).toBe(false)
  })

  it('Debería retornar true para correos que no esten en la lista negra', () => {
    expect(correoLista('correo@gmail.com')).toBe(true)
    expect(correoLista('correo@hotmail.com')).toBe(true)
    expect(correoLista(`correo@yahoo.com`)).toBe(true)
  })
})
