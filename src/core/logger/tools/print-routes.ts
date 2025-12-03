import { RequestMethod, Type } from '@nestjs/common'
import { ModulesContainer } from '@nestjs/core'
import { COLOR } from '@/core/logger/constants'
import { stdoutWrite } from '@/core/logger/tools'

export function _printRoutes(modules: ModulesContainer) {
  stdoutWrite('\n')

  let found = false

  for (const moduleRef of modules.values()) {
    const moduleName = moduleRef.metatype?.name ?? 'UnknownModule'

    for (const wrapper of moduleRef.controllers.values()) {
      const controller = wrapper.instance
      if (!controller) continue

      const controllerPath =
        Reflect.getMetadata('path', controller.constructor as Type<unknown>) ||
        ''

      const proto = Object.getPrototypeOf(controller)

      const methods = Object.getOwnPropertyNames(proto).filter(
        (m) =>
          m !== 'constructor' && Reflect.getMetadataKeys(proto[m]).length > 0
      )

      for (const methodName of methods) {
        const handler = proto[methodName]

        const subPath: string = Reflect.getMetadata('path', handler) || ''

        const requestMethod: RequestMethod | undefined = Reflect.getMetadata(
          'method',
          handler
        )

        if (requestMethod === undefined) continue

        const method = RequestMethod[requestMethod].toUpperCase()

        const fullPath = `/${controllerPath}/${subPath}`
          .replace(/\/+/g, '/')
          .replace(/\/$/, '')

        const colorMethod = getColor(method) + method.padEnd(7, ' ')
        const msg =
          `${COLOR.LIGHT_GREY} - ${colorMethod}` +
          `${COLOR.CYAN} ${fullPath}` +
          `${COLOR.MAGENTA}   (${moduleName})`

        stdoutWrite(msg + '\n')
        found = true
      }
    }
  }

  if (!found) {
    stdoutWrite(
      `\n[printRoutes] ${COLOR.YELLOW}warn:${COLOR.RESET} no se encontraron rutas\n`
    )
  }

  stdoutWrite(COLOR.RESET + '\n')
}

// === Helpers ===
function getColor(method: string) {
  switch (method) {
    case 'GET':
      return COLOR.GREEN
    case 'POST':
      return COLOR.YELLOW
    case 'PUT':
    case 'PATCH':
      return COLOR.CYAN
    case 'DELETE':
      return COLOR.RED
    default:
      return COLOR.RESET
  }
}
