import { Provider } from '@nestjs/common'
import { newEnforcer } from 'casbin'
import TypeORMAdapter from 'typeorm-adapter'
import { join } from 'path'
import { ConfigService } from '@nestjs/config'

export const CASBIN_ENFORCER = 'CASBIN_ENFORCER'

export const CasbinProvider: Provider = {
  provide: CASBIN_ENFORCER,
  useFactory: async (config) => {
    const adapter = await TypeORMAdapter.newAdapter({
      type: 'postgres',
      host: config.get('DB_HOST'),
      port: config.get('DB_PORT'),
      username: config.get('DB_USERNAME'),
      password: config.get('DB_PASSWORD'),
      database: config.get('DB_DATABASE'),
      schema: config.get('DB_SCHEMA_USUARIOS'),
      synchronize: false,
    })

    const enforcer = await newEnforcer(join(__dirname, 'model.conf'), adapter)

    await enforcer.loadPolicy()
    return enforcer
  },
  inject: [ConfigService],
}
