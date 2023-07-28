import { IsOptional } from '../validation'

export class SuccessResponseDto<T> {
  @IsOptional()
  finalizado: boolean

  @IsOptional()
  mensaje: string

  @IsOptional()
  datos: T
}
