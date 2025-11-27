import { LogEntry, LoggerService } from '../../..'
import { delay, readLogFile } from '../../utils'

const logger = LoggerService.getInstance()

export async function printAudit() {
  logger.audit('application', 'Mensaje para el cliente')
  logger.audit('application', 'Mensaje para el cliente', { algun: 'metadato' })
  logger.audit('application', {
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
  })
  await delay()

  const zeroLine = 0
  const logFile = await readLogFile<LogEntry>('audit_application.log')
  expect(logFile.getValue(zeroLine + 1)).toHaveLength(3)

  const firstEntry = logFile.getEntry(zeroLine + 1)
  expect(firstEntry).toMatchObject({
    level: 100,
    context: 'application',
  })
  expect(firstEntry).toHaveProperty('time')
  expect(firstEntry).toHaveProperty('pid')
  expect(firstEntry).toHaveProperty('fecha')
  expect(firstEntry).toHaveProperty('msg', 'Mensaje para el cliente')

  const secondEntry = logFile.getEntry(zeroLine + 2)
  expect(secondEntry).toMatchObject({
    level: 100,
    context: 'application',
  })
  expect(secondEntry).toHaveProperty('msg', 'Mensaje para el cliente')
  expect(secondEntry).toHaveProperty('algun', 'metadato')

  const thirdEntry = logFile.getEntry(zeroLine + 3)
  expect(thirdEntry).toMatchObject({
    level: 100,
    context: 'application',
  })
  expect(thirdEntry).toHaveProperty('msg', 'Mensaje para el cliente')
  expect(thirdEntry).toHaveProperty('algun', 'metadato')
  expect(thirdEntry).toHaveProperty('adicional', 'clave:valor')
}
