import path from 'path'
import dotenv from 'dotenv'
import { LoggerOptions, LoggerService } from '../..'
import { createLogFile, delay } from '../utils'
import { printError } from './casos_uso/printError'
import { printWarn } from './casos_uso/printWarn'
import { printInfo } from './casos_uso/printInfo'
import { printAudit } from './casos_uso/printAudit'
import { ocultarInfo } from './casos_uso/ocultarInfo'
import { ocultarAudit } from './casos_uso/ocultarAudit'
import { TEST_APP_NAME } from '../utils/log-entry'

dotenv.config()

const loggingEnabled = String(process.env.LOG_ENABLED) === 'true'
const logToFileEnabled = String(process.env.LOG_FILE_ENABLED) === 'true'

const loggerOptions: LoggerOptions = {
  enabled: loggingEnabled,
  console: false,
  appName: TEST_APP_NAME,
  level: process.env.LOG_LEVEL,
  audit: process.env.LOG_AUDIT,
  hide: 'supersecretword',
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

if (loggingEnabled && logToFileEnabled) {
  loggerOptions.fileParams = {
    path: process.env.LOG_FILE_PATH,
    size: process.env.LOG_FILE_SIZE,
    rotateInterval: process.env.LOG_FILE_INTERVAL,
  }
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

  it('[logger] Verificando parámetros de configuración', () => {
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

  it('[logger] print audit', async () => {
    await printAudit()
  })

  it('[logger] ocultar info', async () => {
    await ocultarInfo()
  })

  it('[logger] ocultar audit', async () => {
    await ocultarAudit()
  })
})
