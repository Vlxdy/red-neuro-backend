import { LogEntry, LoggerService } from '../../..'
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
  logger.warn({ otro: 'objeto' }, 'otro mensaje')
  await delay()

  const zeroLine = 0
  const logFile = await readLogFile<LogEntry>('warn.log')
  expect(logFile.getValue(zeroLine + 1)).toHaveLength(5)

  const firstEntry = logFile.getEntry(zeroLine + 1)
  expect(firstEntry).toMatchObject({
    level: 40,
    context: 'warn',
  })
  expect(firstEntry).toHaveProperty('time')
  expect(firstEntry).toHaveProperty('pid')
  expect(firstEntry).toHaveProperty('fecha')
  expect(firstEntry).toHaveProperty('mensaje', 'Mensaje para el cliente')

  const secondEntry = logFile.getEntry(zeroLine + 2)
  expect(secondEntry).toMatchObject({
    level: 40,
    context: 'warn',
  })
  expect(firstEntry).toHaveProperty('mensaje', 'Mensaje para el cliente')
  expect(secondEntry).toHaveProperty('metadata')
  expect(secondEntry.metadata).toHaveProperty('0', { algun: 'metadato' })

  const thirdEntry = logFile.getEntry(zeroLine + 3)
  expect(thirdEntry).toMatchObject({
    level: 40,
    context: 'warn',
  })
  expect(firstEntry).toHaveProperty('mensaje', 'Mensaje para el cliente')
  expect(thirdEntry).toHaveProperty('metadata')
  expect(thirdEntry.metadata).toHaveProperty('0', { algun: 'metadato' })
  expect(thirdEntry.metadata).toHaveProperty('1', 'MÓDULO')

  const fourthEntry = logFile.getEntry(zeroLine + 4)
  expect(fourthEntry).toMatchObject({
    level: 40,
    context: 'warn',
  })
  expect(fourthEntry).toHaveProperty('metadata')
  expect(fourthEntry.metadata).toHaveProperty('0', {
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
    modulo: 'OTRO MÓDULO',
  })

  const fifthEntry = logFile.getEntry(zeroLine + 5)
  expect(fifthEntry).toMatchObject({
    level: 40,
    context: 'warn',
  })
  expect(fifthEntry).toHaveProperty('time')
  expect(fifthEntry).toHaveProperty('pid')
  expect(fifthEntry).toHaveProperty('fecha')
  expect(fifthEntry).toHaveProperty('metadata')
  expect(fifthEntry.metadata).toHaveProperty('0', {
    otro: 'objeto',
  })
  expect(fifthEntry.metadata).toHaveProperty('1', 'otro mensaje')
}
