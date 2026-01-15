import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from '@/common/validation'
import { ApiProperty, PartialType } from '@nestjs/swagger'

export class CrearConsultorioDto {
  @ApiProperty({
    description: 'Nombre visible del consultorio o sala de atención',
    example: 'Consultorio 1 – Pediatría',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nombre!: string

  @ApiProperty({
    description: 'Descripción funcional del consultorio o sala',
    example: 'Sala destinada a la atención de pacientes pediátricos',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string

  @ApiProperty({
    description:
      'Color identificador del consultorio en la agenda (formato hexadecimal)',
    example: '#0ea5e9',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^#([A-Fa-f0-9]{6})$/)
  colorHex!: string
}

export class ConsultorioResponseDto {
  @ApiProperty({
    description: 'Identificador único del consultorio o sala de atención',
    example: '5',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre visible del consultorio o sala',
    example: 'Consultorio 1 - Pediatría',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción funcional del consultorio o sala de atención',
    example: 'Consultorio destinado a la atención de pacientes pediátricos',
    required: false,
  })
  descripcion?: string

  @ApiProperty({ description: 'Estado del registro', example: 'ACTIVO' })
  estado!: string

  @ApiProperty({
    description:
      'Color identificador del consultorio en la agenda (formato hexadecimal)',
    example: '#0ea5e9',
  })
  colorHex!: string
}

export class ActualizarConsultorioDto extends PartialType(CrearConsultorioDto) {
  @ApiProperty({
    description: 'Permite reactivar o desactivar el consultorio',
    example: 'ACTIVO',
    required: false,
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}
