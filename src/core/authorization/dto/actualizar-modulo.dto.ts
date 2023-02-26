import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  ValidateNested,
} from '../../../common/validation'
import { PropiedadesDto } from './crear-modulo.dto'
import { IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class ActualizarModuloDto {
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
