import { Module } from '@nestjs/common'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import { LoggerConfig } from './logger.config'
import { LoggerService } from './logger.service'

// const subfolderPath = String(process.pid)
const subfolderPath = ''

@Module({
  exports: [LoggerService],
  providers: [LoggerService],
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: [
        LoggerConfig.getPinoHttpConfig(),
        LoggerConfig.getStream(subfolderPath),
      ],
    }),
  ],
})
export class LoggerModule {}
