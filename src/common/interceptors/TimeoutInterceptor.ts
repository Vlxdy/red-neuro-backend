import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common'
import { Observable, throwError, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'
import { SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import dotenv from 'dotenv'
dotenv.config()

export const SetRequestTimeout = (tiempoMaximoEsperaEnSegundos: number) => {
  return SetMetadata('tiempoMaximoEspera', tiempoMaximoEsperaEnSegundos)
}

const TIEMPO_ESPERA_POR_DEFECTO = Number(
  process.env.REQUEST_TIMEOUT_IN_SECONDS || '30'
)

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const tiempoEspera =
      this.reflector.get<number>('tiempoMaximoEspera', context.getHandler()) ||
      TIEMPO_ESPERA_POR_DEFECTO

    return next.handle().pipe(
      timeout(tiempoEspera * 1000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          const mensaje = `La solicitud está demorando demasiado (tiempo transcurrido: ${tiempoEspera} seg)`
          return throwError(() => new RequestTimeoutException(mensaje))
        }
        return throwError(() => err)
      })
    )
  }
}
