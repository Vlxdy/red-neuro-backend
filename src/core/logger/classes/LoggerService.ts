import dayjs from 'dayjs'
import { Logger, pino } from 'pino'
import {
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
  AuditType,
  BaseAuditOptions,
  BaseExceptionOptions,
  BaseLogOptions,
  LoggerOptions,
  LoggerParams,
  LogOptions,
  Metadata,
} from '../types'
import { printLoggerParams, stdoutWrite } from '../tools'
import { getContext } from '../utilities'
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
            compress:
              typeof options.fileParams.compress === 'undefined'
                ? DEFAULT_PARAMS.fileParams?.compress || ''
                : options.fileParams.compress,
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

  static changeLevel(newLevel: LOG_LEVEL) {
    if (LoggerService.mainPinoInstance) {
      LoggerService.mainPinoInstance.level = newLevel
      return true
    }
    return false
  }

  static changeAudit(audit: string) {
    if (LoggerService.loggerParams) {
      LoggerService.loggerParams._audit = !audit ? [] : audit.split(' ') || []
      return true
    }
    return false
  }

  static getLevelStatus() {
    const baseInstance = LoggerService.mainPinoInstance
    const auditInstance = LoggerService.auditPinoInstance
    const levels = LoggerService.loggerParams?._levels || []
    const audit = LoggerService.loggerParams?._audit || []
    return {
      pid: process.pid,
      base: levels.map((lvl) => ({
        level: lvl,
        estado: baseInstance?.isLevelEnabled(lvl) ? 'activo' : 'inactivo',
      })),
      audit: audit.map((lvl) => ({
        level: lvl,
        estado: auditInstance?.isLevelEnabled(lvl) ? 'activo' : 'inactivo',
      })),
    }
  }

  error(error: unknown): void
  error(error: unknown, mensaje: string): void
  error(error: unknown, mensaje: string, metadata: Metadata): void
  error(
    error: unknown,
    mensaje: string,
    metadata: Metadata,
    modulo: string
  ): void
  error(error: unknown, opt: LogOptions): void
  error(...args: unknown[]): void {
    const caller = getContext(3)
    const exceptInfo = this.buildException(caller, ...args)
    this.printException(exceptInfo)
  }

  warn(mensaje: string): void
  warn(mensaje: string, metadata: Metadata): void
  warn(mensaje: string, metadata: Metadata, modulo: string): void
  warn(opt: LogOptions): void
  warn(...args: unknown[]): void {
    const pinoLogger = LoggerService.mainPinoInstance
    if (!pinoLogger || !pinoLogger.isLevelEnabled(LOG_LEVEL.WARN)) {
      return
    }
    const logInfo = this.buildLog(LOG_LEVEL.WARN, ...args)
    this.printLog(logInfo)
  }

  info(mensaje: string): void
  info(mensaje: string, metadata: Metadata): void
  info(mensaje: string, metadata: Metadata, modulo: string): void
  info(opt: LogOptions): void
  info(...args: unknown[]): void {
    const pinoLogger = LoggerService.mainPinoInstance
    if (!pinoLogger || !pinoLogger.isLevelEnabled(LOG_LEVEL.INFO)) {
      return
    }
    const logInfo = this.buildLog(LOG_LEVEL.INFO, ...args)
    this.printLog(logInfo)
  }

  debug(mensaje: string): void
  debug(mensaje: string, metadata: Metadata): void
  debug(mensaje: string, metadata: Metadata, modulo: string): void
  debug(opt: LogOptions): void
  debug(...args: unknown[]): void {
    const pinoLogger = LoggerService.mainPinoInstance
    if (!pinoLogger || !pinoLogger.isLevelEnabled(LOG_LEVEL.DEBUG)) {
      return
    }
    const logInfo = this.buildLog(LOG_LEVEL.DEBUG, ...args)
    this.printLog(logInfo)
  }

  trace(mensaje: string): void
  trace(mensaje: string, metadata: Metadata): void
  trace(mensaje: string, metadata: Metadata, modulo: string): void
  trace(opt: LogOptions): void
  trace(...args: unknown[]): void {
    const pinoLogger = LoggerService.mainPinoInstance
    if (!pinoLogger || !pinoLogger.isLevelEnabled(LOG_LEVEL.TRACE)) {
      return
    }
    const logInfo = this.buildLog(LOG_LEVEL.TRACE, ...args)
    this.printLog(logInfo)
  }

  audit(contexto: string, mensaje: string): void
  audit(contexto: string, mensaje: string, metadata: Metadata): void
  audit(contexto: string, opt: AuditOptions): void
  audit(contexto: string, ...args: unknown[]): void {
    const pinoLogger = LoggerService.auditPinoInstance
    if (
      !pinoLogger ||
      !pinoLogger.isLevelEnabled(contexto) ||
      !LoggerService.loggerParams?._audit.includes(contexto)
    ) {
      return
    }
    const auditInfo = LoggerService.buildAudit('none', contexto, ...args)
    this.printAudit(auditInfo)
  }

  auditError(contexto: string, mensaje: string): void
  auditError(contexto: string, mensaje: string, metadata: Metadata): void
  auditError(contexto: string, opt: AuditOptions): void
  auditError(contexto: string, ...args: unknown[]): void {
    const pinoLogger = LoggerService.auditPinoInstance
    if (
      !pinoLogger ||
      !pinoLogger.isLevelEnabled(contexto) ||
      !LoggerService.loggerParams?._audit.includes(contexto)
    ) {
      return
    }
    const auditInfo = LoggerService.buildAudit('error', contexto, ...args)
    this.printAudit(auditInfo)
  }

  auditWarning(contexto: string, mensaje: string): void
  auditWarning(contexto: string, mensaje: string, metadata: Metadata): void
  auditWarning(contexto: string, opt: AuditOptions): void
  auditWarning(contexto: string, ...args: unknown[]): void {
    const pinoLogger = LoggerService.auditPinoInstance
    if (
      !pinoLogger ||
      !pinoLogger.isLevelEnabled(contexto) ||
      !LoggerService.loggerParams?._audit.includes(contexto)
    ) {
      return
    }
    const auditInfo = LoggerService.buildAudit('warning', contexto, ...args)
    this.printAudit(auditInfo)
  }

  auditSuccess(contexto: string, mensaje: string): void
  auditSuccess(contexto: string, mensaje: string, metadata: Metadata): void
  auditSuccess(contexto: string, opt: AuditOptions): void
  auditSuccess(contexto: string, ...args: unknown[]): void {
    const pinoLogger = LoggerService.auditPinoInstance
    if (
      !pinoLogger ||
      !pinoLogger.isLevelEnabled(contexto) ||
      !LoggerService.loggerParams?._audit.includes(contexto)
    ) {
      return
    }
    const auditInfo = LoggerService.buildAudit('success', contexto, ...args)
    this.printAudit(auditInfo)
  }

  auditInfo(contexto: string, mensaje: string): void
  auditInfo(contexto: string, mensaje: string, metadata: Metadata): void
  auditInfo(contexto: string, opt: AuditOptions): void
  auditInfo(contexto: string, ...args: unknown[]): void {
    const pinoLogger = LoggerService.auditPinoInstance
    if (
      !pinoLogger ||
      !pinoLogger.isLevelEnabled(contexto) ||
      !LoggerService.loggerParams?._audit.includes(contexto)
    ) {
      return
    }
    const auditInfo = LoggerService.buildAudit('info', contexto, ...args)
    this.printAudit(auditInfo)
  }

  private buildException(origen: string, ...args: unknown[]): BaseException {
    // 1ra forma - (error: unknown) => BaseException
    if (arguments.length === 2) {
      return new BaseException(args[0], { origen })
    }

    // 2da forma - (error: unknown, mensaje: string) => BaseException
    else if (arguments.length === 3 && typeof args[1] === 'string') {
      return new BaseException(args[0], {
        mensaje: args[1],
        // origen,
      })
    }

    // 3ra forma - (error: unknown, mensaje: string, metadata: Metadata) => BaseException
    else if (arguments.length === 4 && typeof args[1] === 'string') {
      return new BaseException(args[0], {
        mensaje: args[1],
        metadata: args[2] as Metadata,
        // origen,
      })
    }

    // 4ta forma - (error: unknown, mensaje: string, metadata: Metadata, modulo: string) => BaseException
    else if (
      arguments.length === 5 &&
      typeof args[1] === 'string' &&
      typeof args[3] === 'string'
    ) {
      return new BaseException(args[0], {
        mensaje: args[1],
        metadata: args[2] as Metadata,
        modulo: args[3],
        // origen,
      })
    }

    // 5ta forma - (error: unknown, opt: BaseExceptionOptions) => BaseException
    else {
      return new BaseException(args[0], {
        ...(args[1] as BaseExceptionOptions),
        // origen,
      })
    }
  }

  private buildLog(
    lvl: LOG_LEVEL.WARN | LOG_LEVEL.INFO | LOG_LEVEL.DEBUG | LOG_LEVEL.TRACE,
    ...args: unknown[]
  ): BaseLog {
    // 1ra forma - (mensaje: string) => BaseLog
    if (arguments.length === 2 && typeof args[0] === 'string') {
      return new BaseLog({
        mensaje: args[0],
        level: lvl,
      })
    }

    // 2da forma - (mensaje: string, metadata: Metadata) => BaseLog
    else if (arguments.length === 3 && typeof args[0] === 'string') {
      return new BaseLog({
        mensaje: args[0],
        metadata: args[1] as Metadata,
        level: lvl,
      })
    }

    // 3ra forma - (mensaje: string, metadata: Metadata, modulo: string) => BaseLog
    else if (
      arguments.length === 4 &&
      typeof args[0] === 'string' &&
      typeof args[2] === 'string'
    ) {
      return new BaseLog({
        mensaje: args[0],
        metadata: args[1] as Metadata,
        modulo: args[2],
        level: lvl,
      })
    }

    // 4ta forma - (opt: BaseLogOptions) => BaseLog
    else {
      return new BaseLog({
        ...(args[0] as BaseLogOptions),
        level: lvl,
      })
    }
  }

  private static buildAudit(
    tipo: AuditType,
    contexto: string,
    ...args: unknown[]
  ): BaseAudit {
    // 1ra forma - (contexto: string, mensaje: string) => BaseAudit
    if (arguments.length === 3 && typeof args[0] === 'string') {
      return new BaseAudit({
        tipo,
        contexto,
        mensaje: args[0],
      })
    }

    // 2da forma - (contexto: string, mensaje: string, metadata: Metadata) => BaseAudit
    else if (arguments.length === 4 && typeof args[0] === 'string') {
      return new BaseAudit({
        tipo,
        contexto,
        mensaje: args[0],
        metadata: args[1] as Metadata,
      })
    }

    // 3ra forma - (contexto: string, opt: BaseAuditOptions) => BaseAudit
    else {
      return new BaseAudit({
        ...(args[0] as BaseAuditOptions),
        tipo,
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
    const time = dayjs().format('HH:mm:ss.SSS')
    const cTime = `${COLOR.RESET}${time}${COLOR.RESET}`
    const cLevel = `${color}[${level.toUpperCase()}]${COLOR.RESET}`
    const cCaller = `${COLOR.RESET}${caller}${COLOR.RESET}`

    stdoutWrite('\n')
    stdoutWrite(`${cTime} ${cLevel} ${cCaller} ${color}`)
    stdoutWrite(`${color}${msg.replace(/\n/g, `\n${color}`)}\n`)
    stdoutWrite(COLOR.RESET)
  }

  private printAuditToConsole(info: BaseAudit): void {
    const colorPrimario = LOG_AUDIT_COLOR[info.tipo]
    const colorSecundario = colorPrimario

    const metadata = info.metadata || {}
    const time = dayjs().format('HH:mm:ss.SSS')
    const timeColor = info.tipo === 'none' ? COLOR.LIGHT_GREY : COLOR.RESET
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
