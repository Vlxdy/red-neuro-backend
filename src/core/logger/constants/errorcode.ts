export enum ERROR_CODE {
  UNKNOWN_ERROR = 'E-50', // error = 'BOOM' | { name: 'Error' } | new Error() | undefined | null | ''
  HTTP_EXCEPTION = 'E-40', // error = new HttpException()
  SQL_ERROR = 'E-SQL', // error = { name: "QueryFailedError" }
  DTO_VALIDATION_ERROR = 'E-DTO', // error = new BadRequestException() - DTO
  SERVER_AXIOS_ERROR = 'ES-REQUEST', // error = axios().catch(err => ...)
  SERVER_CONEXION = 'ES-ECONNREFUSED', // error = { code: 'ECONNREFUSED' }
  SERVER_TIMEOUT = 'ES-TIMEOUT', // response = { data: "The upstream server is timing out" }
  SERVER_CERT_EXPIRED = 'ES-CERT', // error = { code: 'CERT_HAS_EXPIRED' }
  SERVER_ERROR_1 = 'ES-MESSAGE', // body = { message: "detalle del error" }
  SERVER_ERROR_2 = 'ES-DATA', // body = { data: "detalle del error" }
}

export enum ERROR_NAME {
  'E-50' = 'Error desconocido',
  'E-40' = 'Error HTTP',
  'E-SQL' = 'Error de consulta con la Base de Datos',
  'E-DTO' = 'Error de validación con el DTO',
  'ES-REQUEST' = 'Error de consulta con Servicio Externo',
  'ES-ECONNREFUSED' = 'Error de conexión con Servicio Externo',
  'ES-TIMEOUT' = 'Error de TIEMOUT con Servicio Externo',
  'ES-CERT' = 'Error de certificado con Servicio Externo',
  'ES-MESSAGE' = 'Error desconocido con Servicio Externo (message)',
  'ES-DATA' = 'Error desconocido con Servicio Externo (data)',
}
