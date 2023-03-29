import { LoggerService } from '../../logger/logger.service'
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
    const {
      originalUrl,
      query,
      route,
      method: action,
    } = context.switchToHttp().getRequest()
    const resource = Object.keys(query).length ? route.path : originalUrl
    const request = context.switchToHttp().getRequest()

    try {
      const isPermitted = (await super.canActivate(context)) as boolean
      if (!isPermitted) throw new UnauthorizedException()
    } catch (err) {
      const errMsg = `${action} ${resource} -> false - LOGIN CON CIUDADANÍA (Error con ciudadania)`
      this.logger.error(errMsg, err)
      throw err
    }

    await super.logIn(request)

    const { user } = context.switchToHttp().getRequest()
    this.logger.info(
      `${action} ${resource} -> true - LOGIN CON CIUDADANÍA (usuario: ${user?.id})`
    )
    return true
  }
}
