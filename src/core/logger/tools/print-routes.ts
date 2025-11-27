import { RequestMethod } from '@nestjs/common'
import { COLOR } from '@/core/logger/constants'
import { stdoutWrite } from '@/core/logger/tools'

export function _printRoutes(modules: any) {
  stdoutWrite('\n')

  let found = false

  modules.forEach((moduleRef: any) => {
    const moduleName = moduleRef.metatype?.name ?? 'UnknownModule'
    const controllers = moduleRef.controllers

    controllers.forEach((wrapper: any) => {
      const controller = wrapper.instance
      if (!controller) return

      const controllerPath =
        Reflect.getMetadata('path', controller.constructor) || ''

      const proto = Object.getPrototypeOf(controller)

      const methods = Object.getOwnPropertyNames(proto).filter(
        (m) =>
          m !== 'constructor' && Reflect.getMetadataKeys(proto[m]).length > 0
      )

      methods.forEach((methodName) => {
        const handler = proto[methodName]

        const subPath = Reflect.getMetadata('path', handler) || ''

        const requestMethod = Reflect.getMetadata('method', handler)

        if (requestMethod === undefined) return

        const method = RequestMethod[requestMethod].toUpperCase()

        const fullPath = `/${controllerPath}/${subPath}`
          .replace(/\/+/g, '/')
          .replace(/\/$/, '')

        // ===== PRINT ROUTE =====
        const colorMethod = getColor(method) + method.padEnd(7, ' ')
        const msg =
          `${COLOR.LIGHT_GREY} - ${colorMethod}` +
          `${COLOR.CYAN} ${fullPath}` +
          `${COLOR.MAGENTA}   (${moduleName})`

        stdoutWrite(msg + '\n')
        found = true
      })
    })
  })

  if (!found) {
    stdoutWrite(
      `\n[printRoutes] ${COLOR.YELLOW}warn:${COLOR.RESET} no se encontraron rutas\n`
    )
  }

  stdoutWrite(COLOR.RESET + '\n')
}

// === Helpers ===
function getColor(method: string) {
  if (method === 'GET') return COLOR.GREEN
  if (method === 'POST') return COLOR.YELLOW
  if (method === 'PUT') return COLOR.CYAN
  if (method === 'PATCH') return COLOR.CYAN
  if (method === 'DELETE') return COLOR.RED
  return COLOR.RESET
}
