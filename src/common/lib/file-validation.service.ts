import { Injectable } from '@nestjs/common'
import * as fileType from 'file-type'
import * as fs from 'fs/promises'
import { MimeType } from 'file-type/core'

interface ValidationResult {
  isValid: boolean
  error?: string
}

@Injectable()
export class FileValidationService {
  // Tipos de archivo permitidos por categoría
  private readonly allowedMimeTypes = {
    image: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heif',
      'image/heic',
    ] as Array<MimeType>,
    pdf: ['application/pdf'] as Array<MimeType>,
    // Agregar más categorías según sea necesario
  }

  // Patrones de validación por tipo de archivo
  private readonly validationPatterns = {
    image: [
      '<script',
      'javascript:',
      'onerror=',
      'onload=',
      'eval(',
      'document.cookie',
    ],
    pdf: [
      '<script',
      'javascript:',
      '/JS',
      '/JavaScript',
      '/Action',
      'eval(',
      'document.cookie',
    ],
    // Agregar más patrones según sea necesario
  }

  /**
   * Valida un archivo según su tipo esperado.
   * @param file Archivo a validar
   * @param fileCategory Categoría del archivo ('image', 'pdf', etc.)
   * @returns Resultado de la validación
   */
  async validateFile(
    file: Express.Multer.File,
    fileCategory: keyof typeof this.allowedMimeTypes
  ): Promise<ValidationResult> {
    if (!file) {
      return {
        isValid: false,
        error: 'No se ha proporcionado ningún archivo',
      }
    }

    try {
      // Leer el contenido del archivo
      const buffer = await fs.readFile(file.path)

      // Verificar el tipo de archivo
      const fileTypeResult = await fileType.fromBuffer(buffer)
      if (
        !fileTypeResult ||
        !this.isAllowedMimeType(fileTypeResult.mime, fileCategory)
      ) {
        return {
          isValid: false,
          error: `El archivo no es un ${fileCategory} válido`,
        }
      }

      // Verificar contenido malicioso
      const scriptCheckResult = this.containsScript(buffer, fileCategory)
      if (scriptCheckResult) {
        return {
          isValid: false,
          error: 'El archivo contiene contenido potencialmente peligroso',
        }
      }

      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: 'Error al procesar el archivo',
      }
    }
  }

  /**
   * Verifica si el MIME type está permitido para la categoría especificada.
   */
  private isAllowedMimeType(
    mimeType: string,
    category: keyof typeof this.allowedMimeTypes
  ): boolean {
    return this.allowedMimeTypes[category].includes(mimeType as MimeType)
  }

  /**
   * Busca patrones peligrosos según el tipo de archivo.
   */
  private containsScript(
    buffer: Buffer,
    category: keyof typeof this.validationPatterns
  ): boolean {
    const content = buffer.toString().toLowerCase()
    return this.validationPatterns[category].some((pattern) =>
      content.includes(pattern)
    )
  }
}
