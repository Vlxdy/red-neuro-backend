import { LogEntry, LoggerService } from '../../..'
import { delay, readLogFile } from '../../utils'
import { objetoConDatosSensibles } from './ocultarInfo'

const logger = LoggerService.getInstance()

export async function ocultarAudit() {
  logger.audit('application', { metadata: objetoConDatosSensibles })
  await delay()

  const zeroLine = 3
  const logFile = await readLogFile<LogEntry>('audit_application.log')
  expect(logFile.getValue(zeroLine + 1)).toHaveLength(1)

  const firstEntry = logFile.getEntry(zeroLine + 1)
  expect(firstEntry).toMatchObject({
    level: 100,
  })
  expect(firstEntry).toHaveProperty('time')
  expect(firstEntry).toHaveProperty('pid')
  expect(firstEntry).toHaveProperty('fecha')
  expect(firstEntry).toHaveProperty('some', objetoConDatosSensibles.some)
  expect(firstEntry).toHaveProperty('token', '*****')
  expect(firstEntry).toHaveProperty('headers', {
    authorization: '*****',
  })
  expect(firstEntry).toHaveProperty('refreshToken', '*****')
  expect(firstEntry).toHaveProperty('datos_sensibles', {
    contrasena: '*****',
    password: '*****',
    authorization: '*****',
    cookie: '*****',
    token: '*****',
    access_token: '*****',
    idToken: '*****',
    accesstoken: '*****',
    refreshtoken: '*****',
    refresh_token: '*****',
  })
  expect(firstEntry).toHaveProperty('DatosSensibles', {
    Contrasena: '*****',
    Password: '*****',
    Authorization: '*****',
    Cookie: '*****',
    Token: '*****',
    Access_Token: '*****',
    IdToken: '*****',
    AccessToken: '*****',
    RefreshToken: '*****',
    Refresh_Token: '*****',
  })
  expect(firstEntry).toHaveProperty('supersecretword', '*****')
}
