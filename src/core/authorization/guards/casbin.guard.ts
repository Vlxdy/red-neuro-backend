import { LoggerService } from '../../logger/logger.service'
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
      this.logger.warn(
        `${action} ${resource} -> false - El usuario no se encuentra autenticado`
      )
      throw new UnauthorizedException()
    }

    const isPermitted = await this.enforcer.enforce(user.rol, resource, action)
    if (isPermitted) {
      this.logger.info(
        `${action} ${resource} -> true - CASBIN (rol: ${user.rol} usuario: ${user.id})`
      )
      return true
    }

    this.logger.warn(
      `${action} ${resource} -> false - Permisos insuficientes (CASBIN)`
    )
    throw new ForbiddenException()
  }
}
