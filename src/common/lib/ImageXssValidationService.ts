import { BadRequestException, Injectable } from '@nestjs/common'
import * as fileType from 'file-type'
import * as fs from 'fs/promises'
import { MimeType } from 'file-type/core'

@Injectable()
export class ImageXssValidationService {
  // Constantes con los tipos de imagen permitidos
  private readonly allowedMimeTypes: Array<MimeType> = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heif',
    'image/heic',
  ]

  /**
   * Método principal para validar el archivo de imagen.
   * @param file Archivo proporcionado a través de multer.
   * @returns booleano indicando si es válido o no.
   */
  async validateImageFile(file: Express.Multer.File): Promise<boolean> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo')
    }

    // Leer el contenido del archivo
    const buffer = await fs.readFile(file.path)

    // Verificar el tipo de archivo utilizando file-type
    const fileTypeResult = await fileType.fromBuffer(buffer)
    if (!fileTypeResult || !this.isAllowedMimeType(fileTypeResult.mime)) {
      throw new BadRequestException('El archivo no es una imagen válida')
    }

    // Verificar si el archivo contiene algún patrón potencialmente peligroso
    if (this.containsScript(buffer)) {
      throw new BadRequestException(
        'El archivo contiene contenido potencialmente peligroso'
      )
    }

    return true
  }

  /**
   * Verífica si el MIME type está en la lista de tipos permitidos.
   * @param mimeType Tipo MIME a verificar.
   * @returns booleano indicando si está permitido.
   */
  private isAllowedMimeType(mimeType: string): boolean {
    return this.allowedMimeTypes.includes(mimeType as MimeType)
  }

  /**
   * Busca patrones peligrosos en el contenido del archivo, que puedan indicar un ataque XSS.
   * @param buffer Contenido del archivo.
   * @returns booleano indicando si contiene un script potencialmente peligroso.
   */
  private containsScript(buffer: Buffer): boolean {
    const content = buffer.toString().toLowerCase()
    const dangerousPatterns = [
      '<script',
      'javascript:',
      'onerror=',
      'onload=',
      'eval(',
      'document.cookie',
    ]

    // Usa Array.prototype.some() para una verificación concisa
    return dangerousPatterns.some((pattern) => content.includes(pattern))
  }
}
