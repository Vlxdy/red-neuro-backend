import { AppController } from './app.controller'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter'
import { ScheduleModule } from '@nestjs/schedule'
import { CoreModule } from '@/core/core.module'
import { ApplicationModule } from './application/application.module'
import { LoggerMiddleware } from '@/common/middlewares'
import { LoggerModule } from '@/core/logger'
import packageJson from '../package.json'
import { AppInterceptor } from '@/common/interceptors'

import dotenv from 'dotenv'
dotenv.config()

const loggingEnabled = String(process.env.LOG_ENABLED) === 'true'
const logToConsoleEnabled = String(process.env.LOG_CONSOLE) === 'true'
const logToFileEnabled = String(process.env.LOG_FILE_ENABLED) === 'true'
const logToLokiEnabled = String(process.env.LOG_LOKI_ENABLED) === 'true'

@Module({
  imports: [
    LoggerModule.forRoot({
      enabled: loggingEnabled,
      console: logToConsoleEnabled,
      appName: packageJson.name,
      level: process.env.LOG_LEVEL,
      hide: '', // para ofuscar datos sensibles (Ej: hide = 'pin cvv bank_account')
      audit: process.env.LOG_AUDIT,
      fileParams:
        loggingEnabled && logToFileEnabled
          ? {
              path: process.env.LOG_FILE_PATH,
              size: process.env.LOG_FILE_SIZE,
              rotateInterval: process.env.LOG_FILE_INTERVAL,
            }
          : undefined,
      lokiParams:
        loggingEnabled && logToLokiEnabled
          ? {
              url: process.env.LOG_LOKI_URL,
              username: process.env.LOG_LOKI_USERNAME,
              password: process.env.LOG_LOKI_PASSWORD,
              batching: String(process.env.LOG_LOKI_BATCHING) === 'true',
              batchInterval: Number(process.env.LOG_LOKI_BATCH_INTERVAL),
            }
          : undefined,
    }),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CoreModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
