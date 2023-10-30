import path from 'path'
import dotenv from 'dotenv'
import packageJson from '../../../../../package.json'
import { LoggerOptions, LoggerService } from '../..'
import { createLogFile, delay } from '../utils'
import { printError } from './casos_uso/printError'
import { printWarn } from './casos_uso/printWarn'
import { printInfo } from './casos_uso/printInfo'
import { ocultarInfo } from './casos_uso/ocultarInfo'

dotenv.config()

const loggerOptions: LoggerOptions = {
  console: 'false',
  appName: packageJson.name,
  level: 'trace',
  fileParams: process.env.LOG_PATH
    ? {
        path: process.env.LOG_PATH,
        size: process.env.LOG_SIZE,
        rotateInterval: process.env.LOG_INTERVAL,
      }
    : undefined,
  lokiParams: process.env.LOG_LOKI_URL
    ? {
        url: process.env.LOG_LOKI_URL,
        username: process.env.LOG_LOKI_USERNAME,
        password: process.env.LOG_LOKI_PASSWORD,
        batching: process.env.LOG_LOKI_BATCHING,
        batchInterval: process.env.LOG_LOKI_BATCH_INTERVAL,
      }
    : undefined,
  auditParams: {
    context: process.env.LOG_AUDIT,
  },
  excludeOrigen: [
    'node:internal',
    'node_modules',
    'src/driver',
    'src/query-builder',
    'src/entity-manager',
    'src/common/exceptions',
  ],
  projectPath: path.resolve(__dirname),
}

describe('Logger prueba unitaria', () => {
  beforeAll(async () => {
    await createLogFile('info.log')
    await createLogFile('warn.log')
    await createLogFile('error.log')
    await createLogFile('audit_application.log')
    LoggerService.initialize(loggerOptions)
    await delay()
  })

  it('[logger] Verificando parámetros de configuración', async () => {
    const params = LoggerService.getLoggerParams()
    expect(params).toMatchObject(loggerOptions)
  })

  it('[logger] print error', async () => {
    await printError()
  })

  it('[logger] print warn', async () => {
    await printWarn()
  })

  it('[logger] print info', async () => {
    await printInfo()
  })

  it('[logger] ocultar info', async () => {
    await ocultarInfo()
  })
})
