import { LogEntry, LoggerService } from '../../../../logger'
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
    reqId: '',
    caller: 'printInfo.ts:7:10',
    levelText: 'info',
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
    level: 30,
    levelText: 'info',
    modulo: '',
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato' },
  })

  const thirdEntry = logFile.getEntry(zeroLine + 3)
  expect(thirdEntry).toMatchObject({
    level: 30,
    levelText: 'info',
    modulo: 'MÓDULO',
    mensaje: 'MÓDULO :: Mensaje para el cliente',
    metadata: { algun: 'metadato' },
  })

  const fourthEntry = logFile.getEntry(zeroLine + 4)
  expect(fourthEntry).toMatchObject({
    level: 30,
    levelText: 'info',
    modulo: 'OTRO MÓDULO',
    mensaje: 'OTRO MÓDULO :: Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
  })
}
