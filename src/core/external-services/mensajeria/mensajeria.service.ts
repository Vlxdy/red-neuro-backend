import { BaseService } from '../../../common/base'
import { Injectable } from '@nestjs/common'
import { map } from 'rxjs/operators'
import { ExternalServiceException } from '../../../common/exceptions'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

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
      const response = this.httpService
        .post('/correo', emailBody)
        .pipe(map((res) => res.data))
      const result = await firstValueFrom(response)
      this.logger.auditInfo('mensajeria', 'E-MAIL enviado correctamente')
      return result
    } catch (error) {
      this.logger.auditError('mensajeria', 'Falló al enviar el E-MAIL', {
        status: error.response?.status,
        data: error.response?.data,
      })
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
