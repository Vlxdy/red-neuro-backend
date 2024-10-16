import { LoggerService } from './LoggerService'
import {
  BaseExceptionOptions,
  ConsoleOptions,
  LogEntry,
  Metadata,
  ToStringOptions,
} from '../types'
import {
  cleanParamValue,
  getErrorStack,
  getFullErrorStack,
  getHostname,
  getOrigen,
  extraerOrigenSimplificado,
  getReqID,
  isAxiosError,
  isCertExpiredError,
  isConexionError,
  timeToPrint,
} from '../utilities'
import { HttpException, HttpStatus } from '@nestjs/common'
import { extractMessage } from '../utils'
import { ERROR_CODE, ERROR_NAME, LOG_LEVEL } from '../constants'
import { inspect } from 'util'

export class BaseException extends Error {
  level: LOG_LEVEL.ERROR | LOG_LEVEL.WARN

  /**
   * Mensaje para el cliente
   */
  mensaje: string

  /**
   * Objeto que contiene información adicional
   */
  metadata: Metadata

  /**
   * Identificador de la aplicación. Ej.: app-backend | app-frontend | node-script
   */
  appName: string

  /**
   * Identificador del módulo. Ej.: SEGIP, SIN, MENSAJERÍA
   */
  modulo: string

  /**
   * Fecha exacta en la que registra el log
   */
  fecha: Date

  /**
   * Stack del componente que registró el mensaje (se genera de forma automática)
   */
  traceStack: string

  /**
   * Código que índica el tipo de error detectado
   */
  codigo?: ERROR_CODE

  /**
   * Código de respuesta HTTP en caso de que la excepción sea del tipo correspondiente
   */
  httpStatus: HttpStatus

  /**
   * contenido original del error (parseado)
   */
  error?: unknown

  /**
   * Stack del error (se genera de forma automática)
   */
  errorStack?: string

  /**
   * Stack original del error (se genera de forma automática)
   */
  errorStackOriginal?: string

  /**
   * Tipo de error detectado: TYPED ERROR | CONEXION ERROR | IOP ERROR | UPSTREAM ERROR | HTTP ERROR | AXIOS ERROR | UNKNOWN ERROR (se genera de forma automática)
   */
  causa: string

  /**
   * Ruta completa de la línea de código que originó el error (Ej.: .../src/main.ts:24:4)
   */
  origen: string

  /**
   * Mensaje que índica cómo resolver el error con base en la causa detectada
   */
  accion: string

  /**
   * Información adicional que será visible para el cliente incluso en modo producción
   */
  clientInfo: unknown

  /**
   * Ruta simplificada de la línea de código que originó el error (Ej.: AppModule.bootstrap (main.ts:12:45))
   */
  caller?: string

  /**
   * Parámetros de configuración exclusivos para la impresión de logs por consola
   */
  consoleOptions?: ConsoleOptions

  constructor(error: unknown, opt?: BaseExceptionOptions) {
    super(BaseException.name)

    // UNKNOWN_ERROR
    let codigo: ERROR_CODE | undefined = ERROR_CODE.UNKNOWN_ERROR

    const errorStack =
      error instanceof BaseException
        ? error.errorStack
        : error instanceof Error
          ? getErrorStack(error)
          : ''

    const errorStackOriginal =
      error instanceof BaseException
        ? error.errorStackOriginal
        : error instanceof Error
          ? getFullErrorStack(error)
          : ''

    let metadata: Metadata = {}
    const loggerParams = LoggerService.getLoggerParams()

    let appName = loggerParams?.appName || ''
    let modulo = ''

    const traceStack =
      error instanceof BaseException
        ? error.traceStack
        : getErrorStack(new Error())

    let origen = errorStack ? getOrigen(errorStack) : ''
    if (!origen) {
      origen = traceStack ? getOrigen(traceStack) : ''
    }

    let errorParsed: unknown = error
      ? error instanceof BaseException
        ? error.error
        : cleanParamValue(error)
      : undefined

    let httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
    let mensaje = `Error Interno`
    let causa: string
    let accion = ''
    let clientInfo: unknown
    let fecha = new Date()
    let consoleOptions: ConsoleOptions | undefined = undefined

    try {
      causa =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : typeof error === 'object'
            ? JSON.stringify(error)
            : String(error)
    } catch (err) {
      causa = ''
    }

    // EMPTY_ERROR
    if (!error) {
      mensaje = ''
      causa = ''
      codigo = undefined
    }

    // BASE_EXCEPTION
    else if (error instanceof BaseException) {
      codigo = error.codigo
      httpStatus = error.httpStatus
      mensaje = error.mensaje
      causa = error.causa
      accion = error.accion
      appName = error.appName
      modulo = error.modulo
      origen = error.origen
      metadata = error.metadata
      fecha = error.fecha
      errorParsed = error.error
      clientInfo = error.clientInfo
      consoleOptions = error.consoleOptions
    }

    // SERVER_CONEXION
    else if (isConexionError(error)) {
      codigo = ERROR_CODE.SERVER_CONEXION
      mensaje = `Error de conexión con el servicio externo`
      accion = `Verifique la configuración de red y que el servicio al cual se intenta conectar se encuentre activo`
    }

    // SERVER_ERROR_1
    else if (
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data &&
      Object.keys(error.response.data).length === 1 &&
      error.response.data.message &&
      typeof error.response.data.message === 'string'
    ) {
      codigo = ERROR_CODE.SERVER_ERROR_1
      mensaje = `Ocurrió un error con el servicio externo`
      causa = error.response.data.message
      accion = `Verificar que el servicio en cuestión se encuentre activo y respondiendo correctamente`
    }

    // SERVER_ERROR_2
    else if (
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'data' in error.response.data &&
      Object.keys(error.response.data).length === 1 &&
      error.response.data.data &&
      typeof error.response.data.data === 'string'
    ) {
      codigo = ERROR_CODE.SERVER_ERROR_2
      mensaje = `Ocurrió un error con el servicio externo`
      causa = error.response.data.data
      accion = `Verificar que el servicio en cuestión se encuentre activo y respondiendo correctamente`
    }

    // SERVER_TIMEOUT
    else if (
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      typeof error.response.data === 'string' &&
      error.response.data === 'The upstream server is timing out'
    ) {
      codigo = ERROR_CODE.SERVER_TIMEOUT
      mensaje = `Ocurrió un error con el servicio externo`
      causa = error.response.data
      accion = `Verificar que el servicio en cuestión se encuentre activo y respondiendo correctamente`
    }

    // SERVER_CERT_EXPIRED
    else if (isCertExpiredError(error)) {
      codigo = ERROR_CODE.SERVER_CERT_EXPIRED
      mensaje = `Ocurrió un error con el servicio externo`
      causa =
        typeof error === 'object' &&
        'code' in error &&
        typeof error.code === 'string'
          ? error.code
          : ''
      accion = `Renovar el certificado digital`
    }

    // HTTP_EXCEPTION
    else if (error instanceof HttpException) {
      codigo = ERROR_CODE.HTTP_EXCEPTION
      httpStatus = error.getStatus()
      mensaje = extractMessage(error)
      causa = error.cause ? String(error.cause) : error.toString()
      accion =
        httpStatus === HttpStatus.BAD_REQUEST
          ? 'Verifique que los datos de entrada se estén enviando correctamente'
          : httpStatus === HttpStatus.UNAUTHORIZED
            ? 'Verifique que las credenciales de acceso se estén enviando correctamente'
            : httpStatus === HttpStatus.FORBIDDEN
              ? 'Verifique que el usuario actual tenga acceso a este recurso'
              : httpStatus === HttpStatus.NOT_FOUND
                ? 'Verifique que el recurso solicitado realmente exista'
                : httpStatus === HttpStatus.REQUEST_TIMEOUT
                  ? 'Verífica que el servicio responda en un tiempo inferior al tiempo máximo establecido'
                  : httpStatus === HttpStatus.PRECONDITION_FAILED
                    ? 'Verifique que se cumpla con todas las condiciones requeridas para consumir este recurso'
                    : ''
    }

    // SERVER_AXIOS_ERROR
    else if (
      isAxiosError(error) &&
      typeof error === 'object' &&
      'response' in error &&
      error.response
    ) {
      codigo = ERROR_CODE.SERVER_AXIOS_ERROR
      httpStatus =
        typeof error.response === 'object' &&
        'status' in error.response &&
        typeof error.response.status === 'number'
          ? error.response.status
          : HttpStatus.INTERNAL_SERVER_ERROR
      mensaje = `Ocurrió un error con el servicio externo`
      causa = `Error HTTP ${httpStatus} (Servicio externo)`
      accion = 'Revisar la respuesta devuelta por el servicio externo'
    }

    // SQL_ERROR
    else if (
      typeof error === 'object' &&
      'name' in error &&
      (error.name === 'TypeORMError' || error.name === 'QueryFailedError')
    ) {
      codigo = ERROR_CODE.SQL_ERROR
      mensaje = `Ocurrió un error interno`
      accion = 'Verificar la consulta SQL'
    }

    // GUARDANDO VALORES
    this.error = errorParsed
    this.fecha = fecha

    this.codigo =
      opt && 'codigo' in opt && typeof opt.codigo !== 'undefined'
        ? opt.codigo
        : codigo

    this.httpStatus =
      opt && 'httpStatus' in opt && typeof opt.httpStatus !== 'undefined'
        ? opt.httpStatus
        : httpStatus

    this.level = this.levelByStatus(this.httpStatus)

    this.mensaje =
      opt && 'mensaje' in opt && typeof opt.mensaje !== 'undefined'
        ? opt.mensaje
        : mensaje

    if (opt && 'metadata' in opt && typeof opt.metadata !== 'undefined') {
      if (metadata && Object.keys(metadata).length > 0) {
        this.metadata = Object.assign(
          {},
          metadata,
          cleanParamValue(opt.metadata)
        )
      } else {
        this.metadata = cleanParamValue(opt.metadata)
      }
    } else {
      this.metadata = metadata
    }

    this.appName = appName

    this.modulo =
      opt && 'modulo' in opt && typeof opt.modulo !== 'undefined'
        ? opt.modulo
        : modulo

    this.traceStack = traceStack

    this.errorStack = errorStack

    this.errorStackOriginal = errorStackOriginal

    this.causa =
      opt && 'causa' in opt && typeof opt.causa !== 'undefined'
        ? opt.causa
        : causa

    this.origen =
      origen ||
      (opt && 'origen' in opt && typeof opt.origen !== 'undefined'
        ? opt.origen
        : '')

    this.caller = extraerOrigenSimplificado(this.origen)

    this.accion =
      opt && 'accion' in opt && typeof opt.accion !== 'undefined'
        ? opt.accion
        : accion

    this.clientInfo =
      opt && 'clientInfo' in opt && typeof opt.clientInfo !== 'undefined'
        ? opt.clientInfo
        : clientInfo

    this.message = this.obtenerMensajeCliente()

    this.consoleOptions =
      opt &&
      'consoleOptions' in opt &&
      typeof opt.consoleOptions !== 'undefined'
        ? opt.consoleOptions
        : consoleOptions
  }

  getHttpStatus() {
    return this.httpStatus
  }

  obtenerMensajeCliente() {
    return this.modulo ? `${this.modulo} :: ${this.mensaje}` : this.mensaje
  }

  getLevel() {
    return this.level
  }

  private levelByStatus(status: number) {
    if (status < HttpStatus.INTERNAL_SERVER_ERROR) {
      return LOG_LEVEL.WARN
    }
    return LOG_LEVEL.ERROR
  }

  getReqId() {
    return getReqID() || undefined
  }

  getFechaConFormato() {
    return timeToPrint(this.fecha)
  }

  getLogEntry(): LogEntry {
    const args: LogEntry = {
      fecha: this.getFechaConFormato(),
      hostname: getHostname(),
      reqId: this.getReqId(),
      pid: process.pid,
      context: this.getLevel(),

      appName: this.appName,
      modulo: this.modulo,
      caller: this.caller,
      mensaje: this.obtenerMensajeCliente(),

      httpStatus: this.httpStatus,
      codigo: this.getErrorCodeName(),
      causa: this.causa,
      origen: this.origen,
      accion: this.accion,
      error: this.error as object,
      errorStack: this.errorStackOriginal,
      traceStack: this.traceStack,
    }

    // Para evitar guardar información vacía
    if (!args.mensaje) args.mensaje = undefined
    if (!args.causa) args.causa = undefined
    if (!args.modulo) args.modulo = undefined
    if (!args.caller) args.caller = undefined

    // Para evitar guardar informacion redundante
    if (String(args.error) === String(args.errorStack) && args.error) {
      args.error = undefined
    }

    if (this.metadata && Object.keys(this.metadata).length > 0) {
      Object.assign(args, { metadata: this.metadata })
    }

    return args
  }

  getErrorCodeName() {
    return this.codigo ? `${ERROR_NAME[this.codigo]} (${this.codigo})` : ''
  }

  toString(opt: ToStringOptions = {}): string {
    const color = opt.color || ''
    const timeColor = opt.timeColor || ''
    const resetColor = opt.resetColor || ''

    let msgToPrint = ''

    msgToPrint += `\n`
    msgToPrint += `${timeColor}${this.getFechaConFormato()}${color}`

    if (!this.consoleOptions?.hideLevel) {
      msgToPrint += ` [${this.level.toUpperCase()}]`
    }

    if (!this.consoleOptions?.hideCaller && this.caller) {
      msgToPrint += ` ${resetColor}${this.caller}${color}`
    }

    msgToPrint += ` ${this.obtenerMensajeCliente()}\n`
    msgToPrint += `───────────────────────\n`
    if (this.causa) {
      msgToPrint += `─ Causa  : ${this.causa}\n`
    }

    if (this.codigo) {
      msgToPrint += `─ Código : ${this.getErrorCodeName()}\n`
    }

    if (this.origen) {
      msgToPrint += `─ Origen : ${this.origen}\n`
    }

    if (this.accion) {
      msgToPrint += `─ Acción : ${this.accion}\n`
    }

    const nProps = Object.keys(this.metadata || {}).length
    if (this.metadata && nProps > 0) {
      msgToPrint += `\n───── Metadata ────────\n`
      Object.keys(this.metadata).map((key, index) => {
        const item = this.metadata[key]
        const value =
          typeof item === 'string' ? item : inspect(item, false, null, false)
        msgToPrint += `${key}=${value}`
        msgToPrint += index === nProps - 1 ? '\n' : '\n\n'
      })
    }

    if (
      this.error &&
      typeof this.error === 'object' &&
      Object.keys(this.error).length > 0
    ) {
      msgToPrint += `\n───── Error ───────────\n`
      msgToPrint += `${inspect(this.error, false, null, false)}\n`
    }

    if (this.errorStack) {
      msgToPrint += `\n───── Error stack ─────\n`
      msgToPrint += `${this.errorStack}\n`
    }

    if (this.traceStack) {
      msgToPrint += `\n───── Trace stack ─────\n`
      msgToPrint += `${this.traceStack}\n`
    }

    return `${color}${msgToPrint.replace(/\n/g, `\n${color}`)}${resetColor}`
  }
}
