import { inspect } from 'util'
import { AUDIT_LEVEL } from '../constants'
import { replacePlaceholders } from '../tools'
import {
  AuditEntry,
  BaseAuditOptions,
  ConsoleOptions,
  Metadata,
  ToStringOptions,
} from '../types'
import { cleanParamValue, getReqID, timeToPrint } from '../utilities'

const palabrasReservadas = [
  'level',
  'time',
  'context',
  'msg',
  'reqId',
  'pid',
  'fecha',
]

export class BaseAudit {
  /**
   * Índica el nivel de la importancia para el resaltado del mensaje por consola
   */
  level: AUDIT_LEVEL

  /**
   * Contexto para el que se creará el log de auditoría
   */
  contexto: string

  /**
   * Fecha exacta en la que registra el log
   */
  fecha: Date

  /**
   * Contexto para el que se creará el log de auditoría
   */
  mensaje?: string

  /**
   * Objeto que contiene información adicional
   */
  metadata?: Metadata

  /**
   * Mensaje para la consola (Advertencia: Este dato NO SE GUARDA EN LOS FICHEROS DE LOGS)
   */
  formato?: string

  /**
   * Parámetros de configuración exclusivos para la impresión de logs por consola
   */
  consoleOptions?: ConsoleOptions

  constructor(opt: BaseAuditOptions) {
    this.contexto = opt.contexto
    this.fecha = new Date()
    this.mensaje = opt.mensaje
    this.metadata = opt.metadata ? cleanParamValue(opt.metadata) : undefined
    this.formato = opt.formato
    this.level = opt.level || AUDIT_LEVEL.DEFAULT
    this.consoleOptions = opt.consoleOptions || {}
    if (typeof opt.consoleOptions?.disabled === 'undefined') {
      this.consoleOptions.disabled = false
    }
    if (typeof opt.consoleOptions?.display === 'undefined') {
      this.consoleOptions.display = 'block'
    }
  }

  getReqId() {
    return getReqID() || undefined
  }

  getFechaConFormato() {
    return timeToPrint(this.fecha)
  }

  getLogEntry(): AuditEntry {
    const args: AuditEntry = {
      fecha: this.getFechaConFormato(),
      reqId: this.getReqId(),
      pid: process.pid,
      context: this.contexto,
    }

    if (this.mensaje) {
      args.msg = this.mensaje
    }

    const metadata = this.metadata
    if (metadata && Object.keys(metadata).length > 0) {
      // para evitar conflictos con palabras reservadas
      Object.keys(metadata).map((key) => {
        if (palabrasReservadas.includes(key)) {
          args[`_${key}`] = metadata[key]
        } else {
          args[key] = metadata[key]
        }
      })
    }

    return args
  }

  toString(opt: ToStringOptions = {}) {
    const color = opt.color || ''
    const keyColor = opt.keyColor || ''
    const timeColor = opt.timeColor || ''
    const resetColor = opt.resetColor || ''

    const metadata = this.metadata || {}
    const cTime = `${timeColor}${this.getFechaConFormato()}${resetColor}`

    let msgToPrint = ''
    msgToPrint += '\n'

    // FORMATO PERSONALIZADO
    const mensaje = this.consoleOptions?.mensaje || this.formato || ''
    if (mensaje) {
      const msg = replacePlaceholders(mensaje, metadata, opt)
      const cLevel = `${color}[${this.contexto}]${resetColor}`
      const cMsg = `${color}${msg}${resetColor}`
      msgToPrint += `${cTime} ${cLevel} ${cMsg}`
      msgToPrint += resetColor
    }

    // FORMATO POR DEFECTO
    else {
      const msg = this.mensaje
      const cLevel = `${color}[${this.contexto}]${resetColor}`
      const cMsg = `${color}${msg}${resetColor}`
      const cValues = Object.keys(metadata)
        .filter(
          (key) =>
            typeof metadata[key] !== 'undefined' &&
            !this.consoleOptions?.propsToHide?.includes(key)
        )
        .map((key) => {
          const value = inspect(metadata[key], false, null, false)
          const cValue = value.replace(/\n/g, `\n${color}`)
          return `${keyColor}${key}=${color}${cValue}`
        })
        .join(' ')
      msgToPrint += `${cTime} ${cLevel} ${cMsg} ${cValues}`
      msgToPrint += resetColor
    }

    return `${color}${msgToPrint.replace(/\n/g, `\n${color}`)}${resetColor}\n`
  }
}
