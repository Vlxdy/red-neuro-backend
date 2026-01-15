import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { CitasEstado } from '../constants'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { PersonalResponseDto } from '@/application/personal/dto/personal.dto'

export class FiltrosCitaDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO)',
    example: '2024-06-01T08:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string

  @ApiPropertyOptional({
    description: 'Fecha de fin (ISO)',
    example: '2024-06-30T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string

  @ApiPropertyOptional({
    description: 'Identificador del médico',
    example: '12',
  })
  @IsOptional()
  @IsString()
  idMedico?: string

  @ApiPropertyOptional({ enum: CitasEstado, description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(CitasEstado)
  estado?: CitasEstado
}

export class FiltrosCitaPaginadoDto extends PaginacionQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO)',
    example: '2024-06-01T08:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string

  @ApiPropertyOptional({
    description: 'Fecha de fin (ISO)',
    example: '2024-06-30T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string

  @ApiPropertyOptional({
    description: 'Identificador del médico',
    example: '12',
  })
  @IsOptional()
  @IsString()
  idMedico?: string

  @ApiPropertyOptional({ enum: CitasEstado, description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(CitasEstado)
  estado?: CitasEstado
}

export class CrearCitaDto {
  @ApiProperty({
    description: 'Detalle o motivo de la cita',
    example: 'Control nutricional mensual',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  detalle!: string

  @ApiProperty({
    description: 'Fecha de inicio (ISO)',
    example: '2024-06-15T10:00:00Z',
  })
  @IsDateString()
  fechaInicio!: string

  @ApiProperty({
    description: 'Fecha de fin (ISO)',
    example: '2024-06-15T11:00:00Z',
  })
  @IsDateString()
  fechaFin!: string

  @ApiProperty({
    description: 'Identificador del médico responsable',
    example: '42',
  })
  @IsString()
  @IsNotEmpty()
  idMedico!: string
}

export class ActualizarCitaDto extends PartialType(CrearCitaDto) {}

export class ActualizarEstadoCitaDto {
  @ApiProperty({ enum: CitasEstado, description: 'Nuevo estado de la cita' })
  @IsEnum(CitasEstado)
  estado!: CitasEstado

  @ApiPropertyOptional({
    description: 'Comentario opcional para el cambio de estado',
  })
  @IsOptional()
  @IsString()
  comentario?: string
}

export class ReprogramarCitaDto {
  @ApiProperty({
    description: 'Nueva fecha de inicio',
    example: '2024-06-20T12:00:00Z',
  })
  @IsDateString()
  fechaInicio!: string

  @ApiProperty({
    description: 'Nueva fecha de fin',
    example: '2024-06-20T13:00:00Z',
  })
  @IsDateString()
  fechaFin!: string

  @ApiPropertyOptional({
    description: 'Comentario o motivo de la reprogramación',
  })
  @IsOptional()
  @IsString()
  comentario?: string
}

export class CancelarCitaDto {
  @ApiPropertyOptional({ description: 'Motivo de cancelación' })
  @IsOptional()
  @IsString()
  comentario?: string
}

export class MensajeCitaDto extends CrearCitaDto {}

export class MensajeEstadoCitaDto extends ActualizarEstadoCitaDto {
  @ApiProperty({ description: 'Identificador de la cita', example: 'cita-123' })
  @IsString()
  id!: string
}

export class MensajeReprogramarCitaDto extends ReprogramarCitaDto {
  @ApiProperty({ description: 'Identificador de la cita', example: 'cita-123' })
  @IsString()
  id!: string
}

export class MensajeCancelarCitaDto extends CancelarCitaDto {
  @ApiProperty({ description: 'Identificador de la cita', example: 'cita-123' })
  @IsString()
  id!: string
}

export class CitaResponseDto {
  @ApiProperty({ description: 'Identificador de la cita', example: 'cita-001' })
  id!: string

  @ApiProperty({
    description: 'Detalle o motivo de la cita',
    example: 'Control nutricional mensual',
  })
  detalle!: string

  @ApiProperty({
    description: 'Fecha de inicio en ISO 8601',
    example: '2024-06-15T10:00:00Z',
  })
  fechaInicio!: string

  @ApiProperty({
    description: 'Fecha de fin en ISO 8601',
    example: '2024-06-15T11:00:00Z',
  })
  fechaFin!: string

  @ApiProperty({ enum: CitasEstado, description: 'Estado actual de la cita' })
  estado!: CitasEstado

  @ApiProperty({
    description: 'Identificador del médico asignado',
    example: '42',
  })
  medicoId!: string

  @ApiProperty({
    description: 'Comentario opcional del cambio de estado',
    required: false,
  })
  comentario?: string

  @ApiProperty({
    description: 'Datos del profesional de salud asignado a la cita',
    type: () => PersonalResponseDto,
  })
  medico?: PersonalResponseDto
}
