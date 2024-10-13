import { LoggerService } from '../classes'
import { HttpStatus } from '@nestjs/common'
import { AUDIT_LEVEL, COLOR, ERROR_CODE, LOG_LEVEL } from '../constants'

export type FileParams = {
  path: string
  size: string
  rotateInterval: string
}

export type LokiParams = {
  url: string
  username: string
  password: string
  batching: boolean
  batchInterval: number
}

export type RowData = {
  fechaEvento: Date
  contexto: string
  mensaje: string | null
  reqId: string | null
  metadata: { [key: string]: unknown } | null
}

export type LogData = {
  json: object | null
  str: string | null
}

export type LoggerOptions = {
  enabled?: boolean
  console?: boolean
  appName?: string
  level?: string
  audit?: string
  hide?: string
  projectPath?: string
  excludeOrigen?: string[]
  fileParams?: Partial<FileParams>
  lokiParams?: Partial<LokiParams>
}

export type AppInfo = {
  name: string
  version: string
  env: string
  port: string
}

export type SQLLoggerParams = {
  logger: LoggerService
  level: {
    error: boolean
    query: boolean
  }
}

export type SQLLoggerOptions = Partial<SQLLoggerParams>

export type SQLLogLevel = {
  error: boolean
  query: boolean
}

export type BaseExceptionOptions = {
  mensaje?: string
  metadata?: Metadata
  modulo?: string
  httpStatus?: HttpStatus
  causa?: string
  accion?: string
  codigo?: ERROR_CODE
  origen?: string
  clientInfo?: unknown
  consoleOptions?: ConsoleOptions
}

export type BaseLogOptions = {
  level?: LOG_LEVEL
  mensaje?: string
  metadata?: Metadata
  modulo?: string
  consoleOptions?: ConsoleOptions
}

export type ConsoleOptions = {
  disabled?: boolean
  hideLevel?: boolean
  hideCaller?: boolean
  display?: 'inline' | 'block'
  mensaje?: string
  propsToHide?: string[]
}

export type BaseAuditOptions = {
  level?: AUDIT_LEVEL
  contexto: string
  mensaje?: string
  metadata?: Metadata
  formato?: string
  consoleOptions?: ConsoleOptions
}

export type LogOptions = {
  mensaje?: string
  metadata?: Metadata
  modulo?: string
}

export type AuditOptions = {
  mensaje?: string
  metadata?: Metadata

  /**
   * En su lugar utilizar: consoleOptions.mensaje
   * @deprecated
   */
  formato?: string
  consoleOptions?: ConsoleOptions
}

export type Metadata = { [key: string]: unknown }

export type ObjectOrError = {
  statusCode?: number
  message?: string | object | (string | object)[]
  error?: string
}

export type LogEntry = {
  appName?: string
  context?: string
  fecha: string // con formato YYYY-MM-DD HH:mm:ss.SSS
  hostname?: string
  level?: number // 20=debug, 30=info, 40=warn, 50=error, 100=audit
  mensaje?: string
  metadata?: Metadata
  modulo?: string
  pid: number
  time?: number // miliseconds
  reqId?: string
  accion?: string // negarse, llorar, aceptar.
  causa?: string
  codigo?: string // ERROR_CODE
  error?: object // error parseado
  errorStack?: string
  httpStatus?: number // ^400 | ^500
  origen?: string // 'at printError (.../casos_uso/printError.ts:8:15)'
  traceStack?: string
  caller?: string // printError (printError.ts:8:15)
}

export type AuditEntry = {
  level?: number // 10=application | 11=request | ...
  time?: number // miliseconds
  fecha: string // con formato YYYY-MM-DD HH:mm:ss.SSS
  msg?: string
  [key: string]: unknown // metadata key:value
}

export type ToStringOptions = {
  color?: COLOR
  keyColor?: COLOR
  timeColor?: COLOR
  resetColor?: COLOR
}
