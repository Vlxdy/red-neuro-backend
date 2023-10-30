import { toJSON } from 'flatted'
import {
  CLEAN_PARAM_VALUE_MAX_DEEP,
  DEFAULT_SENSITIVE_PARAMS,
} from '../constants'
import { BaseException } from '../classes'

export function cleanParamValue(
  value: unknown,
  deep = 0,
  sensitiveParams = DEFAULT_SENSITIVE_PARAMS
) {
  try {
    // Para evitar recursividad infinita
    if (deep > CLEAN_PARAM_VALUE_MAX_DEEP) return String(value)

    // START
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item) =>
          cleanParamValue(item, deep + 1, sensitiveParams)
        )
      }
      if (isAxiosResponse(value)) {
        return {
          data:
            'data' in value
              ? cleanParamValue(value.data, 0, sensitiveParams)
              : undefined,
          status: 'status' in value ? value.status : undefined,
          statusText: 'statusText' in value ? value.statusText : undefined,
        }
      }
      if (isAxiosRequest(value)) {
        return {
          path: 'path' in value ? value.path : undefined,
          method: 'method' in value ? value.method : undefined,
          host: 'host' in value ? value.host : undefined,
          protocol: 'protocol' in value ? value.protocol : undefined,
        }
      }
      if (isAxiosError(value)) {
        const config =
          'config' in value && value.config && typeof value.config === 'object'
            ? value.config
            : undefined
        const response =
          'response' in value &&
          value.response &&
          typeof value.response === 'object'
            ? value.response
            : undefined
        return {
          code: 'code' in value ? value.code : undefined,
          config: config
            ? {
                headers:
                  'headers' in config
                    ? cleanParamValue(config.headers, 0, sensitiveParams)
                    : undefined,
                baseURL: 'baseURL' in config ? config.baseURL : undefined,
                method: 'method' in config ? config.method : undefined,
                url: 'url' in config ? config.url : undefined,
                data:
                  'data' in config
                    ? cleanParamValue(config.data, 0, sensitiveParams)
                    : undefined,
              }
            : undefined,
          response: response
            ? {
                status: 'status' in response ? response.status : undefined,
                statusText:
                  'statusText' in response ? response.statusText : undefined,
                data:
                  'data' in response
                    ? cleanParamValue(response.data, 0, sensitiveParams)
                    : undefined,
              }
            : undefined,
        }
      }
      if (isConexionError(value)) {
        const config =
          'config' in value && value.config && typeof value.config === 'object'
            ? value.config
            : undefined
        const cause =
          'cause' in value && typeof value.cause === 'object'
            ? value.cause
            : undefined
        return {
          name: 'name' in value ? value.name : undefined,
          message: 'message' in value ? value.message : undefined,
          errno: 'errno' in value ? value.errno : undefined,
          code: 'code' in value ? value.code : undefined,
          syscall: 'syscall' in value ? value.syscall : undefined,
          address: 'address' in value ? value.address : undefined,
          port: 'port' in value ? value.port : undefined,
          config: config
            ? {
                headers:
                  'headers' in config
                    ? cleanParamValue(config.headers, 0, sensitiveParams)
                    : undefined,
                baseURL: 'baseURL' in config ? config.baseURL : undefined,
                method: 'method' in config ? config.method : undefined,
                url: 'url' in config ? config.url : undefined,
                data:
                  'data' in config
                    ? cleanParamValue(config.data, 0, sensitiveParams)
                    : undefined,
              }
            : undefined,
          cause: cause
            ? {
                name: 'name' in value ? value.name : undefined,
                message: 'message' in value ? value.message : undefined,
                errno: 'errno' in cause ? cause.errno : undefined,
                code: 'code' in cause ? cause.code : undefined,
                syscall: 'syscall' in cause ? cause.syscall : undefined,
                address: 'address' in cause ? cause.address : undefined,
                port: 'port' in cause ? cause.port : undefined,
              }
            : undefined,
        }
      }
      if (isCertExpiredError(value)) {
        const config =
          'config' in value && value.config && typeof value.config === 'object'
            ? value.config
            : undefined
        const cause =
          'cause' in value && typeof value.cause === 'object'
            ? value.cause
            : undefined
        return {
          name: 'name' in value ? value.name : undefined,
          message: 'message' in value ? value.message : undefined,
          code: 'code' in value ? value.code : undefined,
          config: config
            ? {
                headers:
                  'headers' in config
                    ? cleanParamValue(config.headers, 0, sensitiveParams)
                    : undefined,
                baseURL: 'baseURL' in config ? config.baseURL : undefined,
                method: 'method' in config ? config.method : undefined,
                url: 'url' in config ? config.url : undefined,
                data:
                  'data' in config
                    ? cleanParamValue(config.data, 0, sensitiveParams)
                    : undefined,
              }
            : undefined,
          cause: cause
            ? {
                name: 'name' in value ? value.name : undefined,
                message: 'message' in value ? value.message : undefined,
                code: 'code' in cause ? cause.code : undefined,
              }
            : undefined,
        }
      }

      if (value instanceof BaseException) {
        return value.toString()
      }

      if (value instanceof Error) {
        return value.stack
      }

      return Object.keys(value).reduce((prev, curr) => {
        // Por seguridad se ofusca el valor de parámetros con información sensible
        if (sensitiveParams.includes(curr.toLowerCase())) {
          prev[curr] = '*****'
        }

        // en otros casos
        else {
          prev[curr] = cleanParamValue(
            (value as object)[curr],
            deep + 1,
            sensitiveParams
          )
        }

        return prev
      }, {})
    }
    // END

    // Por seguridad se ofuscan los tokens
    if (typeof value === 'string' && value.indexOf('Bearer') > -1) {
      const regex = /Bearer\s+[A-Za-z0-9.-_]+/g
      return value.replace(regex, 'Bearer *****')
    }

    return value
  } catch (error) {
    try {
      return toJSON(value)
    } catch (e) {
      return e.toString()
    }
  }
}

function isAxiosResponse(data: unknown) {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'data' in data &&
      typeof data.data !== 'undefined' &&
      'status' in data &&
      typeof data.status !== 'undefined' &&
      'statusText' in data &&
      typeof data.statusText !== 'undefined' &&
      'headers' in data &&
      typeof data.headers !== 'undefined' &&
      'config' in data &&
      typeof data.config !== 'undefined'
  )
}

function isAxiosRequest(data: unknown) {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'path' in data &&
      typeof data.path !== 'undefined' &&
      'method' in data &&
      typeof data.method !== 'undefined' &&
      'host' in data &&
      typeof data.host !== 'undefined' &&
      'protocol' in data &&
      typeof data.protocol !== 'undefined' &&
      'res' in data &&
      typeof data.res !== 'undefined'
  )
}

export function isAxiosError(data: unknown): boolean {
  return Boolean(data instanceof Error && data.name === 'AxiosError')
}

export function isConexionError(data: unknown): boolean {
  const val =
    data && typeof data === 'object' && 'cause' in data
      ? (data.cause as object)
      : data

  return Boolean(
    val &&
      typeof val === 'object' &&
      'code' in val &&
      typeof val.code === 'string' &&
      [
        'ESOCKETTIMEDOUT',
        'ETIMEDOUT',
        'ECONNREFUSED',
        'ENOTFOUND',
        'ECONNRESET',
      ].includes(val.code)
  )
}

export function isCertExpiredError(data: unknown): boolean {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'code' in data &&
      typeof data.code === 'string' &&
      data.code === 'CERT_HAS_EXPIRED'
  )
}
