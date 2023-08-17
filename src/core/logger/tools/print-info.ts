import { COLOR } from '../constants'
import { LoggerService } from '../classes'
import { stdoutWrite } from '../tools'
import { AppInfo } from '../types'
import { getIPAddress } from '../utilities'

export function printInfo(appInfo: AppInfo) {
  const logger = LoggerService.getInstance()

  const appName = appInfo.name
  const appVersion = appInfo.version
  const nodeEnv = appInfo.env
  const port = appInfo.port
  const appLocalUrl = `http://localhost:${port}`
  const appNetworkUrl = `http://${getIPAddress()}:${port}`

  logger.auditInfo('application', {
    mensaje: 'Servicio desplegado',
    metadata: {
      app: appName,
      version: appVersion,
    },
    formato: `🚀 ${appName} ${appVersion}`,
  })

  const serviceInfo = `
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} Servicio    : ${COLOR.GREEN}Activo
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} Entorno     : ${COLOR.GREEN}${nodeEnv}
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} URL (local) : ${COLOR.GREEN}${appLocalUrl}
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} URL (red)   : ${COLOR.GREEN}${appNetworkUrl}
  `
  stdoutWrite(serviceInfo)
  stdoutWrite(`${COLOR.RESET}\n`)
}
