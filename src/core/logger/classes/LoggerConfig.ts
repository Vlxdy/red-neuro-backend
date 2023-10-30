import pino, { Level, multistream } from 'pino'
import { getStream } from 'file-stream-rotator'
import path from 'path'
import { FileParams, LoggerParams } from '../types'
import { LokiOptions } from 'pino-loki'
import { DEFAULT_SENSITIVE_PARAMS, LOG_LEVEL } from '../constants'
import fs from 'fs'
import zlib from 'zlib'

export class LoggerConfig {
  static getMainStream(loggerParams: LoggerParams): pino.MultiStreamRes {
    const basicLevels: Level[] = Object.keys(LOG_LEVEL).map(
      (key) => LOG_LEVEL[key]
    )
    const streamDisk: pino.StreamEntry[] = loggerParams.fileParams
      ? LoggerConfig.fileStream(
          loggerParams.fileParams,
          loggerParams.appName,
          basicLevels,
          {}
        )
      : []
    const lokiStream = LoggerConfig.lokiStream(loggerParams)
    return multistream([...streamDisk, ...lokiStream], { dedupe: true })
  }

  static getAuditStream(loggerParams: LoggerParams): pino.MultiStreamRes {
    const streamDisk: pino.StreamEntry[] = loggerParams.fileParams
      ? LoggerConfig.fileStream(
          loggerParams.fileParams,
          loggerParams.appName,
          [],
          LoggerConfig.getCustomLevels(loggerParams)
        )
      : []
    const lokiStream = LoggerConfig.lokiStream(loggerParams)
    return multistream([...streamDisk, ...lokiStream], { dedupe: true })
  }

  private static getCustomLevels(loggerParams: LoggerParams) {
    const customLevels: { [key: string]: number } = {}
    loggerParams._audit.forEach((ctx, index) => {
      customLevels[ctx] = index + 100
    })
    return customLevels
  }

  private static fileStream(
    fileParams: FileParams,
    appName: string,
    basicLevels: Level[],
    auditLevels: { [key: string]: number }
  ): pino.StreamEntry[] {
    const streamDisk: pino.StreamEntry[] = []

    const auditFile = path.resolve(fileParams.path, appName, 'audit.json')

    const buildStream = (filename: string) => {
      const stream = getStream({
        filename,
        frequency: 'date',
        date_format: fileParams.rotateInterval,
        size: fileParams.size,
        audit_file: auditFile,
        extension: '.log',
        max_logs: '365d',
        create_symlink: true,
        symlink_name: filename + '.current.log',
      })
      stream.on('error', (e) => {
        if (!e.message.includes('no such file or directory, rename')) {
          console.error('Error con el rotado de logs', e)
        }
      })

      // stream.on('rotate', (oldFile: string, newFile: string) // en caso de necesitar alguna operación con el nuevo archivo

      stream.on('rotate', (oldFile: string) => {
        const gzip = zlib.createGzip()
        const input = fs.createReadStream(oldFile)
        const output = fs.createWriteStream(oldFile + '.gz')
        input.pipe(gzip).pipe(output)
        output.on('error', (e) => {
          console.error('Error al comprimir el archivo:', e)
        })
        output.on('finish', () => {
          setTimeout(() => fs.unlink(oldFile, () => ({})), 60000)
        })
      })
      return stream
    }

    // FOR BASIC LOG
    for (const level of basicLevels) {
      const basicLevel: Level = LOG_LEVEL[level.toUpperCase()]
      if (!basicLevel) continue

      const filename = path.resolve(
        fileParams.path,
        appName,
        `${basicLevel}.log`
      )
      streamDisk.push({
        stream: buildStream(filename),
        level: basicLevel,
      })
    }

    // FOR AUDIT LOG
    for (const level of Object.keys(auditLevels)) {
      const levelNumber = auditLevels[level]
      if (!levelNumber) continue

      const filename = path.resolve(
        fileParams.path,
        appName,
        `audit_${level}.log`
      )
      streamDisk.push({
        stream: buildStream(filename),
        level: auditLevels[level] as any,
      })
    }

    return streamDisk
  }

  private static lokiStream(loggerParams: LoggerParams): pino.StreamEntry[] {
    const lokiStream: pino.StreamEntry[] = []
    if (loggerParams.lokiParams) {
      lokiStream.push({
        level: 'trace',
        stream: pino.transport<LokiOptions>({
          target: 'pino-loki',
          options: {
            batching:
              typeof loggerParams.lokiParams.batching !== 'undefined' &&
              loggerParams.lokiParams.batching === 'true',
            interval: Number(loggerParams.lokiParams.batchInterval),
            labels: { application: loggerParams.appName },
            host: loggerParams.lokiParams.url,
            basicAuth:
              loggerParams.lokiParams.username &&
              loggerParams.lokiParams.password
                ? {
                    username: loggerParams.lokiParams.username,
                    password: loggerParams.lokiParams.password,
                  }
                : undefined,
          },
        }),
      })
    }
    return lokiStream
  }

  static getRedactOptions(loggerParams: LoggerParams) {
    const customPaths = loggerParams.hide ? loggerParams.hide.split(' ') : []
    return {
      paths: customPaths.concat(DEFAULT_SENSITIVE_PARAMS),
      censor: '*****',
    }
  }

  static getMainConfig(loggerParams: LoggerParams) {
    return {
      level: loggerParams.level,
      redact: LoggerConfig.getRedactOptions(loggerParams),
      base: null,
    }
  }

  static getAuditConfig(loggerParams: LoggerParams) {
    const customLevels = LoggerConfig.getCustomLevels(loggerParams)
    const customLevelsKeys = Object.keys(customLevels)
    const firstLevel =
      customLevelsKeys.length > 0 ? customLevelsKeys[0] : undefined

    return {
      level: firstLevel,
      redact: LoggerConfig.getRedactOptions(loggerParams),
      base: null,
      useOnlyCustomLevels: true,
      customLevels,
    }
  }
}
