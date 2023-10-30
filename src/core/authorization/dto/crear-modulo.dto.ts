import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  ValidateNested,
} from '../../../common/validation'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'
import { IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class PropiedadesDto {
  @ApiProperty({ example: 'dashboard' })
  @IsOptional()
  @IsString()
  icono?: string

  @ApiProperty({ example: 'Módulo de estadísticas' })
  @IsString()
  descripcion?: string

  @ApiProperty({ example: 7 })
  @IsNumber()
  orden: number
}

export class CrearModuloDto {
  id: string
  @ApiProperty({ example: 'Estadísticas' })
  @IsNotEmpty()
  @IsString()
  label: string

  @ApiProperty({ example: '/admin/estadisticas' })
  @IsNotEmpty()
  @IsString()
  url: string

  @ApiProperty({ example: 'Estadísticas' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropiedadesDto)
  propiedades: PropiedadesDto

  @IsOptional()
  @IsNumberString()
  idModulo?: string

  @ApiProperty({ example: 'ACTIVO' })
  @IsOptional()
  @IsString()
  estado?: string
}

export class FiltroModuloDto extends PaginacionQueryDto {
  readonly seccion?: boolean
}
