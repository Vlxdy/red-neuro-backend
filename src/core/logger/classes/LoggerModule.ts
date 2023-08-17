import { DynamicModule, INestApplication, Module } from '@nestjs/common'
import { LoggerService } from './LoggerService'
import { LoggerOptions } from '../types'
import { expressMiddleware } from 'cls-rtracer'

@Module({})
export class LoggerModule {
  static forRoot(options: LoggerOptions = {}): DynamicModule {
    LoggerService.initialize(options)

    const loggerParams = LoggerService.getLoggerParams()
    if (!loggerParams) throw new Error('LoggerService no ha sido inicializado')

    return {
      module: LoggerModule,
      providers: [LoggerService],
      exports: [LoggerService],
      imports: [],
    }
  }

  static async initialize(app: INestApplication) {
    app.use(expressMiddleware())
  }
}
