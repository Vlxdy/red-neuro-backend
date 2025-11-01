export type ArchivoDescargable =
  | {
      tipo: 'path'
      path: string
      nombreArchivo: string
      mimeType: string
    }
  | {
      tipo: 'buffer'
      buffer: Buffer
      nombreArchivo: string
      mimeType: string
    }
