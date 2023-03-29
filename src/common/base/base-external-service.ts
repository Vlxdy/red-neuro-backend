import { HttpService } from '@nestjs/axios'
import { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import { firstValueFrom } from 'rxjs'
import { BaseService } from './base-service'

export type RequestOptions = {
  validarIOP?: boolean
}

export type RequestResult = {
  config?: AxiosRequestConfig
  error?: unknown | null
  response: Partial<AxiosResponse> | null
  errorMessage?: string
}

export class BaseExternalService extends BaseService {
  protected name = 'BASE'

  constructor(protected http: HttpService) {
    super()
  }

  async request(
    axiosConfig: AxiosRequestConfig,
    opt: RequestOptions = {}
  ): Promise<RequestResult> {
    try {
      this.setDefaultValues(opt)
      const response = await firstValueFrom(this.http.request(axiosConfig))
      this.logger.trace({
        config: axiosConfig,
        response: {
          status: response.status,
          body: response.data,
        },
      })
      return { response }
    } catch (error) {
      const requestInfo: RequestResult = {
        config: axiosConfig,
        response: null,
        error,
        errorMessage: 'Error desconocido',
      }

      // TYPED ERROR
      if (!error || typeof error !== 'object') {
        this.logger.error(requestInfo)
        return requestInfo
      }

      // CONEXION ERROR
      if (!(error instanceof AxiosError) || !error.response) {
        if (
          [
            'ESOCKETTIMEDOUT',
            'ETIMEDOUT',
            'ECONNREFUSED',
            'ENOTFOUND',
          ].includes(String(error.code))
        ) {
          requestInfo.errorMessage = `No es posible conectarse con el servicio. Por favor vuelva a intentarlo o comuníquese con el Administrador del Sistema si el problema persiste.`
          this.logger.error(requestInfo)
          return requestInfo
        }

        this.logger.error(requestInfo)
        return requestInfo
      }

      requestInfo.response = error.response

      // IOP ERROR tipo 1 body = { message: "detalle del error" }
      if (
        opt.validarIOP &&
        error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        Object.keys(error.response.data || {}).length === 1 &&
        error.response.data.message &&
        typeof error.response.data.message === 'string'
      ) {
        requestInfo.errorMessage = `Ocurrió un error con el servicio de interoperabilidad`
        this.logger.error(requestInfo)
        return requestInfo
      }

      // IOP ERROR tipo 2 body = { data: "detalle del error" }
      if (
        opt.validarIOP &&
        error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        Object.keys(error.response.data || {}).length === 1 &&
        error.response.data.data &&
        typeof error.response.data.data === 'string'
      ) {
        requestInfo.errorMessage = `Ocurrió un error con el servicio de interoperabilidad`
        this.logger.error(requestInfo)
        return requestInfo
      }

      // UPSTREAM ERROR
      if (
        error.response &&
        error.response.data === 'The upstream server is timing out'
      ) {
        requestInfo.errorMessage = `El servicio no esta disponible. Intente otra vez.`
        this.logger.error(requestInfo)
        return requestInfo
      }

      // AXIOS ERROR
      requestInfo.errorMessage = `AxiosError ${requestInfo.response.status}`
      this.logger.error(requestInfo)
      return requestInfo
    }
  }

  private setDefaultValues(opt: RequestOptions = {}) {
    opt.validarIOP =
      typeof opt.validarIOP === 'boolean' ? Boolean(opt.validarIOP) : true
  }
}
