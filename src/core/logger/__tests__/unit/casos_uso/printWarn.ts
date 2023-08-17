import { LogEntry, LoggerService } from '../../../../logger'
import { delay, readLogFile } from '../../utils'

const logger = LoggerService.getInstance()

export async function printWarn() {
  logger.warn('Mensaje para el cliente')
  logger.warn('Mensaje para el cliente', { algun: 'metadato' })
  logger.warn('Mensaje para el cliente', { algun: 'metadato' }, 'MÓDULO')
  logger.warn({
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
    modulo: 'OTRO MÓDULO',
  })
  await delay()

  const zeroLine = 0
  const logFile = readLogFile<LogEntry>('warn.log')
  expect(logFile.getValue(zeroLine + 1)).toHaveLength(4)

  const firstEntry = logFile.getEntry(zeroLine + 1)
  expect(firstEntry).toMatchObject({
    level: 40,
    reqId: '',
    caller: 'printWarn.ts:7:10',
    levelText: 'warn',
    appName: 'agetic-nestjs-base-backend',
    modulo: '',
    mensaje: 'Mensaje para el cliente',
  })
  expect(firstEntry).toHaveProperty('time')
  expect(firstEntry).toHaveProperty('pid')
  expect(firstEntry).toHaveProperty('hostname')
  expect(firstEntry).toHaveProperty('fecha')

  const secondEntry = logFile.getEntry(zeroLine + 2)
  expect(secondEntry).toMatchObject({
    level: 40,
    levelText: 'warn',
    modulo: '',
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato' },
  })

  const thirdEntry = logFile.getEntry(zeroLine + 3)
  expect(thirdEntry).toMatchObject({
    level: 40,
    levelText: 'warn',
    modulo: 'MÓDULO',
    mensaje: 'MÓDULO :: Mensaje para el cliente',
    metadata: { algun: 'metadato' },
  })

  const fourthEntry = logFile.getEntry(zeroLine + 4)
  expect(fourthEntry).toMatchObject({
    level: 40,
    levelText: 'warn',
    modulo: 'OTRO MÓDULO',
    mensaje: 'OTRO MÓDULO :: Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
  })
}
