import {
  BaseLogOptions,
  ConsoleOptions,
  LogEntry,
  Metadata,
  ToStringOptions,
} from '../types'
import {
  cleanParamValue,
  extraerOrigenSimplificado,
  getOrigen,
  getReqID,
  timeToPrint,
} from '../utilities'
import { LOG_LEVEL } from '../constants'
import { LoggerService } from './LoggerService'
import { inspect } from 'util'
import { replacePlaceholders } from '../tools'

export class BaseLog {
  level: LOG_LEVEL

  /**
   * Mensaje para el cliente
   */
  mensaje: string

  /**
   * Objeto que contiene información adicional
   */
  metadata: Metadata

  /**
   * Identificador de la aplicación. Ej: app-backend | app-frontend | node-script
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
   * Ruta simplificada de la línea de código que imprimió este log (Ej.: AppModule.bootstrap (main.ts:12:45))
   */
  caller?: string

  /**
   * Parámetros de configuración exclusivos para la impresión de logs por consola
   */
  consoleOptions?: ConsoleOptions

  constructor(opt?: BaseLogOptions) {
    const level = LOG_LEVEL.INFO
    const metadata: Metadata = {}
    const loggerParams = LoggerService.getLoggerParams()
    const appName = loggerParams?.appName || ''
    const modulo = ''
    const mensaje = ''

    // GUARDAMOS LOS DATOS
    this.fecha = new Date()
    this.level = opt && typeof opt.level !== 'undefined' ? opt.level : level
    this.mensaje =
      opt && typeof opt.mensaje !== 'undefined' ? opt.mensaje : mensaje
    this.appName = appName
    this.modulo = opt && typeof opt.modulo !== 'undefined' ? opt.modulo : modulo
    this.caller = extraerOrigenSimplificado(getOrigen(`${new Error().stack}`))

    this.consoleOptions = opt?.consoleOptions || {}
    if (typeof opt?.consoleOptions?.disabled === 'undefined') {
      this.consoleOptions.disabled = false
    }
    if (typeof opt?.consoleOptions?.display === 'undefined') {
      this.consoleOptions.display = 'block'
    }

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
  }

  obtenerMensajeCliente() {
    return this.modulo ? `${this.modulo} :: ${this.mensaje}` : this.mensaje
  }

  getLevel() {
    return this.level
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
      reqId: this.getReqId(),
      pid: process.pid,
      context: this.getLevel(),
      mensaje: this.obtenerMensajeCliente(),
    }

    // Para evitar guardar información vacía
    if (!args.mensaje) args.mensaje = undefined

    if (this.metadata && Object.keys(this.metadata).length > 0) {
      Object.assign(args, { metadata: this.metadata })
    }

    return args
  }

  toString(opt: ToStringOptions = {}) {
    const color = opt.color || ''
    const keyColor = opt.keyColor || ''
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

    if (this.consoleOptions?.mensaje) {
      const mensaje = replacePlaceholders(
        this.consoleOptions.mensaje,
        this.metadata,
        opt
      )
      msgToPrint += ` ${mensaje}`
    } else {
      msgToPrint += ` ${this.obtenerMensajeCliente()}`
    }

    const display = this.consoleOptions?.display || 'block'
    // block
    if (display === 'block') {
      const nProps = Object.keys(this.metadata || {}).length
      if (this.metadata && nProps > 0) {
        Object.keys(this.metadata).map((key, index) => {
          const item = this.metadata[key]
          msgToPrint += `${typeof item === 'string' ? item : inspect(item, false, null, false)}`
          msgToPrint += index === nProps - 1 ? '' : '\n\n'
        })
      }
    }
    // inline
    else if (display === 'inline') {
      const metadata = this.metadata
      const cValues = Object.keys(metadata)
        .filter(
          (key) =>
            typeof metadata[key] !== 'undefined' &&
            !this.consoleOptions?.propsToHide?.includes(key)
        )
        .map((key) => {
          const value = inspect(metadata[key], false, null, false)
          return `${keyColor}${key}=${color}${value}`
        })
        .join(' ')
      msgToPrint += ` ${cValues}`
    }

    return `${color}${msgToPrint.replace(/\n/g, `\n${color}`)}${resetColor}\n`
  }
}
