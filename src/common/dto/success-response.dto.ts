import { BaseResponseDto } from './swagger/base-response.dto'

export class SuccessResponseDto<T> extends BaseResponseDto<T> {
  declare datos: T
}
