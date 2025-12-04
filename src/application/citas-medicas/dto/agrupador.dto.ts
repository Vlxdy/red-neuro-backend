import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'

export class CrearAgrupadorDto {
  @ApiProperty({
    description: 'Nombre visible del ambiente/agrupador',
    example: 'Consultorio 1 - Pediatría',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional del ambiente o agrupador',
    example: 'Consultorio principal del área pediátrica',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string

  @ApiProperty({
    description: 'Color identificador del ambiente en formato hexadecimal',
    example: '#0ea5e9',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^#([A-Fa-f0-9]{6})$/)
  colorHex!: string
}

export class ActualizarAgrupadorDto extends PartialType(CrearAgrupadorDto) {}

export class AgrupadorResponseDto {
  @ApiProperty({
    description: 'Identificador único del ambiente/agrupador',
    example: '5',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre visible del ambiente/agrupador',
    example: 'Consultorio 1 - Pediatría',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional del ambiente o agrupador',
    example: 'Consultorio principal del área pediátrica',
    required: false,
  })
  descripcion?: string

  @ApiProperty({ description: 'Estado del registro', example: 'ACTIVO' })
  estado!: string

  @ApiProperty({
    description: 'Color identificador del ambiente en formato hexadecimal',
    example: '#0ea5e9',
  })
  colorHex!: string
}
