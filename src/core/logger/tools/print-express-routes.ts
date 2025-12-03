import { INestApplication } from '@nestjs/common'
import { _printRoutes } from './print-routes'

export function printNestRoutes(app: INestApplication) {
  const modules = app.getHttpAdapter().getInstance().container.getModules()
  _printRoutes(modules)
}
