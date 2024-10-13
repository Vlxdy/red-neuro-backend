import { BaseException, LoggerService } from '@/core/logger'
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class OidcAuthGuard extends AuthGuard('oidc') {
  protected logger = LoggerService.getInstance()

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    try {
      const isPermitted = (await super.canActivate(context)) as boolean
      if (!isPermitted) throw new UnauthorizedException()
    } catch (err) {
      throw new BaseException(err, {
        modulo: 'CIUDADANÍA:PROVEEDOR IDENTIDAD',
        mensaje: 'Error de autenticación con Ciudadanía',
        accion: `Asegúrese de que el cliente de ciudadanía se encuentre correctamente configurado`,
      })
    }

    await super.logIn(request)

    const { user } = context.switchToHttp().getRequest()

    this.logger.audit('authentication', {
      mensaje: 'Ingresó al sistema',
      metadata: {
        tipo: 'CIUDADANÍA',
        usuario: user.id,
      },
    })

    return true
  }
}
