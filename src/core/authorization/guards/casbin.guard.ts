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

@Injectable()
export class CasbinGuard implements CanActivate {
  protected logger = LoggerService.getInstance()

  constructor(@Inject(AUTHZ_ENFORCER) private enforcer: any) {}

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

    for (const rol of user.roles) {
      const isPermitted = await this.enforcer.enforce(rol, resource, action)
      if (isPermitted) {
        this.logger.info(
          `${action} ${resource} -> true - CASBIN (rol: ${rol} usuario: ${user.id})`
        )
        return true
      }
    }

    this.logger.warn(
      `${action} ${resource} -> false - Permisos insuficientes (CASBIN)`
    )
    throw new ForbiddenException()
  }
}
