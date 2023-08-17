import { LoggerService } from '../../core/logger'

export class BaseService {
  protected logger: LoggerService

  constructor() {
    this.logger = LoggerService.getInstance()
  }
}
