import { LogEntry, LoggerService } from '../../../../logger'
import { delay, readLogFile } from '../../utils'

const logger = LoggerService.getInstance()

export async function printDebug() {
  logger.debug('Mensaje para el cliente')
  logger.debug('Mensaje para el cliente', { algun: 'metadato' })
  logger.debug('Mensaje para el cliente', { algun: 'metadato' }, 'MÓDULO')
  logger.debug({
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
    modulo: 'OTRO MÓDULO',
  })
  await delay()

  const zeroLine = 0
  const logFile = readLogFile<LogEntry>('debug.log')
  expect(logFile.getValue(zeroLine + 1)).toHaveLength(4)

  const firstEntry = logFile.getEntry(zeroLine + 1)
  expect(firstEntry).toMatchObject({
    level: 20,
    reqId: '',
    caller: 'printDebug.ts:7:10',
    levelText: 'debug',
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
    level: 20,
    levelText: 'debug',
    modulo: '',
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato' },
  })

  const thirdEntry = logFile.getEntry(zeroLine + 3)
  expect(thirdEntry).toMatchObject({
    level: 20,
    levelText: 'debug',
    modulo: 'MÓDULO',
    mensaje: 'MÓDULO :: Mensaje para el cliente',
    metadata: { algun: 'metadato' },
  })

  const fourthEntry = logFile.getEntry(zeroLine + 4)
  expect(fourthEntry).toMatchObject({
    level: 20,
    levelText: 'debug',
    modulo: 'OTRO MÓDULO',
    mensaje: 'OTRO MÓDULO :: Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
  })
}
