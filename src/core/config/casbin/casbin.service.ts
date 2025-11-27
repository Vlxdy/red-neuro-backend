import { Inject, Injectable } from '@nestjs/common'
import { Enforcer } from 'casbin'
import { CASBIN_ENFORCER } from './casbin.provider'

@Injectable()
export class CasbinService {
  constructor(
    @Inject(CASBIN_ENFORCER)
    private readonly enforcer: Enforcer
  ) {}

  // eslint-disable-next-line
  async hasPolicy(sujeto, objeto, accion, app) {
    return this.enforcer.enforce(sujeto, objeto, accion, app)
  }
  // eslint-disable-next-line
  async getPolicy() {
    return this.enforcer.getPolicy()
  }
  // eslint-disable-next-line
  async getFilteredPolicy(index: number, value: string) {
    return this.enforcer.getFilteredPolicy(index, value)
  }
  // eslint-disable-next-line
  async addPolicy(sujeto, objeto, accion, app) {
    return this.enforcer.addPolicy(sujeto, objeto, accion, app)
  }
  // eslint-disable-next-line
  async removePolicy(sujeto, objeto, accion, app) {
    return this.enforcer.removePolicy(sujeto, objeto, accion, app)
  }
}
