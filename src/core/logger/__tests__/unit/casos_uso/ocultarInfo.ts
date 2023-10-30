import { LogEntry, LoggerService } from '../../..'
import { delay, readLogFile } from '../../utils'

const logger = LoggerService.getInstance()

export async function ocultarInfo() {
  const data = {
    some: 'value',
    token: 'abc123',
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1.eyJzdWI.jAHI9Q_CwSKhl6d_9rhM3N',
    },
    refreshToken:
      'eyJhbGciOiJIUz.I6IkpvaG4gRG9lIiwiYWR.HI9Q_CwSKhl6d_9rhM3NrXu',
    datos_sensibles: {
      contrasena: 'contrasena',
      password: 'password',
      authorization: 'authorization',
      cookie: 'cookie',
      token: 'token',
      access_token: 'access_token',
      idToken: 'idToken',
      accesstoken: 'accesstoken',
      refreshtoken: 'refreshtoken',
      refresh_token: 'refresh_token',
    },
    DatosSensibles: {
      Contrasena: 'Contrasena',
      Password: 'Password',
      Authorization: 'Authorization',
      Cookie: 'Cookie',
      Token: 'Token',
      Access_Token: 'Access_Token',
      IdToken: 'IdToken',
      AccessToken: 'AccessToken',
      RefreshToken: 'RefreshToken',
      Refresh_Token: 'Refresh_Token',
    },
    response: {
      finalizo: true,
      mensaje: 'GET /api/users X (Bearer eyJhbGciOiJI.eyJzdWIi.VjAHI9Q_CwSKh)',
      fecha: Date.now(),
      secret: 'some secret Bearer abc.xyz.123 value',
    },
  }

  logger.info(data)
  await delay()

  const zeroLine = 4
  const logFile = readLogFile<LogEntry>('info.log')
  expect(logFile.getValue(zeroLine + 1)).toHaveLength(1)

  const firstEntry = logFile.getEntry(zeroLine + 1)
  expect(firstEntry).toMatchObject({
    level: 30,
  })
  expect(firstEntry).toHaveProperty('time')
  expect(firstEntry).toHaveProperty('pid')
  expect(firstEntry).toHaveProperty('fecha')
  expect(firstEntry).toHaveProperty('metadata')
  expect(firstEntry.metadata).toHaveProperty('0')
  const metadata0 = (firstEntry.metadata ? firstEntry.metadata['0'] : {}) as any
  expect(metadata0).toMatchObject({
    some: 'value',
    token: '*****',
    headers: { authorization: '*****' },
    refreshToken: '*****',
    datos_sensibles: {
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
    },
    DatosSensibles: {
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
    },
  })
  expect(metadata0).toHaveProperty('response')
  expect(metadata0.response).toMatchObject({
    finalizo: true,
    mensaje: 'GET /api/users X (Bearer *****)',
    secret: 'some secret Bearer ***** value',
  })
}
