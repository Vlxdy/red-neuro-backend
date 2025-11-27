import { CasbinService } from '@/core/config/casbin/casbin.service'
import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(private readonly rbac: CasbinService) {}

  async use(req, res, next) {
    const rol = req.user?.rol ?? 'PUBLIC'
    const action = req.method
    const resource = req.originalUrl
    const app = 'backend'

    const ok = await this.rbac.hasPolicy(rol, resource, action, app)

    if (!ok) {
      return res.status(403).json({ mensaje: 'No autorizado' })
    }

    next()
  }
}
