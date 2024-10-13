import { Level } from 'pino'
import { FileParams, LoggerOptions, LokiParams } from '../types'
import { COLOR, DEFAULT_SENSITIVE_PARAMS, LOG_LEVEL } from '../constants'
import { stdoutWrite } from '../tools'

export class LoggerParams {
  enabled: boolean = true
  console: boolean = true
  appName: string = 'app'
  level: string = 'info'
  audit: string = 'application'
  hide: string = ''
  projectPath: string = process.cwd()
  fileParams?: FileParams
  lokiParams?: LokiParams
  excludeOrigen: string[] = []

  static HIDE: string[] = DEFAULT_SENSITIVE_PARAMS
  static LEVELS: Level[] = []
  static AUDIT: string[] = []

  static LOG_ENABLED: boolean = true // Habilita el registro de logs
  static LOG_CONSOLE_ENABLED: boolean = true // Habilita la impresión de logs por consola
  static LOG_FILE_ENABLED: boolean = false // Habilita el guardado de logs en ficheros
  static LOG_LOKI_ENABLED: boolean = false // Habilita el guardado de logs en la nube con loki

  constructor(options: LoggerOptions) {
    if (typeof options.enabled !== 'undefined') {
      this.enabled = options.enabled
      LoggerParams.LOG_ENABLED = options.enabled
    }

    if (typeof options.console !== 'undefined') {
      this.console = options.console
      LoggerParams.LOG_CONSOLE_ENABLED = options.console
    }

    if (options.appName) {
      this.appName = options.appName
    }

    if (options.level) {
      this.level = options.level
    }

    if (options.audit) {
      this.audit = options.audit
    }

    if (options.hide) {
      this.hide = options.hide
    }

    if (options.projectPath) {
      this.projectPath = options.projectPath
    }

    if (options.fileParams) {
      this.fileParams = {
        path: options.fileParams.path || '',
        size: options.fileParams.size || '50M',
        rotateInterval: options.fileParams.rotateInterval || 'YM',
      }
      LoggerParams.LOG_FILE_ENABLED = true
    }

    if (options.lokiParams) {
      this.lokiParams = {
        url: options.lokiParams.url || '',
        username: options.lokiParams.username || '',
        password: options.lokiParams.password || '',
        batching: String(options.lokiParams.batching || 'true') === 'true',
        batchInterval:
          typeof options.lokiParams.batchInterval !== 'undefined'
            ? options.lokiParams.batchInterval
            : 5,
      }
      LoggerParams.LOG_LOKI_ENABLED = true
    }

    this.excludeOrigen = options.excludeOrigen || [
      // node
      'node:internal',
      'node_modules',

      // typeorm
      'src/driver',
      'src/query-builder',
      'src/entity-manager',

      // custom
      'src/core/logger',
      'src/common/exceptions',
    ]

    LoggerParams.LEVELS = this.buildValidLevels(this.level)
    LoggerParams.AUDIT = this.buildValidAudit(this.audit)
    LoggerParams.HIDE = this.buildValidHide(this.hide)
  }

  print() {
    stdoutWrite(
      `\n${COLOR.LIGHT_GREY} ┌──────── Logger Service ───────── ...${COLOR.RESET}\n`
    )
    const singleProps = [
      'projectPath', //
      'appName',
      'level',
    ]
    singleProps.forEach((property) => {
      stdoutWrite(
        ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String(property).padEnd(17)}` +
          `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN}${this[property]}${COLOR.RESET}\n`
      )
    })

    if (LoggerParams.LEVELS.length > 0) {
      stdoutWrite(
        `${COLOR.LIGHT_GREY} ├──────── Basic context ────────── ...${COLOR.RESET}\n`
      )
      stdoutWrite(
        ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String('_levels').padEnd(17)}` +
          `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN} - ${LoggerParams.LEVELS[0]}${COLOR.RESET}\n`
      )
      for (const item of [...LoggerParams.LEVELS].slice(1)) {
        stdoutWrite(
          ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${''.padEnd(17)}` +
            `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN} - ${item}${COLOR.RESET}\n`
        )
      }
    }

    if (LoggerParams.AUDIT.length > 0) {
      stdoutWrite(
        `${COLOR.LIGHT_GREY} ├──────── Audit context ────────── ...${COLOR.RESET}\n`
      )
      stdoutWrite(
        ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String('_audit').padEnd(17)}` +
          `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN} - ${LoggerParams.AUDIT[0]}${COLOR.RESET}\n`
      )
      for (const item of [...LoggerParams.AUDIT].slice(1)) {
        stdoutWrite(
          ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${''.padEnd(17)}` +
            `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN} - ${item}${COLOR.RESET}\n`
        )
      }
    }

    if (this.fileParams) {
      const params = this.fileParams
      stdoutWrite(
        `${COLOR.LIGHT_GREY} ├──────── File params ──────────── ...${COLOR.RESET}\n`
      )
      Object.keys(params).forEach((property) => {
        stdoutWrite(
          ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String(property).padEnd(17)}` +
            `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN}${params[property]}${COLOR.RESET}\n`
        )
      })
    }

    if (this.lokiParams) {
      const params = this.lokiParams
      stdoutWrite(
        `${COLOR.LIGHT_GREY} ├──────── Loki params ──────────── ...${COLOR.RESET}\n`
      )
      Object.keys(params).forEach((property) => {
        stdoutWrite(
          ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String(property).padEnd(17)}` +
            `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN}${params[property]}${COLOR.RESET}\n`
        )
      })
    }

    stdoutWrite(
      `${COLOR.LIGHT_GREY} └───────────────────────────────── ...${COLOR.RESET}\n\n`
    )
  }

  private buildValidLevels(level: string): LOG_LEVEL[] {
    const allLevels = Object.values(LOG_LEVEL) as string[]
    const index = allLevels.indexOf(level)
    return (index !== -1 ? allLevels.slice(0, index + 1) : []) as LOG_LEVEL[]
  }

  private buildValidAudit(audit: string): string[] {
    if (audit.length === 0) return []
    if (audit.indexOf(',') >= 0) return audit.split(',') || []
    if (audit.indexOf(' ') >= 0) return audit.split(' ') || []
    return []
  }

  private buildValidHide(hide: string): string[] {
    const initialProps = DEFAULT_SENSITIVE_PARAMS
    if (hide.length === 0) return initialProps
    if (hide.indexOf(',') >= 0) {
      return initialProps.concat(hide.split(',')) || initialProps
    }
    if (hide.indexOf(' ') >= 0) {
      return initialProps.concat(hide.split(' ')) || initialProps
    }
    return initialProps.concat(hide)
  }
}
