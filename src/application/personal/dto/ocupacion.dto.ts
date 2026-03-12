import {
  IsNotEmpty,
  IsOptional,
  IsString,
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

export class CrearOcupacionDto {
  @ApiProperty({
    description: 'Nombre visible de la ocupación',
    example: 'Enfermería',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional de la ocupación',
    example: 'Perfil orientado al cuidado integral del paciente',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({
    description:
      'Grado o nivel profesional opcional para diferenciar perfiles de una misma ocupación',
    example: 'Licenciatura',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  grado?: string
}

export class OcupacionResponseDto {
  @ApiProperty({
    description: 'Identificador único de la ocupación',
    example: '12',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre visible de la ocupación',
    example: 'Enfermería',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional de la ocupación',
    example: 'Perfil orientado al cuidado integral del paciente',
    required: false,
  })
  descripcion?: string

  @ApiProperty({
    description:
      'Grado o nivel profesional opcional para diferenciar perfiles de una misma ocupación',
    example: 'Licenciatura',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  grado?: string

  @ApiProperty({
    description: 'Estado actual del registro de ocupación',
    example: 'ACTIVO',
  })
  estado!: string

  @ApiProperty({
    description: 'Servicios asociados a la ocupación',
    type: [ServicioResumenDto],
  })
  servicios!: ServicioResumenDto[]
}

export class ActualizarOcupacionDto extends PartialType(CrearOcupacionDto) {
  @ApiProperty({
    description: 'Permite reactivar o desactivar la ocupación',
    example: 'ACTIVO',
    required: false,
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}
