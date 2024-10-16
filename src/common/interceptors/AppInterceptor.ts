import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
  SetMetadata,
} from '@nestjs/common'
import { Observable, TimeoutError } from 'rxjs'
import { catchError, tap, timeout } from 'rxjs/operators'
import { throwError } from 'rxjs'
import { LoggerService, Metadata } from '../../core/logger'
import { Request, Response } from 'express'
import { Reflector } from '@nestjs/core'

const logger = LoggerService.getInstance()

const TIEMPO_ESPERA_POR_DEFECTO = Number(
  process.env.REQUEST_TIMEOUT_IN_SECONDS || '30'
)

// DECORADOR PARA PERSONALIZAR EL TIEMPO MÁXIMO DE ESPERA PARA UN SERVICIO EN ESPECÍFICO
export const SetRequestTimeout = (tiempoMaximoEsperaEnSegundos: number) => {
  return SetMetadata('tiempoMaximoEspera', tiempoMaximoEsperaEnSegundos)
}

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>() as
      | Request
      | undefined

    const response = context.switchToHttp().getResponse<Response>() as
      | Response
      | undefined

    const tiempoEspera =
      this.reflector.get<number>('tiempoMaximoEspera', context.getHandler()) ||
      TIEMPO_ESPERA_POR_DEFECTO

    return next.handle().pipe(
      timeout(tiempoEspera * 1000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          const mensaje = `La solicitud está demorando demasiado`
          return throwError(() => {
            return new RequestTimeoutException(mensaje, {
              cause: `Se superó el tiempo máximo de espera (${tiempoEspera} seg.)`,
            })
          })
        }
        return throwError(() => err)
      }),
      tap((data) => {
        // REGISTRO DEL LOG DE RESPUESTA DEL SERVICIO
        const metadata: Metadata = {
          status: response?.statusCode,
          elapsedTimeMs: request ? Date.now() - Number(request.startTime) : 0,
          method: request?.method,
          url: request ? String(request.originalUrl).split('?')[0] : undefined,
        }
        if (LoggerService.isDebugEnabled()) {
          metadata.data =
            typeof data === 'object' && data && !('statusCode' in data)
              ? data
              : undefined
        }
        logger.audit('response', {
          metadata,
          consoleOptions: {
            mensaje: `${metadata.method} ${metadata.url} {status} {elapsedTimeMs} {data}`,
          },
        })
      })
    )
  }
}
