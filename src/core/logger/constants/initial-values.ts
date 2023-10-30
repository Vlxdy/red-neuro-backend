import { LoggerService } from '../classes'
import { LoggerParams, SQLLoggerParams } from '../types'

export const DEFAULT_PARAMS: LoggerParams = {
  console: 'true',
  appName: 'app',
  level: 'info',
  hide: '',
  projectPath: process.cwd(),
  fileParams: {
    path: '',
    size: '50M',
    rotateInterval: 'YM',
  },
  lokiParams: {
    url: '',
    username: '',
    password: '',
    batching: 'true',
    batchInterval: '5', // en segundos
  },
  auditParams: {
    context: 'application',
  },
  excludeOrigen: [
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
  ],
  _levels: [],
  _audit: [],
}

export const CLEAN_PARAM_VALUE_MAX_DEEP = 10

export const DEFAULT_SENSITIVE_PARAMS: string[] = [
  'contrasena',
  'contrasenanueva',
  'password',
  'authorization',
  'cookie',
  'token',
  'idtoken',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
]

export const DEFAULT_SQL_LOGGER_PARAMS: SQLLoggerParams = {
  logger: {
    error: (...params: unknown[]) => console.error(...params),
  } as LoggerService,
  level: {
    error: true,
    query: true,
  },
}
