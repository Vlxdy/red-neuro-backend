import { AdvancedConsoleLogger } from 'typeorm'
import { format } from 'sql-formatter'
import { PlatformTools } from 'typeorm/platform/PlatformTools'
import { stdoutWrite } from '../tools'
import { COLOR, DEFAULT_SQL_LOGGER_PARAMS, ERROR_CODE } from '../constants'
import { SQLLoggerOptions, SQLLoggerParams } from '../types'
import { BaseException } from '../classes'

export class SQLLogger extends AdvancedConsoleLogger {
  private params: SQLLoggerParams = DEFAULT_SQL_LOGGER_PARAMS

  constructor(opt: SQLLoggerOptions = {}) {
    super(true)
    this.params = Object.assign({}, DEFAULT_SQL_LOGGER_PARAMS, opt)
  }

  logQuery(query: string, parameters?: unknown[]) {
    if (!this.params.level.query) {
      return
    }
    const sql = this.buildSql(query, parameters, false, true)
    stdoutWrite(`\n${COLOR.LIGHT_GREY}\n${sql}\n${COLOR.RESET}\n`)
  }

  logQueryError(error: string, query: string, parameters?: unknown[]): void {
    if (!this.params.level.error) {
      return
    }
    const sql = this.buildSql(query, parameters, true, false)

    throw new BaseException(error, {
      codigo: ERROR_CODE.SQL_ERROR,
      mensaje: `Ocurrió un error interno (${ERROR_CODE.SQL_ERROR})`,
      accion: 'Verificar la consulta SQL',
      metadata: { sql },
    })
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
    parameters?: Array<unknown>,
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
    } catch (err) {
      return parameters && parameters.length > 0
        ? `${query} -- PARAMETERS: ${this.stringifyParams(parameters)}`
        : query
    }
  }
}
