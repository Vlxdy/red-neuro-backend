import {
  IsEnum,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from '@/common/validation'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { CitasEstado, TipoCita } from '@/application/citas/constants'

export class CrearPacienteDto {
  @ApiProperty({
    description: 'Nombres del paciente',
    example: 'Gabriela',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres!: string

  @ApiProperty({
    description: 'Primer apellido del paciente',
    example: 'Ramos',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  primerApellido?: string

  @ApiProperty({
    description: 'Segundo apellido del paciente',
    example: 'Paredes',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  segundoApellido?: string

  @ApiProperty({
    description: 'Número de documento del paciente',
    example: '4022331',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nroDocumento?: string

  @ApiProperty({
    description: 'Fecha de nacimiento del paciente (ISO)',
    example: '1994-03-12',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string

  @ApiProperty({
    description: 'Teléfono de contacto del paciente',
    example: '71234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string

  @ApiProperty({
    description: 'Género del paciente',
    example: 'F',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  genero?: string

  @ApiProperty({
    description: 'Observaciones o notas adicionales del paciente',
    example: 'Prefiere atención en horario de mañana.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observacion?: string
}

export class ActualizarPacienteDto extends PartialType(CrearPacienteDto) {
  @ApiProperty({
    description: 'Permite activar o desactivar al paciente',
    example: 'ACTIVO',
    required: false,
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}

export class PacienteResponseDto {
  @ApiProperty({
    description: 'Identificador único del paciente',
    example: '100',
  })
  id!: string

  @ApiProperty({
    description: 'Nombres del paciente',
    example: 'Gabriela',
  })
  nombres!: string

  @ApiProperty({
    description: 'Primer apellido del paciente',
    example: 'Ramos',
    required: false,
  })
  primerApellido?: string | null

  @ApiProperty({
    description: 'Segundo apellido del paciente',
    example: 'Paredes',
    required: false,
  })
  segundoApellido?: string | null

  @ApiProperty({
    description: 'Número de documento del paciente',
    example: '4022331',
    required: false,
  })
  nroDocumento?: string | null

  @ApiProperty({
    description: 'Fecha de nacimiento del paciente',
    example: '1994-03-12',
    required: false,
  })
  fechaNacimiento?: string | null

  @ApiProperty({
    description: 'Teléfono de contacto del paciente',
    example: '71234567',
    required: false,
  })
  telefono?: string | null

  @ApiProperty({
    description: 'Género del paciente',
    example: 'F',
    required: false,
  })
  genero?: string | null

  @ApiProperty({
    description: 'Observaciones o notas adicionales del paciente',
    example: 'Prefiere atención en horario de mañana.',
    required: false,
  })
  observacion?: string | null

  @ApiProperty({
    description: 'Estado del paciente',
    example: 'ACTIVO',
  })
  estado!: string
}

export class FiltrosCitasPacientePaginadoDto extends PaginacionQueryDto {
  @ApiProperty({
    description: 'Fecha/hora mínima de inicio de la cita (ISO)',
    example: '2026-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaInicioDesde?: string

  @ApiProperty({
    description: 'Fecha/hora máxima de inicio de la cita (ISO)',
    example: '2026-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaInicioHasta?: string

  @ApiProperty({
    description: 'Filtra por estado de la cita',
    enum: CitasEstado,
    required: false,
  })
  @IsOptional()
  @IsEnum(CitasEstado)
  estado?: CitasEstado

  @ApiProperty({
    description: 'Filtra por tipo de cita',
    enum: TipoCita,
    required: false,
  })
  @IsOptional()
  @IsEnum(TipoCita)
  tipoCita?: TipoCita

  @ApiProperty({
    description: 'Filtra por personal de salud asignado',
    example: '42',
    required: false,
  })
  @IsOptional()
  @IsString()
  idPersonal?: string

  @ApiProperty({
    description: 'Filtra por lugar de atención',
    example: '3',
    required: false,
  })
  @IsOptional()
  @IsString()
  idLugar?: string
}
