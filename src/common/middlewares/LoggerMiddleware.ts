import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { LoggerService } from '../../core/logger'

const logger = LoggerService.getInstance()

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const t1 = Date.now()
    const url = req.originalUrl.split('?')[0]
    logger.audit('request', {
      metadata: {
        method: req.method,
        url,
      },
      formato: `${req.method} ${url}`,
    })

    res.on('finish', () => {
      const t2 = Date.now()
      const statusCode = res.statusCode
      const elapsedTime = (t2 - t1) / 1000
      logger.auditInfo('response', {
        metadata: {
          code: statusCode,
          elapsedTime,
          method: req.method,
          url,
          usuario: req.user?.id,
        },
        formato: `${req.method} ${url} ${statusCode} - ${elapsedTime} seg.`,
      })
    })

    next()
  }
}
