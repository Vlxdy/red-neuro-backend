import { INestApplication } from '@nestjs/common'
import { ModulesContainer } from '@nestjs/core'
import { _printRoutes } from './print-routes'

export function printNestJSRoutes(app: INestApplication) {
  const modules = app.get(ModulesContainer)
  _printRoutes(modules)
}
