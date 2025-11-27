import { Global, Module } from '@nestjs/common'
import { AuthorizationConfigModule } from './authorization/authorization.module'
import { DataBaseModule } from './database/database.module'
@Global()
@Module({
  imports: [DataBaseModule, AuthorizationConfigModule],
  exports: [DataBaseModule, AuthorizationConfigModule],
})
export class ConfigCoreModule {}
