import { _printRoutes } from './print-routes'
import { Express } from 'express'

export function printExpressRoutes(app: Express) {
  _printRoutes(app)
}
