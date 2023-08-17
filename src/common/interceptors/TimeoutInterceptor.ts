import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common'
import { Observable, throwError, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'
import { Request } from 'express'
import dotenv from 'dotenv'

dotenv.config()

let tiempoMaximoEsperaEnSegundos = Number(
  process.env.REQUEST_TIMEOUT_IN_SECONDS || '30'
)

const customTimeoutList = [
  { method: 'GET', path: '/api/estado', timeout: tiempoMaximoEsperaEnSegundos },
  // ...
]

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest() as Request

    customTimeoutList.forEach((item) => {
      if (req.method === item.method && req.originalUrl.startsWith(item.path)) {
        tiempoMaximoEsperaEnSegundos = item.timeout
      }
    })

    return next.handle().pipe(
      timeout(tiempoMaximoEsperaEnSegundos * 1000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          const mensaje = `La solicitud está demorando demasiado (tiempo transcurrido: ${tiempoMaximoEsperaEnSegundos} seg)`
          return throwError(() => new RequestTimeoutException(mensaje))
        }
        return throwError(() => err)
      })
    )
  }
}
