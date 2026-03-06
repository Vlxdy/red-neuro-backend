import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { LoggerService, Metadata } from '@/core/logger'
import { COLOR } from '@/core/logger/constants'
import { stdoutWrite } from '@/core/logger/tools'

const logger = LoggerService.getInstance()

const isEnvEnabled = (value: string | undefined, defaultValue: boolean) => {
  if (typeof value === 'undefined' || value.trim().length === 0) {
    return defaultValue
  }
  return String(value).toLowerCase() === 'true'
}

const shouldPrintHttpTrace =
  isEnvEnabled(process.env.LOG_ENABLED, true) &&
  isEnvEnabled(process.env.LOG_CONSOLE, true) &&
  isEnvEnabled(process.env.LOG_HTTP_TRACE, true)

const printHttpTrace = (tag: 'IN' | 'OUT', message: string) => {
  const tagColor = tag === 'IN' ? COLOR.LIGHT_GREEN : COLOR.LIGHT_BLUE
  const prefix = `${COLOR.LIGHT_GREY}[HTTP]${COLOR.RESET}`
  const coloredTag = `${tagColor}[${tag}]${COLOR.RESET}`
  stdoutWrite(`
${prefix}${coloredTag} ${COLOR.LIGHT_CYAN}${message}${COLOR.RESET}
`)
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestStartTime = Date.now()
    req.startTime = requestStartTime
    const url = req.originalUrl.split('?')[0]
    const baseMetadata: Metadata = {
      ip: req.ip,
      useragent: req.headers['user-agent'],
      method: req.method,
      url,
      socket: {
        localAddress: req.socket.localAddress,
        localPort: req.socket.localPort,
        remoteAddress: req.socket.remoteAddress,
        remotePort: req.socket.remotePort,
      },
    }

    if (LoggerService.isDebugEnabled()) {
      if (Object.keys(req.query || {}).length > 0) {
        baseMetadata.query = req.query
      }
      if (Object.keys(req.body || {}).length > 0) {
        baseMetadata.body = req.body
      }
    }

    logger.audit('request', {
      metadata: baseMetadata,
      consoleOptions: {
        mensaje: `${req.method} ${url}... {query} {body}`,
      },
    })

    if (shouldPrintHttpTrace) {
      printHttpTrace(
        'IN',
        `${req.method} ${url} ip=${req.ip} socket=${req.socket.remoteAddress}:${req.socket.remotePort} -> ${req.socket.localAddress}:${req.socket.localPort}`
      )
    }

    res.on('finish', () => {
      const durationMs = Date.now() - requestStartTime
      logger.audit('request', {
        metadata: {
          method: req.method,
          url,
          statusCode: res.statusCode,
          durationMs,
          socket: baseMetadata.socket,
        },
        consoleOptions: {
          mensaje: `${req.method} ${url} -> ${res.statusCode} (${durationMs}ms)`,
        },
      })

      if (shouldPrintHttpTrace) {
        printHttpTrace(
          'OUT',
          `${req.method} ${url} status=${res.statusCode} durationMs=${durationMs}`
        )
      }
    })

    next()
  }
}
