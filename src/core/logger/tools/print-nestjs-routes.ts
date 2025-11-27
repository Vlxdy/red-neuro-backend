import { INestApplication } from '@nestjs/common'
import { _printRoutes } from './print-routes'

export function printNestJSRoutes(app: INestApplication) {
  const container = (app as any).container
  const modules = container.getModules()
  _printRoutes(modules)
}
