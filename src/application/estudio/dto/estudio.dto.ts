import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from '@/common/validation'
import { ApiProperty, PartialType } from '@nestjs/swagger'

export class EspecialidadResumenDto {
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
    description: 'Color principal de la especialidad en formato hexadecimal',
    example: '#0ea5e9',
  })
  colorHex!: string
}

export class CrearEstudioDto {
  @ApiProperty({
    description: 'Nombre identificador del estudio médico',
    example: 'Ecografía abdominal',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre!: string

  @ApiProperty({
    description: 'Descripción funcional del estudio',
    example: 'Evaluación ecográfica de órganos abdominales',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion!: string

  @ApiProperty({
    description: 'Duración estimada del estudio en minutos',
    example: 30,
  })
  @IsInt()
  @Min(1)
  duracionMinutos!: number
}

export class AsignarEspecialidadDto {
  @ApiProperty({
    description: 'Identificador de la especialidad a asociar al estudio',
    example: '2',
  })
  @IsNumberString()
  especialidadId!: string
}

export class EstudioResponseDto {
  @ApiProperty({
    description: 'Identificador único del estudio médico',
    example: '8',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre identificador del estudio médico',
    example: 'Ecografía abdominal',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción funcional del estudio',
    example: 'Evaluación ecográfica de órganos abdominales',
  })
  descripcion!: string

  @ApiProperty({
    description: 'Duración estimada del estudio en minutos',
    example: 30,
  })
  duracionMinutos!: number

  @ApiProperty({ description: 'Estado del registro', example: 'ACTIVO' })
  estado!: string

  @ApiProperty({
    description: 'Especialidades asociadas al estudio',
    type: [EspecialidadResumenDto],
  })
  especialidades!: EspecialidadResumenDto[]
}

export class ActualizarEstudioDto extends PartialType(CrearEstudioDto) {
  @ApiProperty({
    description: 'Permite reactivar o desactivar el estudio',
    example: 'ACTIVO',
    required: false,
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}
