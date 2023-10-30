import { AUDIT_LEVEL } from '../constants'
import { AuditEntry, BaseAuditOptions, Metadata } from '../types'
import { getReqID } from '../utilities'

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

  constructor(opt: BaseAuditOptions) {
    this.contexto = opt.contexto
    this.mensaje = opt.mensaje
    this.metadata = opt.metadata
    this.formato = opt.formato
    this.level = opt.level || AUDIT_LEVEL.DEFAULT
  }

  getLogEntry(): AuditEntry {
    const args: AuditEntry = {
      context: this.contexto,
      reqId: getReqID() || undefined,
      pid: process.pid,
    }

    if (this.mensaje) {
      args.msg = this.mensaje
    }

    const metadata = this.metadata
    if (metadata && Object.keys(metadata).length > 0) {
      // para evitar conflictos con palabras reservadas
      Object.keys(metadata).map((key) => {
        if (['level', 'time', 'context', 'msg', 'reqId', 'pid'].includes(key)) {
          args[`_${key}`] = metadata[key]
        } else {
          args[key] = metadata[key]
        }
      })
    }

    return args
  }
}
