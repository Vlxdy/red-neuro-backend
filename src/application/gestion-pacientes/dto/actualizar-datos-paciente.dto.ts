import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from '@/common/validation'
import { Genero } from '@/common/constants'

export class ActualizarDatosPersonalesPacienteDto {
  @ApiPropertyOptional({ example: 'paciente@example.com' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() !== ''
      ? value.trim().toLowerCase()
      : undefined
  )
  @IsEmail()
  correoElectronico?: string

  @ApiPropertyOptional({ example: '71234567' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
  )
  @IsString()
  @Matches(/^\d+$/)
  @MinLength(7)
  @MaxLength(15)
  telefono?: string

  @ApiPropertyOptional({ enum: Genero })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() !== ''
      ? value.trim().toUpperCase()
      : undefined
  )
  @IsEnum(Genero)
  genero?: Genero
}
