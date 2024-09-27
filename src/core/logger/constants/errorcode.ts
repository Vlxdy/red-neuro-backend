export enum ERROR_CODE {
  UNKNOWN_ERROR = 'E-500', // error = 'BOOM' | { name: 'Error' } | new Error() | undefined | null | ''
  HTTP_EXCEPTION = 'E-HTTP', // error = new HttpException()
  SQL_ERROR = 'E-SQL', // error = { name: "QueryFailedError" }
  DTO_VALIDATION_ERROR = 'E-DTO', // error = new BadRequestException() - DTO
  SERVER_AXIOS_ERROR = 'EXT-REQUEST', // error = axios().catch(err => ...)
  SERVER_CONEXION = 'EXT-ECONNREFUSED', // error = { code: 'ECONNREFUSED' }
  SERVER_TIMEOUT = 'EXT-TIMEOUT', // response = { data: "The upstream server is timing out" }
  SERVER_CERT_EXPIRED = 'EXT-CERT', // error = { code: 'CERT_HAS_EXPIRED' }
  SERVER_ERROR_1 = 'EXT-MESSAGE', // body = { message: "detalle del error" }
  SERVER_ERROR_2 = 'EXT-DATA', // body = { data: "detalle del error" }
}

export enum ERROR_NAME {
  'E-500' = 'Error desconocido',
  'E-HTTP' = 'Error HTTP',
  'E-SQL' = 'Error de consulta con la Base de Datos',
  'E-DTO' = 'Error de validación con el DTO',
  'EXT-REQUEST' = 'Error de consulta con Servicio Externo',
  'EXT-ECONNREFUSED' = 'Error de conexión con Servicio Externo',
  'EXT-TIMEOUT' = 'Error de TIEMOUT con Servicio Externo',
  'EXT-CERT' = 'Error de certificado con Servicio Externo',
  'EXT-MESSAGE' = 'Error desconocido con Servicio Externo (message)',
  'EXT-DATA' = 'Error desconocido con Servicio Externo (data)',
}
