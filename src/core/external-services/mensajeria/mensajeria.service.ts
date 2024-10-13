import { BaseService } from '@/common/base'
import { Injectable, RequestTimeoutException } from '@nestjs/common'
import { catchError, map, timeout } from 'rxjs/operators'
import { ExternalServiceException } from '@/common/exceptions'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom, throwError, TimeoutError } from 'rxjs'

const TIEMPO_MAXIMO_ESPERA_EN_SEGUNDOS = Number(
  process.env.MSJ_TIMEOUT_EN_SEGUNDOS || '10'
)

@Injectable()
export class MensajeriaService extends BaseService {
  constructor(private httpService: HttpService) {
    super()
  }

  /**
   * Metodo para enviar sms
   * @param cellphone Numero de celular
   * @param content contenido
   */
  async sendSms(cellphone: string, content: string) {
    try {
      const smsBody = {
        para: [cellphone],
        contenido: content,
      }
      const response = this.httpService
        .post('/sms', smsBody)
        .pipe(map((res) => res.data))

      return await firstValueFrom(response)
    } catch (error) {
      const mensaje = 'Ocurrió un error al enviar el mensaje por SMS'
      throw new ExternalServiceException('MENSAJERÍA:SMS', error, mensaje)
    }
  }

  /**
   * Metodo para enviar correo
   * @param email Correo Electronico
   * @param subject asunto
   * @param content contenido
   */
  async sendEmail(email: string, subject: string, content: string) {
    try {
      const emailBody = {
        para: [email],
        asunto: subject,
        contenido: content,
      }
      const t1 = Date.now()
      const response = this.httpService.post('/correo', emailBody).pipe(
        timeout(TIEMPO_MAXIMO_ESPERA_EN_SEGUNDOS * 1000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            const mensaje = `La solicitud está demorando demasiado`
            return throwError(() => {
              return new RequestTimeoutException(mensaje, {
                cause: `Se superó el tiempo máximo de espera (${TIEMPO_MAXIMO_ESPERA_EN_SEGUNDOS} seg.)`,
              })
            })
          }
          return throwError(() => err)
        }),
        map((res) => {
          const t2 = Date.now()
          const statusCode = res.status
          const elapsedTimeMs = t2 - t1
          this.logger.audit('mensajeria', {
            mensaje: 'E-MAIL enviado correctamente',
            metadata: {
              status: statusCode,
              elapsedTimeMs,
              asunto: emailBody.asunto,
            },
          })
          return res.data
        })
      )
      const result = await firstValueFrom(response)
      return result
    } catch (error) {
      const mensaje = 'Ocurrió un error al enviar el mensaje por E-MAIL'
      throw new ExternalServiceException('MENSAJERÍA:CORREO', error, mensaje)
    }
  }

  /**
   * Metodo para obtener el estado de un sms enviado
   * @param id Identificador de solicitud sms
   */
  async getReportSms(id: string) {
    try {
      const response = this.httpService
        .get(`/sms/reporte/${id}`)
        .pipe(map((res) => res.data))

      return await firstValueFrom(response)
    } catch (error) {
      const mensaje = 'Ocurrió un error al obtener el reporte del SMS'
      throw new ExternalServiceException('MENSAJERÍA:SMS', error, mensaje)
    }
  }

  /**
   * Metodo para obtener el estado de un correo enviado
   * @param id Identificador de solicitud correo
   */
  async getReportEmail(id: string) {
    try {
      const response = this.httpService
        .get(`/correo/reporte/${id}`)
        .pipe(map((res) => res.data))
      return await firstValueFrom(response)
    } catch (error) {
      const mensaje = 'Ocurrió un error al obtener el reporte del E-MAIL'
      throw new ExternalServiceException('MENSAJERÍA:CORREO', error, mensaje)
    }
  }
}
