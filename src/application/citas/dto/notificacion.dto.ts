import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBooleanString, IsOptional, IsString } from '@/common/validation'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

export class FiltroNotificacionDto extends PaginacionQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  noLeidasRaw?: string

  get noLeidas() {
    return this.noLeidasRaw === 'true'
  }

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string
}

export class NotificacionResponseDto {
  @ApiProperty()
  id: string
  @ApiProperty()
  tipo: string
  @ApiProperty()
  mensaje: string
  @ApiProperty()
  visto: boolean
  @ApiPropertyOptional()
  idCita?: string
  @ApiPropertyOptional()
  idPersonal?: string
  @ApiProperty()
  fechaCreacion: Date
}

export class ResumenDiarioResponseDto {
  @ApiPropertyOptional()
  citasConfirmadasAsignadas?: number
  @ApiPropertyOptional()
  citasConPersonal?: number
  @ApiPropertyOptional()
  citasSinPersonal?: number
  @ApiProperty()
  fecha: string
}
