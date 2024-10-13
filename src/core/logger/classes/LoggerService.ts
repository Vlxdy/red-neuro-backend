import { Logger, pino } from 'pino'
import {
  AUDIT_LEVEL,
  COLOR,
  LOG_AUDIT_COLOR,
  LOG_COLOR,
  LOG_LEVEL,
} from '../constants'
import { LoggerConfig } from './LoggerConfig'
import {
  AuditOptions,
  BaseAuditOptions,
  LogData,
  LoggerOptions,
  Metadata,
} from '../types'
import { BaseException } from './BaseException'
import { BaseAudit } from './BaseAudit'
import { BaseLog } from './BaseLog'
import { LoggerParams } from './LoggerParams'

export class LoggerService {
  private static INITIALIZED = false

  private static loggerParams: LoggerParams | null = null
  private static loggerInstance: LoggerService | null = null

  private static mainPinoInstance: Logger | null = null
  private static auditPinoInstance: Logger | null = null

  static initialize(options: LoggerOptions): void {
    if (LoggerService.INITIALIZED) return

    const loggerParams = new LoggerParams(options)
    loggerParams.print()
    LoggerService.loggerParams = loggerParams

    // CREANDO LA INSTANCIA PRINCIPAL
    if (LoggerParams.LOG_ENABLED) {
      const opts = LoggerConfig.getMainConfig(loggerParams)
      if (opts.level) {
        const stream = LoggerConfig.getMainStream(loggerParams)
        const mainLogger = pino(opts, stream)
        LoggerService.mainPinoInstance = mainLogger
      }
    }

    // CREANDO LA INSTANCIA PARA AUDIT
    if (LoggerParams.LOG_ENABLED) {
      const auditOpts = LoggerConfig.getAuditConfig(loggerParams)
      if (auditOpts.level) {
        const auditStream = LoggerConfig.getAuditStream(loggerParams)
        const auditLogger = pino(auditOpts, auditStream)
        LoggerService.auditPinoInstance = auditLogger
      }
    }

    LoggerService.INITIALIZED = true
  }

  /**
   * Devuelve una instancia de logger.
   *
   * @example
   * import { LoggerService } from '@/core/logger'
   * const logger = LoggerService.getInstance()
   *
   * @returns LoggerService
   */
  static getInstance(): LoggerService {
    if (LoggerService.loggerInstance) {
      return LoggerService.loggerInstance
    }
    LoggerService.loggerInstance = new LoggerService()
    return LoggerService.loggerInstance
  }

  static getLoggerParams(): LoggerParams | null {
    return LoggerService.loggerParams
  }

  static isDebugEnabled(): boolean {
    return (
      LoggerParams.LOG_ENABLED && LoggerParams.LEVELS.includes(LOG_LEVEL.DEBUG)
    )
  }

  /**
   * Registra logs de nivel error.
   *
   * @example
   *
   * logger.error(error)
   * logger.error(error, ...params)
   *
   * // Caso de uso 1:
   * function tarea(datos) {
   *   try {
   *     // código inseguro
   *   } catch (err) {
   *     logger.error(err)
   *   }
   * }
   *
   * // Caso de uso 2 (recomendado):
   * logger.error(
   *   new BaseException(err, {
   *     mensaje: 'Mensaje para el cliente',
   *     metadata: { algun: 'metadato', adicional: 'clave:valor' },
   *     modulo: 'SEGIP:CONTRASTACIÓN',
   *   })
   * )
   *
   * @param params
   */
  error(...params: unknown[]): void {
    this._error(...params)
  }

  /**
   * Registra logs de nivel warning.
   *
   * @example
   *
   * logger.warn(...params)
   *
   * // Caso de uso 1:
   * logger.warn('Mensaje de advertencia')
   *
   * // Caso de uso 2:
   * logger.warn({
   *   mensaje: 'Mensaje para el cliente',
   *   metadata: { algun: 'metadato', adicional: 'clave:valor' },
   *   modulo: 'opcional',
   * })
   * @param params
   */
  warn(...params: unknown[]): void {
    this._warn(...params)
  }

  /**
   * Registra logs de nivel info.
   *
   * @example
   *
   * logger.info(...params)
   *
   * // Caso de uso 1:
   * logger.info('Mensaje informativo')
   *
   * // Caso de uso 2:
   * logger.info({
   *   mensaje: 'Mensaje para el cliente',
   *   metadata: { algun: 'metadato', adicional: 'clave:valor' },
   *   modulo: 'opcional',
   * })
   * @param params
   */
  info(...params: unknown[]): void {
    this._log(LOG_LEVEL.INFO, ...params)
  }

  /**
   * Registra logs de nivel debug.
   *
   * @example
   *
   * logger.debug(...params)
   *
   * // Caso de uso:
   * logger.debug('DATOS = ', datos)
   * @param params
   */
  debug(...params: unknown[]): void {
    this._log(LOG_LEVEL.DEBUG, ...params)
  }

  /**
   * Registra logs de nivel trace.
   *
   * @example
   *
   * logger.trace(...params)
   * @param params
   */
  trace(...params: unknown[]): void {
    this._log(LOG_LEVEL.TRACE, ...params)
  }

  /**
   * Registra logs de auditoría.
   *
   * @example
   * logger.audit(contexto, mensaje)
   * logger.audit(contexto, mensaje, metadata)
   * logger.audit(contexto, {
   *   mensaje,
   *   metadata,
   * })
   *
   * // Caso de uso:
   * function login(user) {
   *  this.logger.audit('authentication', {
   *    mensaje: 'Ingresó al sistema',
   *    metadata: { usuario: user.id, tipo: 'básico' },
   *  })
   * }
   *
   * @param contexto string
   * @param params unknown[]
   */
  audit(contexto: string, mensaje: string): void
  audit(contexto: string, mensaje: string, metadata: Metadata): void
  audit(contexto: string, opt: AuditOptions): void
  audit(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.DEFAULT, contexto, ...params)
  }

  /**
   * Logs de auditoría de tipo error.
   *
   * Al imprimirlos en la terminal
   * se muestran con un resaltado de tipo error.
   * @param contexto string
   * @param params unknown[]
   */
  auditError(contexto: string, mensaje: string): void
  auditError(contexto: string, mensaje: string, metadata: Metadata): void
  auditError(contexto: string, opt: AuditOptions): void
  auditError(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.ERROR, contexto, ...params)
  }

  /**
   * Logs de auditoría de tipo warning.
   *
   * Al imprimirlos en la terminal
   * se muestran con un resaltado de tipo warning.
   * @param contexto string
   * @param params unknown[]
   */
  auditWarn(contexto: string, mensaje: string): void
  auditWarn(contexto: string, mensaje: string, metadata: Metadata): void
  auditWarn(contexto: string, opt: AuditOptions): void
  auditWarn(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.WARN, contexto, ...params)
  }

  /**
   * Logs de auditoría de tipo success.
   *
   * Al imprimirlos en la terminal
   * se muestran con un resaltado de tipo success.
   * @param contexto string
   * @param params unknown[]
   */
  auditSuccess(contexto: string, mensaje: string): void
  auditSuccess(contexto: string, mensaje: string, metadata: Metadata): void
  auditSuccess(contexto: string, opt: AuditOptions): void
  auditSuccess(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.SUCCESS, contexto, ...params)
  }

  /**
   * Logs de auditoría de tipo info.
   *
   * Al imprimirlos en la terminal
   * se muestran con un resaltado de tipo info.
   * @param contexto string
   * @param params unknown[]
   */
  auditInfo(contexto: string, mensaje: string): void
  auditInfo(contexto: string, mensaje: string, metadata: Metadata): void
  auditInfo(contexto: string, opt: AuditOptions): void
  auditInfo(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.INFO, contexto, ...params)
  }

  /**
   * Logs de auditoría de tipo debug.
   *
   * Al imprimirlos en la terminal
   * se muestran con un resaltado de tipo debug.
   * @param contexto string
   * @param params unknown[]
   */
  auditDebug(contexto: string, mensaje: string): void
  auditDebug(contexto: string, mensaje: string, metadata: Metadata): void
  auditDebug(contexto: string, opt: AuditOptions): void
  auditDebug(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.DEBUG, contexto, ...params)
  }

  private _error(...params: unknown[]) {
    try {
      if (!LoggerParams.LOG_ENABLED) return
      const exceptionInfo = new BaseException(params[0], {
        metadata: this.buildMetadata(params.slice(1)),
      })
      this.saveLog(exceptionInfo)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  private _warn(...params: unknown[]) {
    try {
      if (!LoggerParams.LOG_ENABLED) return
      const withMessage = params.length > 0 && typeof params[0] === 'string'
      const exceptionInfo = new BaseException(undefined, {
        httpStatus: 400,
        mensaje: withMessage ? String(params[0]) : undefined,
        metadata: this.buildMetadata(params.slice(withMessage ? 1 : 0)),
      })
      this.saveLog(exceptionInfo)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  private _log(level: LOG_LEVEL, ...params: unknown[]) {
    try {
      if (!LoggerParams.LOG_ENABLED) return
      if (!LoggerParams.LEVELS.includes(level)) return
      const logInfo = new BaseLog({
        metadata: this.buildMetadata(params),
        level,
      })
      this.saveLog(logInfo)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  private _audit(level: AUDIT_LEVEL, contexto: string, ...params: unknown[]) {
    try {
      if (!LoggerParams.LOG_ENABLED) return
      if (!LoggerParams.AUDIT.includes(contexto)) return
      const auditInfo = this.buildAudit(level, contexto, ...params)
      this.saveAudit(auditInfo)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  private buildMetadata(params: unknown[]) {
    return params.reduce((prev: object, curr, index) => {
      prev[index] = curr
      return prev
    }, {}) as Metadata
  }

  private buildAudit(
    lvl: AUDIT_LEVEL,
    contexto: string,
    ...args: unknown[]
  ): BaseAudit {
    // 1ra forma - (contexto: string, mensaje: string) => BaseAudit
    if (arguments.length === 3 && typeof args[0] === 'string') {
      return new BaseAudit({
        level: lvl,
        contexto,
        mensaje: args[0],
      })
    }

    // 2da forma - (contexto: string, mensaje: string, metadata: Metadata) => BaseAudit
    else if (arguments.length === 4 && typeof args[0] === 'string') {
      return new BaseAudit({
        level: lvl,
        contexto,
        mensaje: args[0],
        metadata: args[1] as Metadata,
      })
    }

    // 3ra forma - (contexto: string, opt: BaseAuditOptions) => BaseAudit
    else {
      return new BaseAudit({
        ...(args[0] as BaseAuditOptions),
        level: lvl,
        contexto,
      })
    }
  }

  private saveLog(info: BaseException | BaseLog) {
    const level = info.getLevel()
    const pinoLogger = LoggerService.mainPinoInstance
    if (pinoLogger && pinoLogger[level] && pinoLogger.isLevelEnabled(level)) {
      const dataJson =
        LoggerParams.LOG_FILE_ENABLED || LoggerParams.LOG_LOKI_ENABLED
          ? info.getLogEntry()
          : null
      const dataStr =
        LoggerParams.LOG_CONSOLE_ENABLED && !info.consoleOptions?.disabled
          ? info.toString({
              color: LOG_COLOR[info.level],
              resetColor: COLOR.RESET,
              timeColor: COLOR.LIGHT_GREY,
              keyColor: COLOR.LIGHT_GREY,
            })
          : null
      const logData: LogData = { json: dataJson, str: dataStr }
      pinoLogger[level](logData)
    }
  }

  private saveAudit(info: BaseAudit): void {
    const level = info.contexto
    const pinoLogger = LoggerService.auditPinoInstance
    if (pinoLogger && pinoLogger[level] && pinoLogger.isLevelEnabled(level)) {
      const dataJson =
        LoggerParams.LOG_FILE_ENABLED || LoggerParams.LOG_LOKI_ENABLED
          ? info.getLogEntry()
          : null
      const dataStr =
        LoggerParams.LOG_CONSOLE_ENABLED && !info.consoleOptions?.disabled
          ? info.toString({
              color: LOG_AUDIT_COLOR[info.level],
              resetColor: COLOR.RESET,
              timeColor: COLOR.LIGHT_GREY,
              keyColor: COLOR.LIGHT_GREY,
            })
          : null
      const logData: LogData = { json: dataJson, str: dataStr }
      pinoLogger[level](logData)
    }
  }
}
