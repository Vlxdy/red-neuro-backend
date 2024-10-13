import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { LoggerService, Metadata } from '@/core/logger'

const logger = LoggerService.getInstance()

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.startTime = Date.now()
    const url = req.originalUrl.split('?')[0]
    const metadata: Metadata = {
      ip: req.ip,
      useragent: req.headers['user-agent'],
      method: req.method,
      url,
    }
    if (LoggerService.isDebugEnabled()) {
      if (Object.keys(req.query || {}).length > 0) {
        metadata.query = req.query
      }
      if (Object.keys(req.body || {}).length > 0) {
        metadata.body = req.body
      }
    }
    logger.audit('request', {
      metadata,
      consoleOptions: {
        mensaje: `${req.method} ${url}... {query} {body}`,
      },
    })
    next()
  }
}
