import { TextService } from './text.service'

describe('TextService', () => {
  it('[textToUuid] Debería retornar un uuid dada una cadena', async () => {
    const texto = 'prueba'
    const uuid = TextService.textToUuid(texto)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    expect(uuid).toBeDefined()
    expect(uuid).toMatch(uuidRegex)
  })

  it('[validateLevelPassword] Debería retornar true si la contrasena es segura', async () => {
    const longitudTexto = 12
    const texto = TextService.generateShortRandomText(longitudTexto)
    const uuid = TextService.validateLevelPassword(texto)

    expect(uuid).toBeDefined()
    expect(uuid).toBe(true)
  })

  it('[validateLevelPassword] Debería retornar false si la contrasena es insegura', async () => {
    const texto = 'password'
    const uuid = TextService.validateLevelPassword(texto)

    expect(uuid).toBeDefined()
    expect(uuid).toBe(false)
  })

  it('[generateNanoId] Debería retornar un ID corto', async () => {
    const uuid = TextService.generateNanoId()
    const uuidRegex = /[A-Za-z0-9_-]{21}$/i

    expect(uuid).toBeDefined()
    expect(uuid).toMatch(uuidRegex)
  })
})
