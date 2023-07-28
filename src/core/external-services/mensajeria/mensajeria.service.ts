import { Injectable } from '@nestjs/common'
import { map } from 'rxjs/operators'
import { ExternalServiceException } from '../../../common/exceptions/external-service.exception'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class MensajeriaService {
  constructor(private httpService: HttpService) {}

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

      return firstValueFrom(response)
    } catch (error) {
      throw new ExternalServiceException('MENSAJERIA:SMS', error)
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

      return firstValueFrom(response)
    } catch (error) {
      throw new ExternalServiceException('MENSAJERIA:CORREO', error)
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

      return firstValueFrom(response)
    } catch (error) {
      throw new ExternalServiceException('MENSAJERIA:SMS', error)
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
      return firstValueFrom(response)
    } catch (error) {
      throw new ExternalServiceException('MENSAJERIA:CORREO', error)
    }
  }
}
