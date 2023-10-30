import { COLOR } from '../constants'
import { LoggerService } from '../classes'
import { stdoutWrite } from '../tools'
import { AppInfo } from '../types'
import { getIPAddress } from '../utilities'
import dayjs from 'dayjs'

export function printInfo(appInfo: AppInfo) {
  const logger = LoggerService.getInstance()

  const appName = appInfo.name
  const appVersion = appInfo.version
  const nodeEnv = appInfo.env
  const port = appInfo.port
  const appLocalUrl = `http://localhost:${port}`
  const appNetworkUrl = `http://${getIPAddress()}:${port}`
  const pid = process.pid
  const now = dayjs().format('DD/MM/YYYY HH:mm:ss:SSS')

  logger.auditInfo('application', {
    mensaje: 'Servicio desplegado',
    metadata: {
      app: appName,
      version: appVersion,
      entorno: nodeEnv,
      urlLocal: appLocalUrl,
      urlRed: appNetworkUrl,
      fecha: now,
    },
    formato: `🚀 ${appName} ${appVersion}`,
  })

  const serviceInfo = `
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} Proceso     : ${COLOR.GREEN}${pid}
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} Fecha       : ${COLOR.GREEN}${now}
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} Servicio    : ${COLOR.GREEN}Activo
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} Entorno     : ${COLOR.GREEN}${nodeEnv}
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} URL (local) : ${COLOR.GREEN}${appLocalUrl}
 ${COLOR.LIGHT_GREY}-${COLOR.RESET} URL (red)   : ${COLOR.GREEN}${appNetworkUrl}
  `
  stdoutWrite(serviceInfo)
  stdoutWrite(`${COLOR.RESET}\n`)
}
