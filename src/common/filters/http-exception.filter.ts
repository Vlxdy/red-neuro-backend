import { ArgumentsHost, Catch } from '@nestjs/common'
import { Request, Response } from 'express'
import { BaseExceptionFilter } from '../base/base-exception-filter'
import { ExceptionError } from './exception.error'
import path from 'path'

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

    const exceptionError = new ExceptionError(exception)

    const errorResponse = {
      finalizado: false,
      codigo: exceptionError.codigo,
      timestamp: Math.floor(Date.now() / 1000),
      mensaje: exceptionError.mensaje,
      datos: {
        errores: exceptionError.errores,
      },
    }

    if (errorResponse.codigo < 500) {
      this.logger.warn({ errorResponse })
      if (exceptionError.stack) {
        const customErrorStack = this.stackMsg(exceptionError.stack)
        if (customErrorStack) this.logger.warn(customErrorStack)
      }
      this.logger.warn({ errorRequest })
      if (exceptionError.stack) {
        this.logger.warn(exceptionError.stack)
      }
    }

    if (errorResponse.codigo >= 500) {
      this.logger.error({ errorResponse })
      if (exceptionError.stack) {
        const customErrorStack = this.stackMsg(exceptionError.stack)
        if (customErrorStack) this.logger.error(customErrorStack)
      }
      this.logger.error({ errorRequest })
      if (exceptionError.stack) {
        this.logger.error(exceptionError.stack)
      }
    }

    if (process.env.NODE_ENV === 'production') {
      errorResponse.datos.errores = []
    }

    response.status(errorResponse.codigo).json(errorResponse)
  }

  private stackMsg(originalErrorStack: string) {
    try {
      const projectPath = path.resolve(__dirname, '../../../../')
      const customErrorStack = originalErrorStack
        .split('\n')
        .map((x) => x.replace(new RegExp(projectPath, 'g'), '...'))
        .filter((x) => x.includes('.../src'))
        .map((x) =>
          x.trim().startsWith('at')
            ? x.trim().split(' ').slice(2).join(' -> ')
            : x.trim()
        )
        .join('\n')
        .trim()
      return customErrorStack ? `Error stack:\n${customErrorStack}` : ''
    } catch (err) {
      return originalErrorStack
    }
  }
}
