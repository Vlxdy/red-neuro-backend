import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { IsBoolean, IsOptional } from '@/common/validation'

export class ListarPersonalSaludQueryDto extends PaginacionQueryDto {
  @ApiPropertyOptional({
    description:
      'Si es true, incluye personal de salud activo e inactivo. Requiere permisos administrativos.',
    default: false,
  })
  @Transform(({ value }) => {
    if (value === undefined) {
      return undefined
    }

    if (typeof value === 'boolean') {
      return value
    }

    return String(value).toLowerCase() === 'true'
  })
  @IsOptional()
  @IsBoolean()
  readonly incluirInactivos?: boolean
}
