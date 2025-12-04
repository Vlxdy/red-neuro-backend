import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { CitasEstado } from '../constants'
import { EtiquetaResponseDto } from './etiqueta.dto'

export class EtiquetaAsociacionDto {
  @ApiProperty({
    description:
      'Identificador de una etiqueta existente. Use este campo o envíe nombre y colorHex',
    required: false,
    example: 'tag-urgente',
  })
  @IsOptional()
  @IsString()
  id?: string

  @ApiProperty({
    description: 'Nombre de la etiqueta a crear o reutilizar si ya existe',
    required: false,
    example: 'Prioritaria',
  })
  @IsOptional()
  @IsString()
  nombre?: string

  @ApiPropertyOptional({
    description:
      'Color en hexadecimal, requerido cuando se crea una nueva etiqueta',
    example: '#ff3366',
  })
  @IsOptional()
  @IsString()
  colorHex?: string
}

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
  medicoId?: string

  @ApiPropertyOptional({ enum: CitasEstado, description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(CitasEstado)
  estado?: CitasEstado

  @ApiPropertyOptional({
    description: 'Filtrar por etiqueta',
    example: 'tag-1',
  })
  @IsOptional()
  @IsString()
  etiquetaId?: string

  @ApiPropertyOptional({
    description: 'Filtrar por agrupador',
    example: 'grp-1',
  })
  @IsOptional()
  @IsString()
  agrupadorId?: string
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
  medicoId!: string

  @ApiPropertyOptional({
    description: 'Agrupador asociado (ambiente)',
    example: 'grp-1',
  })
  @IsOptional()
  @IsString()
  agrupadorId?: string

  @ApiPropertyOptional({
    description:
      'Etiquetas a asociar, permite enviar ids existentes o nombre/colorHex para crear la etiqueta si no existe',
    type: [EtiquetaAsociacionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EtiquetaAsociacionDto)
  etiquetas?: EtiquetaAsociacionDto[]
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

export class ActualizarEtiquetasCitaDto {
  @ApiProperty({
    description:
      'Etiquetas a asociar. Si una etiqueta no existe se crea usando nombre y colorHex',
    type: [EtiquetaAsociacionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EtiquetaAsociacionDto)
  etiquetas!: EtiquetaAsociacionDto[]
}

export class ActualizarAgrupadorCitaDto {
  @ApiProperty({ description: 'Identificador del agrupador', example: 'grp-1' })
  @IsString()
  agrupadorId!: string
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
    description: 'Identificador del agrupador asociado',
    example: 'grp-campana',
    required: false,
  })
  agrupadorId?: string

  @ApiProperty({
    description: 'Etiquetas asociadas a la cita',
    type: [EtiquetaResponseDto],
  })
  etiquetas!: EtiquetaResponseDto[]

  @ApiProperty({
    description: 'Comentario opcional del cambio de estado',
    required: false,
  })
  comentario?: string
}
