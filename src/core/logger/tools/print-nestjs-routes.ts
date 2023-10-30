import { INestApplication } from '@nestjs/common'
import { _printRoutes } from './print-routes'

export function printNestJSRoutes(app: INestApplication) {
  _printRoutes(app.getHttpServer()._events.request._router).finally(() => ({}))
}
