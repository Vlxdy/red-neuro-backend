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
import { RolEnum } from '@/core/authorization/rol.enum'

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

    if (
      !allowed &&
      req.user.rol === RolEnum.PERSONAL_SALUD &&
      req.user.esSupervisor
    ) {
      const allowedComoAdminSalud = await this.enforcer.enforce(
        'PERSONAL_SALUD_ADMIN',
        resource,
        action
      )
      if (!allowedComoAdminSalud) {
        throw new ForbiddenException('Permisos insuficientes (CASBIN)')
      }
      return true
    }

    if (!allowed) {
      throw new ForbiddenException('Permisos insuficientes (CASBIN)')
    }

    return true
  }
}
