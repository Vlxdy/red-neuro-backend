import * as rTracer from 'cls-rtracer'
import { GenReqId, Options, ReqId } from 'pino-http'
import { createWriteStream } from 'pino-http-send'
import pino, { Level, multistream } from 'pino'
import { IncomingMessage, ServerResponse } from 'http'
import { createStream, Options as RotateOptions } from 'rotating-file-stream'
import { Request, Response } from 'express'
import packageJson from '../../../package.json'
import path from 'path'
import dotenv from 'dotenv'
import { LOG_LEVEL } from './constants'

dotenv.config()

export class LoggerConfig {
  static appName = packageJson.name || 'APP'
  static logLevelSelected: Level[] = []

  static getStream(subFolderName = ''): pino.MultiStreamRes {
    const streamDisk: pino.StreamEntry[] = []
    if (process.env.LOG_PATH && process.env.LOG_PATH.length > 0) {
      const options: RotateOptions = {
        size: process.env.LOG_SIZE || '5M',
        path: path.resolve(
          process.env.LOG_PATH,
          subFolderName,
          LoggerConfig.appName
        ),
        interval: process.env.LOG_INTERVAL || '1d',
      }

      if (process.env.LOG_COMPRESS && process.env.LOG_COMPRESS === 'true') {
        options.compress = true
      }

      const levelSelected = process.env.LOG_LEVEL || 'info'
      for (const levelKey of Object.keys(LOG_LEVEL)) {
        const level = LOG_LEVEL[levelKey]
        streamDisk.push({
          stream: createStream(`${level}.log`, options),
          level,
        })
        LoggerConfig.logLevelSelected.push(level)
        if (level === levelSelected) {
          break
        }
      }
    }
    const streamHttp: any[] = []
    if (
      process.env.LOG_URL &&
      process.env.LOG_URL.length > 0 &&
      process.env.LOG_URL_TOKEN
    ) {
      streamHttp.push(
        createWriteStream({
          url: process.env.LOG_URL,
          headers: {
            Authorization: process.env.LOG_URL_TOKEN,
          },
          batchSize: 1,
        })
      )
    }

    return multistream([...streamDisk, ...streamHttp])
  }

  static getLoggerConfig() {
    return {
      pinoHttp: this.getPinoHttpConfig(),
    }
  }

  static customSuccessMessage(req: Request, res: Response) {
    return `Petición concluida - ${res.statusCode}`
  }

  static customErrorMessage(req: Request, res: Response) {
    return `Petición concluida - ${res.statusCode}`
  }

  static customLogLevel(req: IncomingMessage, res: ServerResponse, err: Error) {
    return LoggerConfig.getLogLevel(res.statusCode, err)
  }

  static getLogLevel(statusCode: number, err?: Error) {
    if (statusCode >= 200 && statusCode < 400) return 'info'
    if (statusCode >= 400 && statusCode < 500) return 'warn'
    if (statusCode >= 500) return 'error'
    if (err) return 'error'
    return 'info'
  }

  static redactOptions() {
    return {
      paths: process.env.LOG_HIDE ? process.env.LOG_HIDE.split(' ') : [],
      censor: '*****',
    }
  }

  static genReqId: GenReqId = (req: Request) => {
    return (req.id || rTracer.id()) as ReqId
  }

  static getPinoHttpConfig(): Options {
    return {
      name: LoggerConfig.appName,
      genReqId: LoggerConfig.genReqId,
      serializers: {
        err: () => {
          return
        },
        req: (req) => {
          return {
            id: req.id,
            method: req.method,
            url: req.url ? req.url.split('?')[0] : undefined,
          }
        },
        res: (res) => {
          return { statusCode: res.statusCode }
        },
      },
      formatters: undefined,
      level: 'trace',
      timestamp: pino.stdTimeFunctions.isoTime,
      customLogLevel: this.customLogLevel,
      customSuccessMessage: this.customSuccessMessage,
      customErrorMessage: this.customErrorMessage,
      customAttributeKeys: {
        req: `request`,
        res: `response`,
        err: `error`,
        responseTime: `response time [ms]`,
      },
      redact: LoggerConfig.redactOptions(),
    }
  }
}
