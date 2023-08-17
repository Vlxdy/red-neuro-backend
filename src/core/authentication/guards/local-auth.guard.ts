import { BaseException, LoggerService } from '../../logger'
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  protected logger = LoggerService.getInstance()

  async canActivate(context: ExecutionContext) {
    const {
      originalUrl,
      query,
      route,
      method: action,
    } = context.switchToHttp().getRequest()
    const resource = Object.keys(query).length ? route.path : originalUrl

    try {
      const isPermitted = (await super.canActivate(context)) as boolean
      if (!isPermitted) throw new UnauthorizedException()
    } catch (err) {
      throw new BaseException(err, {
        accion: 'Verifique que las credenciales de acceso sean las correctas',
        metadata: {
          msg: `${action} ${resource} -> false - LOGIN BÁSICO (Error con usuario y contraseña)`,
        },
      })
    }

    const { user } = context.switchToHttp().getRequest()

    this.logger.audit('authentication', {
      mensaje: 'Ingresó al sistema',
      metadata: {
        tipo: 'LOGIN BÁSICO',
        usuario: user.id,
      },
    })

    return true
  }
}
