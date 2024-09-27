import pino, { Level, multistream } from 'pino'
import { getStream } from 'file-stream-rotator'
import path from 'path'
import { FileParams, LogData, LokiParams } from '../types'
import { LokiOptions } from 'pino-loki'
import { DEFAULT_SENSITIVE_PARAMS, LOG_LEVEL } from '../constants'
import fs from 'fs'
import pako from 'pako'
import { LoggerParams } from './LoggerParams'
import { stdoutWrite } from '../tools'

export class LoggerConfig {
  static getMainStream(loggerParams: LoggerParams): pino.MultiStreamRes {
    const basicLevels: Level[] = LoggerParams.LEVELS

    const fileStream: pino.StreamEntry[] =
      LoggerParams.LOG_FILE_ENABLED && loggerParams.fileParams
        ? LoggerConfig.fileStream(
            loggerParams.fileParams,
            loggerParams.appName,
            basicLevels,
            []
          )
        : []

    const lokiStream =
      LoggerParams.LOG_LOKI_ENABLED && loggerParams.lokiParams
        ? LoggerConfig.lokiStream(
            loggerParams.lokiParams,
            loggerParams.appName,
            basicLevels,
            []
          )
        : []

    const consoleStream = LoggerParams.LOG_CONSOLE_ENABLED
      ? LoggerConfig.consoleStream(basicLevels, [])
      : []

    return multistream([...fileStream, ...lokiStream, ...consoleStream], {
      dedupe: true,
    })
  }

  static getAuditStream(loggerParams: LoggerParams): pino.MultiStreamRes {
    const auditLevels: string[] = LoggerParams.AUDIT

    const fileStream: pino.StreamEntry[] =
      LoggerParams.LOG_FILE_ENABLED && loggerParams.fileParams
        ? LoggerConfig.fileStream(
            loggerParams.fileParams,
            loggerParams.appName,
            [],
            auditLevels
          )
        : []

    const lokiStream =
      LoggerParams.LOG_LOKI_ENABLED && loggerParams.lokiParams
        ? LoggerConfig.lokiStream(
            loggerParams.lokiParams,
            loggerParams.appName,
            [],
            auditLevels
          )
        : []

    const consoleStream = LoggerParams.LOG_CONSOLE_ENABLED
      ? LoggerConfig.consoleStream([], auditLevels)
      : []

    return multistream([...fileStream, ...lokiStream, ...consoleStream], {
      dedupe: true,
    })
  }

  private static getCustomLevels(auditLevels: string[]) {
    const customLevels: { [key: string]: number } = {}
    auditLevels.forEach((ctx, index) => {
      customLevels[ctx] = index + 100
    })
    return customLevels
  }

  private static fileStream(
    fileParams: FileParams,
    appName: string,
    basicLevelList: Level[],
    auditContextList: string[]
  ): pino.StreamEntry[] {
    const streamList: pino.StreamEntry[] = []
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

      // Interceptar datos antes de escribir en el log
      const originalWrite = stream.write.bind(stream)
      stream.write = (jsonStr) => {
        const { level, time, json } = JSON.parse(jsonStr) as LogData & {
          level: number
          time: number
        }
        const logToSave = JSON.stringify({ level, time, ...json }) + '\n'
        originalWrite(logToSave)
      }

      stream.on('error', (e) => {
        if (!e.message.includes('no such file or directory, rename')) {
          console.error('Error con el rotado de logs', e)
        }
      })
      stream.on('rotate', (oldFile) => {
        const input = fs.createReadStream(oldFile)
        const output = fs.createWriteStream(oldFile + '.gz')

        input.on('error', (error: any) => {
          console.error('Error al leer el archivo:', error)
        })

        output.on('error', (error: any) => {
          console.error('Error al escribir el archivo comprimido:', error)
        })

        input.on('data', (data: Buffer) => {
          const compressedData = pako.gzip(data.toString())
          output.write(compressedData)
        })

        input.on('end', () => {
          output.end()
          setTimeout(() => fs.unlink(oldFile, () => {}), 60000)
        })
      })
      return stream
    }

    // FOR BASIC LOG
    for (const level of basicLevelList) {
      const basicLevel: Level = LOG_LEVEL[level.toUpperCase()]
      if (!basicLevel) continue

      const filename = path.resolve(
        fileParams.path,
        appName,
        `${basicLevel}.log`
      )
      streamList.push({
        stream: buildStream(filename),
        level: basicLevel,
      })
    }

    // FOR AUDIT LOG
    const auditLevels = LoggerConfig.getCustomLevels(auditContextList)
    for (const level of Object.keys(auditLevels)) {
      const levelNumber = auditLevels[level]
      if (!levelNumber) continue

      const filename = path.resolve(
        fileParams.path,
        appName,
        `audit_${level}.log`
      )
      streamList.push({
        stream: buildStream(filename),
        level: auditLevels[level] as any,
      })
    }

    return streamList
  }

  private static lokiStream(
    lokiParams: LokiParams,
    appName: string,
    basicLevelList: Level[],
    auditContextList: string[]
  ): pino.StreamEntry[] {
    const streamList: pino.StreamEntry[] = []

    const buildStream = () => {
      const stream = pino.transport<LokiOptions>({
        target: 'pino-loki',
        options: {
          batching: lokiParams.batching,
          interval: lokiParams.batchInterval,
          labels: { application: appName },
          host: lokiParams.url,
          basicAuth:
            lokiParams.username && lokiParams.password
              ? {
                  username: lokiParams.username,
                  password: lokiParams.password,
                }
              : undefined,
          propsToLabels: ['level', 'context'],
        },
      })

      // Interceptar datos antes de escribir en el log
      const originalWrite = stream.write.bind(stream)
      stream.write = (jsonStr: string) => {
        const { level, time, json } = JSON.parse(jsonStr) as LogData & {
          level: number
          time: number
        }
        const logToSave = JSON.stringify({ level, time, ...json }) + '\n'
        originalWrite(logToSave)
      }

      return stream
    }

    // FOR BASIC LOG
    const lokiBasicStream = buildStream()
    for (const level of basicLevelList) {
      const basicLevel: Level = LOG_LEVEL[level.toUpperCase()]
      if (!basicLevel) continue

      streamList.push({
        level: basicLevel,
        stream: lokiBasicStream,
      })
    }

    // FOR AUDIT LOG
    const lokiAuditStream = buildStream()
    const auditLevels = LoggerConfig.getCustomLevels(auditContextList)
    for (const level of Object.keys(auditLevels)) {
      const levelNumber = auditLevels[level]
      if (!levelNumber) continue
      streamList.push({
        level: auditLevels[level] as any,
        stream: lokiAuditStream,
      })
    }

    return streamList
  }

  private static consoleStream(
    basicLevelList: Level[],
    auditContextList: string[]
  ) {
    const srteamList: pino.StreamEntry[] = []

    // FOR BASIC LOG
    for (const level of basicLevelList) {
      const basicLevel: Level = LOG_LEVEL[level.toUpperCase()]
      if (!basicLevel) continue
      srteamList.push({
        level: basicLevel,
        stream: {
          write: (jsonStr: string) => {
            const { str } = JSON.parse(jsonStr) as LogData
            if (!str) return
            stdoutWrite(str)
          },
        },
      })
    }

    // FOR AUDIT LOG
    const auditLevels = LoggerConfig.getCustomLevels(auditContextList)
    for (const level of Object.keys(auditLevels)) {
      const levelNumber = auditLevels[level]
      if (!levelNumber) continue
      srteamList.push({
        level: auditLevels[level] as any,
        stream: {
          write: (jsonStr: string) => {
            const { str } = JSON.parse(jsonStr) as LogData
            if (!str) return
            stdoutWrite(str)
          },
        },
      })
    }

    return srteamList
  }

  private static getRedactOptions(loggerParams: LoggerParams) {
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
    const customLevels = LoggerConfig.getCustomLevels(LoggerParams.AUDIT)
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
