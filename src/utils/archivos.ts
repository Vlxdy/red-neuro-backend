import { BadRequestException } from '@nestjs/common'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { FileFilterCallback } from 'multer'

/**
 * Lista de MIME types válidos.
 * Incluye PDF, imágenes y documentos (Word, Excel, OpenDocument, etc.)
 */
const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
  // PDF
  'application/pdf',
  // Imágenes
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  // Word (antiguo y moderno)
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel (antiguo y moderno)
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // OpenDocument (LibreOffice)
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
])

export const fileFilter: MulterOptions['fileFilter'] = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new BadRequestException(
        `El tipo de archivo "${file.mimetype}" no está permitido. 
Solo se aceptan PDF, imágenes y documentos (Word, Excel).`
      )
    )
  }
}
