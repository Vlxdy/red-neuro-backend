import { PdfService } from './pdf.service'

describe('PdfService', () => {
  it('[generateBase64] Debería generar un documento y retornar el resultado en base64', async () => {
    const template = '<h1>Test</h1>'
    const pdfBase64 = await PdfService.generateBase64(template)
    const base64regex =
      /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

    expect(pdfBase64).toBeDefined()
    expect(pdfBase64).toMatch(base64regex)
  })

  it('[generateBuffer] Debería generar un documento y retornar el resultado como buffer', async () => {
    const template = '<h1>Test</h1>'
    const pdfBuffer = await PdfService.generateBuffer(template)

    expect(pdfBuffer).toBeDefined()
    expect(pdfBuffer).toBeInstanceOf(Uint8Array)
  })

  it('[generateBuffer] Debería generar un documento y retornar el resultado como stream', () => {
    const template = '<h1>Test</h1>'
    const pdfBuffer = PdfService.generateStream(template)

    expect(pdfBuffer).toBeDefined()
    expect(pdfBuffer).toHaveProperty('page')
  })
})
