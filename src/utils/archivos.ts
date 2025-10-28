import { BadRequestException } from '@nestjs/common'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { FileFilterCallback } from 'multer'

type AllowedMime = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp'

const ALLOWED_MIME_TYPES: ReadonlySet<AllowedMime> = new Set<AllowedMime>([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const fileFilter: MulterOptions['fileFilter'] = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype as AllowedMime)) {
    cb(null, true)
  } else {
    cb(
      new BadRequestException(
        'Solo se permiten PDF o imágenes (JPG, PNG, WEBP).'
      )
    )
  }
}
