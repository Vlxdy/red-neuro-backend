import { BaseException, LogEntry, LoggerService } from '../../..'
import { delay, readLogFile } from '../../utils'

const logger = LoggerService.getInstance()

export async function printError() {
  const err = new Error('<<< BOOM >>>')

  logger.error(new BaseException(err))
  logger.error(
    new BaseException(err, {
      mensaje: 'Mensaje para el cliente',
    })
  )
  logger.error(
    new BaseException(err, {
      mensaje: 'Mensaje para el cliente',
      metadata: { algun: 'metadato' },
    })
  )
  logger.error(
    new BaseException(err, {
      mensaje: 'Mensaje para el cliente',
      metadata: { algun: 'metadato' },
      modulo: 'MÓDULO',
    })
  )
  logger.error(
    new BaseException(err, {
      mensaje: 'Mensaje para el cliente',
      metadata: { algun: 'metadato', adicional: 'clave:valor' },
      modulo: 'OTRO MÓDULO',
    })
  )
  await delay()

  const zeroLine = 0
  const logFile = readLogFile<LogEntry>('error.log')
  expect(logFile.getValue(zeroLine + 1)).toHaveLength(5)

  const firstEntry = logFile.getEntry(zeroLine + 1)
  expect(firstEntry).toMatchObject({
    level: 50,
    levelText: 'error',
    modulo: '',
    mensaje: 'Error Interno (E01)',
    httpStatus: 500,
    codigo: 'ERROR DESCONOCIDO (E01)',
    causa: 'Error: <<< BOOM >>>',
    accion: '',
  })
  expect(firstEntry).toHaveProperty('time')
  expect(firstEntry).toHaveProperty('pid')
  expect(firstEntry).toHaveProperty('hostname')
  expect(firstEntry).toHaveProperty('fecha')
  expect(firstEntry).toHaveProperty('origen')
  expect(firstEntry.origen).toContain('printError.ts')
  expect(firstEntry).toHaveProperty('formato')
  expect(firstEntry).toHaveProperty('errorStack')

  const secondEntry = logFile.getEntry(zeroLine + 2)
  expect(secondEntry).toMatchObject({
    level: 50,
    levelText: 'error',
    modulo: '',
    mensaje: 'Mensaje para el cliente',
  })

  const thirdEntry = logFile.getEntry(zeroLine + 3)
  expect(thirdEntry).toMatchObject({
    level: 50,
    levelText: 'error',
    modulo: '',
    mensaje: 'Mensaje para el cliente',
    metadata: { algun: 'metadato' },
  })

  const fourthEntry = logFile.getEntry(zeroLine + 4)
  expect(fourthEntry).toMatchObject({
    level: 50,
    levelText: 'error',
    modulo: 'MÓDULO',
    mensaje: 'MÓDULO :: Mensaje para el cliente',
    metadata: { algun: 'metadato' },
  })

  const fifthEntry = logFile.getEntry(zeroLine + 5)
  expect(fifthEntry).toMatchObject({
    level: 50,
    levelText: 'error',
    modulo: 'OTRO MÓDULO',
    mensaje: 'OTRO MÓDULO :: Mensaje para el cliente',
    metadata: { algun: 'metadato', adicional: 'clave:valor' },
  })
}
