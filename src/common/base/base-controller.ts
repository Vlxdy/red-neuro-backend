import { LoggerService } from '@/core/logger'
import { AbstractController } from '../dto/abstract-controller.dto'
import { ApiErrorResponses } from '../decorators/api-error-responses.decoratos'
@ApiErrorResponses()
export class BaseController extends AbstractController {
  protected logger: LoggerService

  constructor() {
    super()
    this.logger = LoggerService.getInstance()
  }
}
