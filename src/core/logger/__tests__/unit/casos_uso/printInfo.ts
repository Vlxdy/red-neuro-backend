import { LogEntry, LoggerService } from '../../..'
import { delay, readLogFile } from '../../utils'

const logger = LoggerService.getInstance()

export async function printInfo() {
  logger.info('Mensaje para el cliente')
  logger.info('Mensaje para el cliente', { algun: 'metadato' })
  logger.info('Mensaje para el cliente', { algun: 'metadato' }, 'MÓDULO')
  logger.info({
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
    modulo: 'OTRO MÓDULO',
  })
  await delay()

  const zeroLine = 0
  const logFile = readLogFile<LogEntry>('info.log')
  expect(logFile.getValue(zeroLine + 1)).toHaveLength(4)

  const firstEntry = logFile.getEntry(zeroLine + 1)
  expect(firstEntry).toMatchObject({
    level: 30,
  })
  expect(firstEntry).toHaveProperty('time')
  expect(firstEntry).toHaveProperty('pid')
  expect(firstEntry).toHaveProperty('fecha')
  expect(firstEntry).toHaveProperty('metadata')
  expect(firstEntry.metadata).toHaveProperty('0', 'Mensaje para el cliente')

  const secondEntry = logFile.getEntry(zeroLine + 2)
  expect(secondEntry).toMatchObject({
    level: 30,
  })
  expect(secondEntry).toHaveProperty('metadata')
  expect(secondEntry.metadata).toHaveProperty('0', 'Mensaje para el cliente')
  expect(secondEntry.metadata).toHaveProperty('1', { algun: 'metadato' })

  const thirdEntry = logFile.getEntry(zeroLine + 3)
  expect(thirdEntry).toMatchObject({
    level: 30,
  })
  expect(thirdEntry).toHaveProperty('metadata')
  expect(thirdEntry.metadata).toHaveProperty('0', 'Mensaje para el cliente')
  expect(thirdEntry.metadata).toHaveProperty('1', { algun: 'metadato' })
  expect(thirdEntry.metadata).toHaveProperty('2', 'MÓDULO')

  const fourthEntry = logFile.getEntry(zeroLine + 4)
  expect(fourthEntry).toMatchObject({
    level: 30,
  })
  expect(fourthEntry).toHaveProperty('metadata')
  expect(fourthEntry.metadata).toHaveProperty('0', {
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
    modulo: 'OTRO MÓDULO',
  })
}
