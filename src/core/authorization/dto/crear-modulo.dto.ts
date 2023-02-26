import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  ValidateNested,
} from '../../../common/validation'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'
import { IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class PropiedadesDto {
  @IsOptional()
  @IsString()
  icono?: string

  @IsString()
  descripcion?: string

  @IsNumber()
  orden: number
}

export class CrearModuloDto {
  id: string
  @IsNotEmpty()
  @IsString()
  label: string

  @IsNotEmpty()
  @IsString()
  url: string

  @IsNotEmpty()
  @IsString()
  nombre: string

  @ValidateNested()
  @Type(() => PropiedadesDto)
  propiedades: PropiedadesDto

  @IsOptional()
  @IsNumberString()
  idModulo?: string

  @IsOptional()
  @IsString()
  estado?: string
}

export class FiltroModuloDto extends PaginacionQueryDto {
  readonly seccion?: boolean
}
