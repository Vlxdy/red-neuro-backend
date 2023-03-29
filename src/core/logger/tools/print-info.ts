import { INestApplication } from '@nestjs/common'
import { COLOR } from '../constants'
import packageJson from '../../../../package.json'
import ip from 'ip'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../logger.service'
import { stdoutWrite } from './util'

const logger = LoggerService.getInstance()

export async function printInfo(app: INestApplication) {
  const configService = app.get(ConfigService)

  const appName = packageJson.name
  const appVersion = packageJson.version
  const nodeEnv = configService.get('NODE_ENV')
  const port = configService.get('PORT')
  const appLocalUrl = `http://localhost:${port}`
  const appNetworkUrl = `http://${ip.address()}:${port}`

  logger.info(`${appName} v${appVersion}`)

  const serviceInfo = `
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} Servicio    : ${COLOR.GREEN}Activo
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} Entorno     : ${COLOR.GREEN}${nodeEnv}
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} URL (local) : ${COLOR.GREEN}${appLocalUrl}
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} URL (red)   : ${COLOR.GREEN}${appNetworkUrl}
  `
  stdoutWrite(serviceInfo)
  stdoutWrite(`${COLOR.RESET}\n`)
}
