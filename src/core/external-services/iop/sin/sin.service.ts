import { ExternalServiceException } from '../../../../common/exceptions'
import { BaseService } from '../../../../common/base'
import { Injectable } from '@nestjs/common'
import { SINCredencialesDTO } from './credenciales.dto'
import { HttpService } from '@nestjs/axios'
import { AxiosRequestConfig } from 'axios'
import { LoginResponse, LoginResult } from './types'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class SinService extends BaseService {
  constructor(protected http: HttpService) {
    super()
  }

  /**
   * @title Login
   * @description Método para verificar si la información de la empresa existe en el servicio del SIN
   */
  async login(datosSIN: SINCredencialesDTO): Promise<LoginResult> {
    let mensaje: string | undefined = undefined

    try {
      const config: AxiosRequestConfig = {
        url: '/login',
        method: 'post',
        data: {
          nit: datosSIN.Nit,
          usuario: datosSIN.Usuario,
          clave: datosSIN.Contrasena,
        },
      }

      const response = await firstValueFrom(this.http.request(config))
      const body = response?.data as LoginResponse
      const metadata = { datosSIN, response }

      if (
        !body.Estado &&
        body.Mensaje &&
        body.Mensaje.includes('You cannot consume this service')
      ) {
        const error = body.Mensaje
        mensaje = `No tiene permisos para usar este servicio.`
        throw new ExternalServiceException('SIN', error, mensaje, metadata)
      }

      if (
        !body.Estado &&
        body.Mensaje &&
        body.Mensaje.includes('no API found with those values')
      ) {
        const error = body.Mensaje
        mensaje = `No se encontró el servicio solicitado.`
        throw new ExternalServiceException('SIN', error, mensaje, metadata)
      }

      if (!body.Autenticado) {
        const error = null
        mensaje = body.Mensaje || 'Error desconocido'
        throw new ExternalServiceException('SIN', error, mensaje, metadata)
      }

      return {
        finalizado: true,
        mensaje: body.Estado,
      }
    } catch (error) {
      const mensajePorDefecto = `Ocurrió un error de autenticación con el Servicio de Impuestos Nacionales`
      mensaje = mensaje || mensajePorDefecto

      const metadata = { datosSIN }
      this.logger.error(error, mensaje, metadata, 'SIN')
      return {
        finalizado: false,
        mensaje,
      }
    }
  }
}
