import { Logger, pino } from 'pino'
import {
  AUDIT_LEVEL,
  COLOR,
  DEFAULT_PARAMS,
  LOG_AUDIT_COLOR,
  LOG_COLOR,
  LOG_LEVEL,
} from '../constants'
import fastRedact from 'fast-redact'
import { LoggerConfig } from './LoggerConfig'
import {
  AuditOptions,
  BaseAuditOptions,
  LoggerOptions,
  LoggerParams,
  Metadata,
} from '../types'
import { printLoggerParams, stdoutWrite } from '../tools'
import { getContext, timeToPrint } from '../utilities'
import { BaseException } from './BaseException'
import { BaseAudit } from './BaseAudit'
import { BaseLog } from './BaseLog'
import { inspect } from 'util'

export class LoggerService {
  private static CONSOLA_HABILITADA = true

  private static loggerParams: LoggerParams | null = null
  private static loggerInstance: LoggerService | null = null

  private static mainPinoInstance: Logger | null = null
  private static auditPinoInstance: Logger | null = null

  private static redact: fastRedact.redactFn | null = null

  static initialize(options: LoggerOptions): void {
    if (LoggerService.mainPinoInstance) return

    const loggerParams: LoggerParams = {
      console:
        typeof options.console === 'undefined'
          ? DEFAULT_PARAMS.console
          : String(options.console === 'true'),
      appName:
        typeof options.appName === 'undefined'
          ? DEFAULT_PARAMS.appName
          : options.appName,
      level:
        typeof options.level === 'undefined'
          ? DEFAULT_PARAMS.level
          : options.level,
      hide:
        typeof options.hide === 'undefined'
          ? DEFAULT_PARAMS.hide
          : options.hide,
      fileParams: options.fileParams
        ? {
            path:
              typeof options.fileParams.path === 'undefined'
                ? DEFAULT_PARAMS.fileParams?.path || ''
                : options.fileParams.path,
            size:
              typeof options.fileParams.size === 'undefined'
                ? DEFAULT_PARAMS.fileParams?.size || ''
                : options.fileParams.size,
            rotateInterval:
              typeof options.fileParams.rotateInterval === 'undefined'
                ? DEFAULT_PARAMS.fileParams?.rotateInterval || ''
                : options.fileParams.rotateInterval,
          }
        : undefined,

      lokiParams: options.lokiParams
        ? {
            url:
              typeof options.lokiParams.url === 'undefined'
                ? DEFAULT_PARAMS.lokiParams?.url || ''
                : options.lokiParams.url,
            username:
              typeof options.lokiParams.username === 'undefined'
                ? DEFAULT_PARAMS.lokiParams?.username || ''
                : options.lokiParams.username,
            password:
              typeof options.lokiParams.password === 'undefined'
                ? DEFAULT_PARAMS.lokiParams?.password || ''
                : options.lokiParams.password,
            batching:
              typeof options.lokiParams.batching === 'undefined'
                ? DEFAULT_PARAMS.lokiParams?.batching || ''
                : options.lokiParams.batching,
            batchInterval:
              typeof options.lokiParams.batchInterval === 'undefined'
                ? DEFAULT_PARAMS.lokiParams?.batchInterval || ''
                : options.lokiParams.batchInterval,
          }
        : undefined,

      auditParams: options.auditParams
        ? {
            context:
              typeof options.auditParams.context === 'undefined'
                ? DEFAULT_PARAMS.auditParams?.context || ''
                : options.auditParams.context,
          }
        : DEFAULT_PARAMS.auditParams?.context
          ? {
              context: DEFAULT_PARAMS.auditParams.context,
            }
          : undefined,

      projectPath:
        typeof options.projectPath === 'undefined'
          ? DEFAULT_PARAMS.projectPath
          : options.projectPath,

      excludeOrigen:
        typeof options.excludeOrigen === 'undefined'
          ? DEFAULT_PARAMS.excludeOrigen
          : options.excludeOrigen,

      _levels: [],
      _audit: [],
    }

    loggerParams._levels = Object.keys(LOG_LEVEL).map((key) => LOG_LEVEL[key])
    loggerParams._audit = loggerParams.auditParams?.context.split(' ') || []

    const opts = LoggerConfig.getMainConfig(loggerParams)
    const stream = LoggerConfig.getMainStream(loggerParams)
    const redact = LoggerConfig.getRedactOptions(loggerParams)

    // CREANDO LA INSTANCIA PRINCIPAL
    const mainLogger = pino(opts, stream)
    mainLogger.on('level-change', (lvl, val, prevLvl, prevVal) => {
      process.stdout.write(
        `\n[logger] Cambio de nivel - valor previo: ${prevVal} ${prevLvl} nuevo valor: ${val} ${lvl}\n`
      )
    })

    // CREANDO LA INSTANCIA PARA AUDIT
    const auditOpts = LoggerConfig.getAuditConfig(loggerParams)
    const auditStream = LoggerConfig.getAuditStream(loggerParams)
    const auditLogger = pino(auditOpts, auditStream)
    auditLogger.on('level-change', (lvl, val, prevLvl, prevVal) => {
      process.stdout.write(
        `\n[logger] Cambio de nivel - valor previo: ${prevVal} ${prevLvl} nuevo valor: ${val} ${lvl}\n`
      )
    })

    LoggerService.redact = fastRedact(redact)
    LoggerService.mainPinoInstance = mainLogger
    LoggerService.auditPinoInstance = auditLogger
    LoggerService.loggerParams = loggerParams
    LoggerService.CONSOLA_HABILITADA = loggerParams.console === 'true'
    printLoggerParams(loggerParams)
  }

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

  static getRedact() {
    return LoggerService.redact
  }

  error(...params: unknown[]): void {
    const exceptionInfo = new BaseException(params[0], {
      metadata: this.buildMetadata(params.slice(1)),
    })
    this.printException(exceptionInfo)
  }

  warn(...params: unknown[]): void {
    this._log(LOG_LEVEL.WARN, ...params)
  }

  info(...params: unknown[]): void {
    this._log(LOG_LEVEL.INFO, ...params)
  }

  debug(...params: unknown[]): void {
    this._log(LOG_LEVEL.DEBUG, ...params)
  }

  trace(...params: unknown[]): void {
    this._log(LOG_LEVEL.TRACE, ...params)
  }

  private _log(level: LOG_LEVEL, ...params: unknown[]) {
    const pinoLogger = LoggerService.mainPinoInstance
    if (!pinoLogger || !pinoLogger.isLevelEnabled(level)) {
      return
    }
    const logInfo = new BaseLog({
      metadata: this.buildMetadata(params),
      level,
    })
    this.printLog(logInfo)
  }

  private buildMetadata(params: unknown[]) {
    return params.reduce((prev: object, curr, index) => {
      prev[index] = curr
      return prev
    }, {}) as Metadata
  }

  audit(contexto: string, mensaje: string): void
  audit(contexto: string, mensaje: string, metadata: Metadata): void
  audit(contexto: string, opt: AuditOptions): void
  audit(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.DEFAULT, contexto, ...params)
  }

  private _audit(level: AUDIT_LEVEL, contexto: string, ...params: unknown[]) {
    const pinoLogger = LoggerService.auditPinoInstance
    if (
      !pinoLogger ||
      !pinoLogger.isLevelEnabled(contexto) ||
      !LoggerService.loggerParams?._audit.includes(contexto)
    ) {
      return
    }
    const auditInfo = LoggerService.buildAudit(level, contexto, ...params)
    this.printAudit(auditInfo)
  }

  auditError(contexto: string, mensaje: string): void
  auditError(contexto: string, mensaje: string, metadata: Metadata): void
  auditError(contexto: string, opt: AuditOptions): void
  auditError(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.ERROR, contexto, ...params)
  }

  auditWarn(contexto: string, mensaje: string): void
  auditWarn(contexto: string, mensaje: string, metadata: Metadata): void
  auditWarn(contexto: string, opt: AuditOptions): void
  auditWarn(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.WARN, contexto, ...params)
  }

  auditSuccess(contexto: string, mensaje: string): void
  auditSuccess(contexto: string, mensaje: string, metadata: Metadata): void
  auditSuccess(contexto: string, opt: AuditOptions): void
  auditSuccess(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.SUCCESS, contexto, ...params)
  }

  auditInfo(contexto: string, mensaje: string): void
  auditInfo(contexto: string, mensaje: string, metadata: Metadata): void
  auditInfo(contexto: string, opt: AuditOptions): void
  auditInfo(contexto: string, ...params: unknown[]): void {
    this._audit(AUDIT_LEVEL.INFO, contexto, ...params)
  }

  private static buildAudit(
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

  private printException(info: BaseException) {
    try {
      const level = info.getLevel()

      const pinoLogger = LoggerService.mainPinoInstance
      if (!pinoLogger || !pinoLogger.isLevelEnabled(level)) {
        return
      }

      // SAVE WITH PINO
      this.saveWithPino(level, info)

      if (!LoggerService.CONSOLA_HABILITADA) {
        return
      }

      // PRINT TO CONSOLE
      const msg = info.toString()
      const caller = getContext()
      this.printToConsole(level, msg, caller)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  private printLog(info: BaseLog) {
    try {
      const level = info.getLevel()

      // SAVE WITH PINO
      this.saveWithPino(level, info)

      if (!LoggerService.CONSOLA_HABILITADA) {
        return
      }

      // PRINT TO CONSOLE
      const msg = info.toString()
      const caller = getContext()
      this.printToConsole(level, msg, caller)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  private printAudit(info: BaseAudit) {
    try {
      // SAVE WITH PINO
      this.saveAuditWithPino(info)

      if (!LoggerService.CONSOLA_HABILITADA) {
        return
      }

      // PRINT TO CONSOLE
      this.printAuditToConsole(info)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  private saveWithPino(level: LOG_LEVEL, info: BaseLog | BaseException) {
    const args = info.getLogEntry()
    const pinoLogger = LoggerService.mainPinoInstance
    if (pinoLogger && pinoLogger[level]) {
      pinoLogger[level](args)
    }
  }

  private saveAuditWithPino(info: BaseAudit): void {
    const level = info.contexto
    const args = info.getLogEntry()
    const pinoLogger = LoggerService.auditPinoInstance
    if (pinoLogger && pinoLogger[level]) {
      pinoLogger[level](args)
    }
  }

  private printToConsole(level: LOG_LEVEL, msg: string, caller: string): void {
    const color = LOG_COLOR[level]
    const time = timeToPrint()
    const cTime = `${COLOR.RESET}${time}${COLOR.RESET}`
    const cLevel = `${color}[${level.toUpperCase()}]${COLOR.RESET}`
    const cCaller = `${COLOR.RESET}${caller}${COLOR.RESET}`

    stdoutWrite('\n')
    stdoutWrite(`${cTime} ${cLevel} ${cCaller} ${color}`)
    stdoutWrite(`${color}${msg.replace(/\n/g, `\n${color}`)}\n`)
    stdoutWrite(COLOR.RESET)
  }

  private printAuditToConsole(info: BaseAudit): void {
    const colorPrimario = LOG_AUDIT_COLOR[info.level]
    const colorSecundario = colorPrimario

    const metadata = info.metadata || {}
    const time = timeToPrint()
    const timeColor =
      info.level === AUDIT_LEVEL.DEFAULT ? COLOR.LIGHT_GREY : COLOR.RESET
    const cTime = `${timeColor}${time}${COLOR.RESET}`

    // FORMATO PERSONALIZADO
    if (info.formato) {
      const msg = info.formato
      const cLevel = `${colorPrimario}[${info.contexto}]${COLOR.RESET}`
      const cMsg = `${colorSecundario}${msg}${COLOR.RESET}`
      stdoutWrite('\n')
      stdoutWrite(`${cTime} ${cLevel} ${cMsg}\n`)
      stdoutWrite(COLOR.RESET)
    }

    // FORMATO POR DEFECTO
    else {
      const msg = info.mensaje ? info.mensaje : ''
      const cLevel = `${colorPrimario}[${info.contexto}]${COLOR.RESET}`
      const cMsg = `${timeColor}${msg}${COLOR.RESET}`
      const cValues = Object.keys(metadata)
        .filter((key) => typeof metadata[key] !== 'undefined')
        .map((key) => {
          const value = inspect(metadata[key], false, null, false)
          const cValue = value.replace(/\n/g, `\n${colorSecundario}`)
          return `${COLOR.LIGHT_GREY}${key}=${colorSecundario}${cValue}`
        })
        .join(' ')
      stdoutWrite('\n')
      stdoutWrite(`${cTime} ${cLevel} ${cMsg} ${cValues}\n`)
      stdoutWrite(COLOR.RESET)
    }
  }
}
