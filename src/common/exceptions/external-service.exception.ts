import { BaseException, Metadata } from '../../core/logger'

export class ExternalServiceException extends BaseException {
  constructor(servicio: string, error: unknown)
  constructor(servicio: string, error: unknown, mensaje: string)
  constructor(
    servicio: string,
    error: unknown,
    mensaje: string,
    metadata: Metadata
  )
  constructor(
    arg1: string,
    error?: unknown,
    mensaje?: string,
    metadata?: Metadata
  ) {
    const opt = {
      modulo: arg1,
      mensaje,
      metadata,
    }
    super(error, opt)
  }
}
