import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from '@/common/validation'
import { ApiProperty, PartialType } from '@nestjs/swagger'

export class ServicioResumenDto {
  @ApiProperty({
    description: 'Identificador único del servicio',
    example: '5',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre identificador del servicio',
    example: 'Radiografía de tórax',
  })
  nombre!: string

  @ApiProperty({
    description: 'Duración estimada del servicio en minutos',
    example: 20,
  })
  duracionMinutos!: number
}

export class CrearEspecialidadDto {
  @ApiProperty({
    description: 'Nombre visible de la especialidad médica',
    example: 'Cardiología',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional de la especialidad médica',
    example: 'Especialidad dedicada al diagnóstico de enfermedades cardíacas',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({
    description: 'Color principal de la especialidad en formato hexadecimal',
    example: '#0ea5e9',
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  colorHex!: string
}

export class EspecialidadResponseDto {
  @ApiProperty({
    description: 'Identificador único de la especialidad',
    example: '12',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre visible de la especialidad médica',
    example: 'Cardiología',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional de la especialidad médica',
    example: 'Especialidad dedicada al diagnóstico de enfermedades cardíacas',
    required: false,
  })
  descripcion?: string

  @ApiProperty({
    description: 'Estado actual del registro de especialidad',
    example: 'ACTIVO',
  })
  estado!: string

  @ApiProperty({
    description: 'Color principal de la especialidad en formato hexadecimal',
    example: '#0ea5e9',
  })
  colorHex!: string

  @ApiProperty({
    description: 'Servicios asociados a la especialidad',
    type: [ServicioResumenDto],
  })
  servicios!: ServicioResumenDto[]
}

export class ActualizarEspecialidadDto extends PartialType(
  CrearEspecialidadDto
) {
  @ApiProperty({
    description: 'Permite reactivar o desactivar la especialidad',
    example: 'ACTIVO',
    required: false,
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}
