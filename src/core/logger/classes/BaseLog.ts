import { BaseLogOptions, LogEntry, Metadata } from '../types'
import {
  cleanParamValue,
  getContext,
  getHostname,
  getReqID,
} from '../utilities'
import { LOG_LEVEL, LOG_NUMBER } from '../constants'
import dayjs from 'dayjs'
import { LoggerService } from './LoggerService'
import { inspect } from 'util'

export class BaseLog {
  level: LOG_LEVEL.WARN | LOG_LEVEL.INFO | LOG_LEVEL.DEBUG | LOG_LEVEL.TRACE

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
   * Fecha en la que se registró el mensaje (YYYY-MM-DD HH:mm:ss.SSS)
   */
  fecha: string

  /**
   * Stack del componente que registró el mensaje (se genera de forma automática)
   */
  traceStack: string

  constructor(opt?: BaseLogOptions) {
    const level = LOG_LEVEL.INFO
    const metadata: Metadata = {}
    const loggerParams = LoggerService.getLoggerParams()
    const appName = loggerParams?.appName || ''
    const modulo = ''
    const mensaje = ''

    // GUARDAMOS LOS DATOS
    this.fecha = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
    this.level = opt && typeof opt.level !== 'undefined' ? opt.level : level
    this.mensaje =
      opt && typeof opt.mensaje !== 'undefined' ? opt.mensaje : mensaje
    this.appName = appName
    this.modulo = opt && typeof opt.modulo !== 'undefined' ? opt.modulo : modulo

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

  getNumericLevel() {
    return LOG_NUMBER[this.level]
  }

  getLogEntry(): LogEntry {
    const args: LogEntry = {
      // level: this.getNumericLevel(),
      // time: Date.now(),
      hostname: getHostname(),
      pid: process.pid,

      reqId: getReqID(),
      caller: getContext(),
      fecha: this.fecha,
      levelText: this.level,
      appName: this.appName,
      modulo: this.modulo,
      mensaje: this.obtenerMensajeCliente(),
    }

    if (this.metadata && Object.keys(this.metadata).length > 0) {
      Object.assign(args, { metadata: this.metadata })
    }

    return args
  }

  toString(): string {
    const args: string[] = []
    args.push(this.obtenerMensajeCliente())

    if (this.metadata && Object.keys(this.metadata).length > 0) {
      Object.keys(this.metadata).map((key) => {
        const item = this.metadata[key]
        args.push(`- ${key}:`)
        args.push(
          typeof item === 'string' ? item : inspect(item, false, null, false)
        )
        args.push('')
      })
    }

    return args.join('\n')
  }
}
