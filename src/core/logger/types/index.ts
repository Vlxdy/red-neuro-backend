import { Level } from 'pino'
import { LoggerService } from '../classes'
import { HttpStatus } from '@nestjs/common'
import { AUDIT_LEVEL, ERROR_CODE, LOG_LEVEL } from '../constants'

export type FileParams = {
  path: string
  size: string
  rotateInterval: string
}

export type LokiParams = {
  url: string
  username: string
  password: string
  batching: string
  batchInterval: string
}

export type AuditParams = {
  context: string
}

export type LoggerParams = {
  console: string
  appName: string
  level: string
  hide: string
  projectPath: string
  fileParams?: FileParams
  lokiParams?: LokiParams
  auditParams?: AuditParams
  excludeOrigen?: string[]
  _levels: Level[]
  _audit: string[]
}

export type LoggerOptions = {
  console?: string
  appName?: string
  level?: string
  hide?: string
  projectPath?: string
  excludeOrigen?: string[]
  fileParams?: Partial<FileParams>
  lokiParams?: Partial<LokiParams>
  auditParams?: Partial<AuditParams>
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
}

export type BaseLogOptions = {
  level?: LOG_LEVEL
  mensaje?: string
  metadata?: Metadata
  modulo?: string
}

export type BaseAuditOptions = {
  level?: AUDIT_LEVEL
  contexto: string
  mensaje?: string
  metadata?: Metadata
  formato?: string
}

export type LogOptions = {
  mensaje?: string
  metadata?: Metadata
  modulo?: string
}

export type AuditOptions = {
  mensaje?: string
  metadata?: Metadata
  formato?: string
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
  level?: number // 30=info, 40=warn, 50=error
  levelText?: string // error | warn | info
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
  formato?: string
  httpStatus?: number // ^400 | ^500
  origen?: string // 'at printError (.../casos_uso/printError.ts:8:15)'
  traceStack?: string
}

export type AuditEntry = {
  level?: number // 10=application | 11=request | ...
  time?: number // miliseconds
  msg?: string
  [key: string]: unknown // metadata key:value
}
