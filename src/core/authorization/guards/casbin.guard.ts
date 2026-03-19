import { CASBIN_ENFORCER } from '@/core/config/casbin/casbin.provider'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Enforcer } from 'casbin'

@Injectable()
export class CasbinGuard implements CanActivate {
  constructor(
    @Inject(CASBIN_ENFORCER)
    private enforcer: Enforcer
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest()

    if (!req.user) {
      throw new UnauthorizedException()
    }

    const action = req.method
    const resource = Object.keys(req.query).length
      ? req.route.path
      : req.originalUrl

    const allowed = await this.enforcer.enforce(req.user.rol, resource, action)

    if (!allowed) {
      throw new ForbiddenException('Permisos insuficientes (CASBIN)')
    }

    return true
  }
}
