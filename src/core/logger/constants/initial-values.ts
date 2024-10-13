import { LoggerService } from '../classes'
import { SQLLoggerParams } from '../types'

export const CLEAN_PARAM_VALUE_MAX_DEEP = 10

export const DEFAULT_SQL_LOGGER_PARAMS: SQLLoggerParams = {
  logger: {
    error: (...params: unknown[]) => console.error(...params),
  } as LoggerService,
  level: {
    error: true,
    query: true,
  },
}
