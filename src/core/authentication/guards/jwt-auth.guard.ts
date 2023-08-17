import { BaseException, LoggerService } from '../../logger'
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  protected logger = LoggerService.getInstance()

  async canActivate(context: ExecutionContext) {
    const {
      originalUrl,
      query,
      route,
      headers,
      method: action,
    } = context.switchToHttp().getRequest() as Request
    const resource = Object.keys(query).length ? route.path : originalUrl

    try {
      if (!headers.authorization) {
        throw new ForbiddenException()
      }

      const isPermitted = (await super.canActivate(context)) as boolean
      if (!isPermitted) throw new ForbiddenException()
    } catch (err) {
      const token = headers.authorization
        ? `${headers.authorization.substring(0, 20)}...`
        : String(headers.authorization)

      throw new BaseException(err, {
        accion: 'Verificar que el token sea el correcto',
        metadata: {
          msg: `JWT ${action} ${resource} -> false - Token inválido (${token})`,
        },
      })
    }

    return true
  }
}
