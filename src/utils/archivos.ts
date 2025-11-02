import { BadRequestException } from '@nestjs/common'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { FileFilterCallback } from 'multer'
import { Request } from 'express'

/**
 * Lista de MIME types válidos para evaluaciones y antecedentes.
 * Incluye PDF, imágenes y documentos (Word, Excel, OpenDocument, etc.).
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

/**
 * Lista extendida de MIME types válidos para el chat.
 * Incluye PDF, imágenes, audio y video en formatos comunes.
 */
const CHAT_ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
  ...ALLOWED_MIME_TYPES,
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/mpeg',
])

const buildFileFilter =
  (allowedMimeTypes: ReadonlySet<string>, mensajeError: string) =>
  (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new BadRequestException(mensajeError))
    }
  }

export const fileFilter: MulterOptions['fileFilter'] = buildFileFilter(
  ALLOWED_MIME_TYPES,
  'El tipo de archivo no está permitido. Solo se aceptan PDF, imágenes y documentos (Word, Excel, OpenDocument).'
)

export const chatFileFilter: MulterOptions['fileFilter'] = buildFileFilter(
  CHAT_ALLOWED_MIME_TYPES,
  'El tipo de archivo no está permitido. Solo se aceptan PDF, imágenes, audios y videos en formatos comunes.'
)

export const getChatAllowedMimeTypes = () => Array.from(CHAT_ALLOWED_MIME_TYPES)

export const getChatMaxPreviewableMimeTypes = () =>
  Array.from(CHAT_ALLOWED_MIME_TYPES).filter(
    (mime) => mime.startsWith('image/') || mime === 'application/pdf'
  )
