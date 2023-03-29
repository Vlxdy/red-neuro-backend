import { AxiosError } from 'axios'
import { Injectable, INestApplication } from '@nestjs/common'
import dayjs from 'dayjs'
import { Params, PinoLogger } from 'nestjs-pino'
import { inspect } from 'util'
import { COLOR, LOG_COLOR, LOG_LEVEL } from './constants'
import fastRedact from 'fast-redact'
import { LoggerConfig } from './logger.config'
import { toJSON } from 'flatted'
import { stdoutWrite } from './tools/util'

@Injectable()
export class LoggerService {
  private static instance: LoggerService | null = null
  private static pinoInstance: PinoLogger | null = null
  private readonly redact: fastRedact.redactFn

  constructor() {
    this.redact = fastRedact(LoggerConfig.redactOptions())
  }

  static async initialize(app: INestApplication) {
    if (LoggerService.pinoInstance) return
    LoggerService.pinoInstance = await app.resolve<PinoLogger>(PinoLogger)
  }

  static initializeWithParams(params: Params) {
    if (LoggerService.pinoInstance) return
    LoggerService.pinoInstance = new PinoLogger(params)
  }

  static getInstance() {
    if (LoggerService.instance) {
      return LoggerService.instance
    }
    const logger = new LoggerService()
    LoggerService.instance = logger
    return LoggerService.instance
  }

  getContext(): string {
    try {
      const projectPath = process.cwd()
      const method = String(new Error().stack)
        .split('\n')
        .slice(4)
        .map((line) => line.replace(new RegExp(projectPath, 'g'), '...'))
        .filter((line) => line.includes('.../src'))
        .map((line) => line.split('/').pop()?.slice(0, -1))
        .shift()
      return method || '-'
    } catch (e) {
      return '-'
    }
  }

  /**
   * @deprecated Cambiado por el método info. Ej: this.loggger.info('message')
   * @param optionalParams
   */
  log(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.INFO, ...optionalParams)
  }

  /**
   * @deprecated Cambiado por el método trace. Ej: this.loggger.trace('message')
   * @param optionalParams
   */
  verbose(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.TRACE, ...optionalParams)
  }

  error(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.ERROR, ...optionalParams)
  }

  warn(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.WARN, ...optionalParams)
  }

  info(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.INFO, ...optionalParams)
  }

  debug(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.DEBUG, ...optionalParams)
  }

  trace(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.TRACE, ...optionalParams)
  }

  static cleanAxiosResponse(value: any, deep = 0) {
    try {
      // Para evitar recursividad infinita
      if (deep > 5) return String(value)

      JSON.stringify(value)
      return value
    } catch (error) {
      if (Array.isArray(value)) {
        return value.map((item) =>
          LoggerService.cleanAxiosResponse(item, deep + 1)
        )
      }
      if (LoggerService.isAxiosResponse(value)) {
        return {
          data: value.data,
          status: value.status,
          statusText: value.statusText,
          headers: value.headers,
          config: value.config,
        }
      }
      if (typeof value === 'object') {
        return Object.keys(value).reduce((prev, curr) => {
          prev[curr] = LoggerService.cleanAxiosResponse(value[curr], deep + 1)
          return prev
        }, {} as any)
      }
      try {
        return toJSON(value)
      } catch (e) {
        return [e.toString()]
      }
    }
  }

  private static isAxiosResponse(data: any) {
    return Boolean(
      typeof data === 'object' &&
        typeof data.data !== 'undefined' &&
        typeof data.status !== 'undefined' &&
        typeof data.statusText !== 'undefined' &&
        typeof data.headers !== 'undefined' &&
        typeof data.config !== 'undefined'
    )
  }

  private print(level: LOG_LEVEL, ...optionalParams: unknown[]) {
    try {
      const context = this.getContext()

      // CLEAN PARAMS
      optionalParams = optionalParams.map((data: any) =>
        LoggerService.cleanAxiosResponse(data)
      )

      if (LoggerConfig.logLevelSelected.includes(level)) {
        optionalParams.map((param) => {
          if (LoggerService.pinoInstance) {
            LoggerService.pinoInstance[level]({ msg: param, context })
          }
        })
      }
      if (process.env.NODE_ENV === 'production') {
        return
      }

      const color = this.getColor(level)
      const time = dayjs().format('DD/MM/YYYY HH:mm:ss')
      const cTime = `${COLOR.RESET}[${time}]${COLOR.RESET}`
      const cLevel = `${color}${level.toUpperCase()}${COLOR.RESET}`
      const cContext = `${COLOR.RESET}(${context}):${COLOR.RESET}`

      stdoutWrite('\n')
      stdoutWrite(`${cTime} ${cLevel} ${cContext} ${color}`)
      optionalParams.map((data) => {
        try {
          if (data && data instanceof AxiosError) {
            data = data.toJSON()
          }
          data =
            data && typeof data === 'object' && !(data instanceof Error)
              ? JSON.parse(this.redact(JSON.parse(JSON.stringify(data))))
              : data
        } catch (err) {
          //
        }
        const toPrint =
          typeof data === 'object'
            ? inspect(data, false, null, false)
            : String(data)
        stdoutWrite(`${color}${toPrint.replace(/\n/g, `\n${color}`)}\n`)
      })
      stdoutWrite(COLOR.RESET)
    } catch (e) {
      console.error(e)
    }
  }

  private getColor(level: LOG_LEVEL) {
    return LOG_COLOR[level]
  }
}
