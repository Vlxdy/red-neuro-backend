import { AdvancedConsoleLogger, LoggerOptions } from 'typeorm'
import { format } from 'sql-formatter'
import { COLOR } from '../constants'
import { PlatformTools } from 'typeorm/platform/PlatformTools'
import dotenv from 'dotenv'
import { LoggerService } from '../logger.service'
import { stdoutWrite } from './util'

dotenv.config()

export class PrintSQL extends AdvancedConsoleLogger {
  private readonly loggerOptions?: LoggerOptions
  private logger: LoggerService = LoggerService.getInstance()

  constructor(options: LoggerOptions = true) {
    super(options)
    this.loggerOptions = options
  }

  logQuery(query: string, parameters?: any[]) {
    if (process.env.NODE_ENV === 'production') {
      return
    }

    if (process.env.LOG_SQL !== 'true') {
      if (process.env.FORCE_SQL_LOG === 'true') {
        // continue
      } else {
        return
      }
    }

    const opt = this.loggerOptions
    if (
      !(opt === 'all') &&
      !(opt === true) &&
      !(Array.isArray(opt) && opt.includes('query'))
    ) {
      return
    }

    const sql = this.buildSql(query, parameters, false, true)
    stdoutWrite(`\n${COLOR.LIGHT_GREY}\n${sql}\n${COLOR.RESET}\n`)
  }

  logQueryError(error: string, query: string, parameters?: any[]): void {
    const opt = this.loggerOptions
    if (
      !(opt === 'all') &&
      !(opt === true) &&
      !(Array.isArray(opt) && opt.includes('error'))
    ) {
      return
    }

    const sql = this.buildSql(query, parameters, true, false)
    this.logger.error('/////////////// QUERY FAILED ///////////////', sql)
    this.logger.error('/////////////// QUERY ERROR ///////////////', error)
  }

  private getValueToPrintSql(val: unknown): string {
    if (typeof val === 'string') {
      return val.indexOf("'") >= 0
        ? `E'${String(val.replace(/'/g, `\\'`))}'` // for postgres
        : `'${String(val)}'`
    }
    if (typeof val === 'number') return `${Number(val)}`
    if (typeof val === 'boolean') return `${Boolean(val)}`
    if (val instanceof Date) return `'${String(val.toISOString())}'`
    if (Array.isArray(val)) {
      throw new Error('array not support, possible JSON value')
    }
    if (typeof val === 'object' && val !== null) {
      throw new Error('object not support, possible JSON value')
    }
    return String(val)
  }

  private buildSql(
    query: string,
    parameters?: Array<any>,
    pretty?: boolean,
    colorize = true
  ) {
    let queryParsed =
      parameters && parameters.length > 0
        ? `${query} -- PARAMETERS: ${this.stringifyParams(parameters)}`
        : query

    try {
      if (!parameters || parameters.length === 0) {
        queryParsed = format(query, {
          language: 'postgresql',
          indentStyle: 'standard',
        })
      }
      if (parameters) {
        const params = {}
        for (const [index, param] of parameters.entries()) {
          params[index + 1] = this.getValueToPrintSql(param)
        }
        queryParsed = format(query, {
          language: 'postgresql',
          params,
          indentStyle: 'standard',
        })
      }

      if (colorize) {
        queryParsed = PlatformTools.highlightSql(queryParsed)
      }

      if (!pretty) {
        queryParsed = queryParsed
          .split('\n')
          .map((line) => line.trim())
          .join(' ')
      }

      return queryParsed
    } catch (err: any) {
      return parameters && parameters.length > 0
        ? `${query} -- PARAMETERS: ${this.stringifyParams(parameters)}`
        : query
    }
  }
}
