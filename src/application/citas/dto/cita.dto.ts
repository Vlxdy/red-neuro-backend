import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { CitasEstado, TipoCita } from '../constants'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { PersonalResponseDto } from '@/application/personal/dto/personal.dto'
import { ConsultorioResponseDto } from '@/application/consultorio/dto/consultorio.dto'

export class EspecialidadCitaDto {
  @ApiProperty({
    description: 'Identificador de la especialidad',
    example: '3',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre de la especialidad',
    example: 'Radiología',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción de la especialidad',
    example: 'Especialidad dedicada a estudios por imagen',
    required: false,
  })
  descripcion?: string

  @ApiProperty({
    description: 'Color principal de la especialidad en formato hexadecimal',
    example: '#0ea5e9',
  })
  colorHex!: string

  @ApiProperty({
    description: 'Estado actual de la especialidad',
    example: 'ACTIVO',
  })
  estado!: string
}

export class EstudioCitaDto {
  @ApiProperty({ description: 'Identificador del estudio', example: '10' })
  id!: string

  @ApiProperty({
    description: 'Nombre del estudio',
    example: 'Ecografía abdominal',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción del estudio',
    example: 'Evaluación ecográfica de órganos abdominales',
  })
  descripcion!: string

  @ApiProperty({
    description: 'Duración estimada del estudio en minutos',
    example: 30,
  })
  duracionMinutos!: number

  @ApiProperty({ description: 'Estado actual del estudio', example: 'ACTIVO' })
  estado!: string
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
    description: 'Identificador del médico responsable',
    example: '42',
  })
  @IsString()
  @IsNotEmpty()
  idMedico!: string

  @ApiProperty({
    description: 'Identificador del paciente asignado',
    example: '105',
    required: false,
  })
  @IsOptional()
  @IsString()
  idPaciente?: string

  @ApiProperty({
    description: 'Identificador del consultorio asignado',
    example: '8',
    required: false,
  })
  @IsOptional()
  @IsString()
  idConsultorio?: string

  @ApiProperty({
    description: 'Identificador de la especialidad asociada',
    example: '12',
  })
  @IsString()
  @IsNotEmpty()
  idEspecialidad!: string

  @ApiProperty({
    enum: TipoCita,
    description: 'Tipo de cita: CONSULTA o ESTUDIO',
    example: TipoCita.CONSULTA,
  })
  @IsEnum(TipoCita)
  tipoCita!: TipoCita

  @ApiProperty({
    description:
      'Identificador del estudio a realizar (requerido cuando el tipo es ESTUDIO)',
    example: '5',
    required: false,
  })
  @IsOptional()
  @IsString()
  idEstudio?: string
}

export class ActualizarCitaDto extends CrearCitaDto {}

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
    enum: TipoCita,
    description: 'Tipo de cita: CONSULTA o ESTUDIO',
    example: TipoCita.CONSULTA,
  })
  @IsEnum(TipoCita)
  tipoCita!: TipoCita

  @ApiProperty({
    description:
      'Identificador del estudio a realizar (requerido cuando el tipo es ESTUDIO)',
    example: '5',
    required: false,
  })
  @IsOptional()
  @IsString()
  idEstudio?: string

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

  @ApiProperty({
    enum: TipoCita,
    description: 'Tipo de cita (CONSULTA o ESTUDIO)',
  })
  tipoCita!: TipoCita

  @ApiProperty({ enum: CitasEstado, description: 'Estado actual de la cita' })
  estado!: CitasEstado

  @ApiProperty({
    description: 'Identificador del médico asignado',
    example: '42',
  })
  medicoId!: string

  @ApiProperty({
    description: 'Identificador del paciente asignado',
    example: '105',
    required: false,
  })
  pacienteId?: string

  @ApiProperty({
    description: 'Identificador del consultorio asignado',
    example: '8',
    required: false,
  })
  consultorioId?: string

  @ApiProperty({
    description: 'Identificador de la especialidad asociada',
    example: '12',
    required: false,
  })
  especialidadId?: string

  @ApiProperty({
    description: 'Identificador del estudio asociado (solo si es estudio)',
    example: '5',
    required: false,
  })
  estudioId?: string

  @ApiProperty({
    description: 'Comentario opcional del cambio de estado',
    required: false,
  })
  comentario?: string

  @ApiProperty({
    description: 'Comentario interno del nutricionista',
    required: false,
  })
  comentarioNutricionista?: string

  @ApiProperty({
    description: 'Datos del profesional de salud asignado a la cita',
    type: () => PersonalResponseDto,
  })
  medico?: PersonalResponseDto

  @ApiProperty({
    description: 'Datos del paciente asignado a la cita',
    type: () => PersonalResponseDto,
    required: false,
  })
  paciente?: PersonalResponseDto

  @ApiProperty({
    description: 'Especialidad asociada a la cita',
    type: () => EspecialidadCitaDto,
    required: false,
  })
  especialidad?: EspecialidadCitaDto

  @ApiProperty({
    description: 'Estudio asociado a la cita',
    type: () => EstudioCitaDto,
    required: false,
  })
  estudio?: EstudioCitaDto

  @ApiProperty({
    description: 'Consultorio asociado a la cita',
    type: () => ConsultorioResponseDto,
    required: false,
  })
  consultorio?: ConsultorioResponseDto
}
