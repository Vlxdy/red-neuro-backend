import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CasbinService } from '../casbin/casbin.service'
import { CASBIN_ENFORCER, CasbinProvider } from '../casbin/casbin.provider'
import { AuthorizationService } from '@/core/authorization/controller/authorization.service'
import { ModuloService } from '@/core/authorization/service/modulo.service'
import { ModuloRepository } from '@/core/authorization/repository/modulo.repository'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'

@Module({
  imports: [ConfigModule],
  providers: [
    CasbinProvider,
    ModuloService,
    ModuloRepository,
    CasbinService,
    AuthorizationService,
    CasbinGuard,
  ],
  exports: [CasbinService, CasbinGuard, CASBIN_ENFORCER],
})
export class AuthorizationConfigModule {}
