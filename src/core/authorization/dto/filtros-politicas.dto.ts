import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

export class FiltrosPoliticasDto extends PaginacionQueryDto {
  // @Transform(({ value }) => (value ? value.split(',') : null))
  readonly aplicacion?: string
}
