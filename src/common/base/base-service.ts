import { LoggerService } from '../../core/logger/logger.service'

export class BaseService {
  protected logger: LoggerService

  constructor() {
    this.logger = LoggerService.getInstance()
  }
}
