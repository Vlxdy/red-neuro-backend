import { BaseException } from '../../core/logger'
import { ArgumentsHost, Catch } from '@nestjs/common'
import { Request, Response } from 'express'
import { BaseExceptionFilter } from '../base'
import { ErrorResponseDto } from '../dto/error-response.dto'

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super()
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const errorRequest = {
      method: request.method,
      originalUrl: request.originalUrl,
      headers: request.headers,
      params: request.params,
      query: request.query,
      body: request.body,
      user: request.user,
    }

    const except = new BaseException(exception, {
      metadata: {
        req: errorRequest,
      },
    })

    this.logger.error(except)

    const errorResult: ErrorResponseDto = {
      finalizado: false,
      codigo: except.getHttpStatus(),
      timestamp: Math.floor(Date.now() / 1000),
      mensaje: except.obtenerMensajeCliente(),
    }

    if (process.env.NODE_ENV !== 'production') {
      errorResult.datos = {
        causa: except.getCausa(),
        accion: except.getAccion(),
      }
    }

    if (errorResult.codigo >= 500) {
      this.logger.auditError('http-exception', {
        metadata: {
          codigo: errorResult.codigo,
          mensaje: errorResult.mensaje,
        },
      })
    } else {
      this.logger.auditWarning('http-exception', {
        metadata: {
          codigo: errorResult.codigo,
          mensaje: errorResult.mensaje,
        },
      })
    }

    response.status(errorResult.codigo).json(errorResult)
  }
}
