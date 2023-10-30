import { LoggerService } from '../../logger'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AUTHZ_ENFORCER } from 'nest-authz'
import { Request } from 'express'
import { Enforcer } from 'casbin/lib/cjs/enforcer'

@Injectable()
export class CasbinGuard implements CanActivate {
  protected logger = LoggerService.getInstance()

  constructor(@Inject(AUTHZ_ENFORCER) private enforcer: Enforcer) {}

  async canActivate(context: ExecutionContext) {
    const {
      user,
      originalUrl,
      query,
      route,
      method: action,
    } = context.switchToHttp().getRequest() as Request
    const resource = Object.keys(query).length ? route.path : originalUrl

    if (!user) {
      throw new UnauthorizedException()
    }

    const isPermitted = await this.enforcer.enforce(user.rol, resource, action)
    if (isPermitted) {
      this.logger.audit('casbin', {
        mensaje: 'Acceso permitido',
        metadata: {
          v0: user.rol,
          v1: resource,
          v2: action,
          usuario: user.id,
        },
      })
      return true
    }

    this.logger.audit('casbin', {
      mensaje: 'Acceso no autorizado',
      metadata: {
        v0: user.rol,
        v1: resource,
        v2: action,
        usuario: user.id,
      },
    })

    throw new ForbiddenException('Permisos insuficientes (CASBIN)', {
      cause: `CASBIN ${action} ${resource} -> false`,
    })
  }
}
