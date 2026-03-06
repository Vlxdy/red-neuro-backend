import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
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
import { PacienteResponseDto } from '@/application/paciente/dto/paciente.dto'
import { ConsultorioResponseDto } from '@/application/consultorio/dto/consultorio.dto'

export enum AccionCita {
  GUARDAR = 'GUARDAR',
  ENVIAR = 'ENVIAR',
}

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

export class LugarCitaDto {
  @ApiProperty({ description: 'Identificador de la institución', example: '2' })
  id!: string

  @ApiProperty({
    description: 'Nombre de la institución',
    example: 'Hospital General',
  })
  nombre!: string

  @ApiProperty({ description: 'Sigla de la institución', example: 'HGR' })
  sigla!: string

  @ApiProperty({
    description: 'Dirección de la institución',
    example: 'Av. Siempre Viva #123',
  })
  direccion!: string

  @ApiProperty({
    description: 'Estado actual de la institución',
    example: 'ACTIVO',
  })
  estado!: string
}

export class ServicioCitaDto {
  @ApiProperty({ description: 'Identificador del servicio', example: '10' })
  id!: string

  @ApiProperty({
    description: 'Nombre del servicio de cita',
    example: 'Ecografía abdominal',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción del servicio',
    example: 'Evaluación ecográfica de órganos abdominales',
  })
  descripcion!: string

  @ApiProperty({
    description: 'Duración estimada del servicio en minutos',
    example: 30,
  })
  duracionMinutos!: number

  @ApiProperty({
    enum: TipoCita,
    description: 'Categoría del servicio: CONSULTA o ESTUDIO',
    example: TipoCita.CONSULTA,
  })
  tipo!: TipoCita

  @ApiProperty({
    description: 'Costo referencial del servicio',
    example: 120,
  })
  costo!: number

  @ApiProperty({ description: 'Estado actual del servicio', example: 'ACTIVO' })
  estado!: string
}

export class FiltrosCitaDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO)',
    example: '2024-06-01T08:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaInicio!: string

  @ApiPropertyOptional({
    description: 'Fecha de fin (ISO)',
    example: '2024-06-30T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaFin!: string

  @ApiPropertyOptional({
    description: 'Identificador del médico',
    example: '12',
  })
  @IsOptional()
  @IsString()
  idMedico?: string

  @ApiPropertyOptional({
    description: 'Identificador del lugar',
    example: '2',
  })
  @IsOptional()
  @IsString()
  idLugar?: string

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

  @ApiPropertyOptional({
    description: 'Identificador del lugar',
    example: '2',
  })
  @IsOptional()
  @IsString()
  idLugar?: string

  @ApiPropertyOptional({ enum: CitasEstado, description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(CitasEstado)
  estado?: CitasEstado
}

export class CantidadCitasPorDiaResponseDto {
  @ApiProperty({
    description: 'Fecha del día consultado en formato YYYY-MM-DD',
    example: '2024-06-15',
  })
  fecha!: string

  @ApiProperty({
    description: 'Cantidad total de citas para el día',
    example: 8,
  })
  cantidad!: number
}

export class FiltrosHistorialCitaPaginadoDto extends PaginacionQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO) para filtrar el historial',
    example: '2024-06-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string

  @ApiPropertyOptional({
    description: 'Fecha de fin (ISO) para filtrar el historial',
    example: '2024-06-30T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string

  @ApiPropertyOptional({
    description: 'Identificador del usuario ejecutor (usuario-rol)',
    example: '42',
  })
  @IsOptional()
  @IsString()
  idEjecutor?: string
}

export class CrearCitaDto {
  @ApiProperty({
    enum: AccionCita,
    description: 'Acción al crear la cita: GUARDAR (borrador) o ENVIAR',
    example: AccionCita.GUARDAR,
  })
  @IsEnum(AccionCita)
  accion!: AccionCita

  @ApiProperty({
    description: 'Detalle o motivo de la cita',
    example: 'Control nutricional mensual',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  detalle?: string

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
  @IsOptional()
  idMedico?: string

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
    description: 'Identificador de la institución asociada',
    example: '2',
    required: false,
  })
  @IsOptional()
  @IsString()
  idLugar?: string

  @ApiProperty({
    description: 'Identificador de la especialidad asociada (opcional)',
    example: '12',
    required: false,
  })
  @IsOptional()
  @IsString()
  idEspecialidad?: string

  @ApiProperty({
    enum: TipoCita,
    description: 'Tipo de cita: CONSULTA o ESTUDIO',
    example: TipoCita.CONSULTA,
  })
  @IsEnum(TipoCita)
  tipoCita!: TipoCita

  @ApiProperty({
    description: 'Identificador del servicio a realizar',
    example: '5',
  })
  @IsString()
  @IsNotEmpty()
  idServicio!: string
}

export class ActualizarCitaDto extends PartialType(CrearCitaDto) {}

export class ActualizarEstadoCitaDto {
  @ApiProperty({ enum: CitasEstado, description: 'Nuevo estado de la cita' })
  @IsEnum(CitasEstado)
  estado!: CitasEstado
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
    description: 'Identificador del servicio a realizar',
    example: '5',
  })
  @IsString()
  @IsNotEmpty()
  idServicio!: string
}

export class EditarBorradorCitaDto extends PartialType(CrearCitaDto) {
  @ApiPropertyOptional({
    enum: AccionCita,
    description: 'No aplica para edición de borrador; se ignora si se envía',
  })
  @IsOptional()
  @IsEnum(AccionCita)
  accion?: AccionCita
}

export class EnviarCitaDto {
  @ApiPropertyOptional({
    description: 'Médico a asignar para enviar como solicitada',
    example: '42',
  })
  @IsOptional()
  @IsString()
  idMedico?: string
}

export class ConfirmarCitaDto {
  @ApiPropertyOptional({
    description:
      'Nueva fecha/hora de inicio opcional para confirmar la cita solicitada',
    example: '2024-06-20T12:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string

  @ApiPropertyOptional({
    description:
      'Detalle opcional a ajustar antes de confirmar la cita solicitada',
    example: 'Ajuste final coordinado en la confirmación',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  detalle?: string
}

export class RechazarCitaDto {
  @ApiPropertyOptional({
    description: 'Motivo opcional de rechazo de la cita solicitada',
    example: 'No disponibilidad en ese horario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivoRechazo?: string
}

export class CancelarCitaDto {
  @ApiPropertyOptional({
    description:
      'Comentario asociado a la cancelación (se guarda en historial)',
  })
  @IsOptional()
  @IsString()
  comentario?: string
}

export class MarcarNoAsistioCitaDto {
  @ApiPropertyOptional({
    description:
      'Comentario asociado al marcado de no asistencia (se guarda en historial)',
  })
  @IsOptional()
  @IsString()
  comentario?: string
}

export class MensajeCitaDto extends CrearCitaDto {}

export class MensajeActualizarCitaDto extends ActualizarCitaDto {
  @ApiProperty({ description: 'Identificador de la cita', example: 'cita-123' })
  @IsString()
  id!: string
}

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

export class CitaNuevaDetalleDto {
  @ApiProperty({ description: 'Identificador de la cita', example: '1002' })
  id!: string

  @ApiProperty({
    description: 'Detalle de la cita',
    example: 'Control nutricional',
  })
  detalle!: string

  @ApiProperty({ description: 'Fecha de inicio en ISO 8601' })
  fechaInicio!: string

  @ApiProperty({ description: 'Fecha de fin en ISO 8601' })
  fechaFin!: string

  @ApiProperty({ enum: TipoCita, description: 'Tipo de cita' })
  tipoCita!: TipoCita

  @ApiProperty({ enum: CitasEstado, description: 'Estado de la cita nueva' })
  estado!: CitasEstado

  @ApiPropertyOptional({ description: 'Id del médico asignado' })
  medicoId?: string

  @ApiPropertyOptional({ description: 'Id del paciente asignado' })
  pacienteId?: string

  @ApiPropertyOptional({ description: 'Id del consultorio asignado' })
  consultorioId?: string

  @ApiPropertyOptional({ description: 'Id de la institución asociada' })
  lugarId?: string

  @ApiPropertyOptional({ description: 'Id de la especialidad asociada' })
  especialidadId?: string

  @ApiPropertyOptional({ description: 'Id del servicio asociado' })
  servicioId?: string

  @ApiPropertyOptional({ type: () => PersonalResponseDto })
  medico?: PersonalResponseDto

  @ApiPropertyOptional({ type: () => PacienteResponseDto })
  paciente?: PacienteResponseDto

  @ApiPropertyOptional({ type: () => EspecialidadCitaDto })
  especialidad?: EspecialidadCitaDto

  @ApiPropertyOptional({ type: () => ServicioCitaDto })
  servicio?: ServicioCitaDto

  @ApiPropertyOptional({ type: () => ConsultorioResponseDto })
  consultorio?: ConsultorioResponseDto

  @ApiPropertyOptional({ type: () => LugarCitaDto })
  lugar?: LugarCitaDto
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

  @ApiPropertyOptional({
    description: 'Identificador de la cita nueva generada por reprogramación',
    example: '1002',
  })
  citaNuevaId?: string
  @ApiPropertyOptional({
    description:
      'Detalle completo de la cita nueva asociada por reprogramación',
    type: () => CitaNuevaDetalleDto,
  })
  citaNueva?: CitaNuevaDetalleDto

  @ApiPropertyOptional({
    description: 'Identificador compartido para cadena de reprogramaciones',
    example: 'HIST-CITA-0001',
  })
  historialCitaId?: string

  @ApiPropertyOptional({
    description: 'UsuarioRol que programó inicialmente la cita',
    example: '88',
  })
  usuarioProgramoId?: string
  @ApiPropertyOptional({
    description: 'Datos del personal que programó inicialmente la cita',
    type: () => PersonalResponseDto,
  })
  usuarioProgramo?: PersonalResponseDto

  @ApiPropertyOptional({
    description: 'UsuarioRol que envió la cita al flujo operativo',
    example: '91',
  })
  usuarioEnvioId?: string
  @ApiPropertyOptional({
    description: 'Datos del personal que envió la cita al flujo operativo',
    type: () => PersonalResponseDto,
  })
  usuarioEnvio?: PersonalResponseDto

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
    description: 'Identificador de la institución asociada',
    example: '2',
    required: false,
  })
  lugarId?: string

  @ApiProperty({
    description: 'Identificador de la especialidad asociada',
    example: '12',
    required: false,
  })
  especialidadId?: string

  @ApiProperty({
    description: 'Identificador del servicio asociado',
    example: '5',
    required: false,
  })
  servicioId?: string

  @ApiProperty({
    description: 'Datos del profesional de salud asignado a la cita',
    type: () => PersonalResponseDto,
  })
  medico?: PersonalResponseDto

  @ApiProperty({
    description: 'Datos del paciente asignado a la cita',
    type: () => PacienteResponseDto,
    required: false,
  })
  paciente?: PacienteResponseDto

  @ApiProperty({
    description: 'Especialidad asociada a la cita',
    type: () => EspecialidadCitaDto,
    required: false,
  })
  especialidad?: EspecialidadCitaDto

  @ApiProperty({
    description: 'Servicio asociado a la cita',
    type: () => ServicioCitaDto,
    required: false,
  })
  servicio?: ServicioCitaDto

  @ApiProperty({
    description: 'Consultorio asociado a la cita',
    type: () => ConsultorioResponseDto,
    required: false,
  })
  consultorio?: ConsultorioResponseDto

  @ApiProperty({
    description: 'Institución asociada a la cita',
    type: () => LugarCitaDto,
    required: false,
  })
  lugar?: LugarCitaDto
}

export class HistorialCitaResponseDto {
  @ApiProperty({ description: 'Identificador del registro de historial' })
  id!: string

  @ApiProperty({ description: 'Identificador de la cita asociada' })
  citaId!: string

  @ApiProperty({
    description:
      'Identificador del usuario que ejecutó la acción (usuario-rol)',
  })
  idEjecutor!: string

  @ApiProperty({
    description: 'Comentario asociado a la transición',
    required: false,
  })
  comentario?: string

  @ApiProperty({
    description:
      'Detalle de cambios realizados sobre la cita, incluyendo valores anteriores y posteriores',
    required: false,
    type: () => HistorialCambioDto,
    isArray: true,
  })
  detalleCambios?: HistorialCambioDto[]

  @ApiProperty({
    description:
      'Datos del usuario ejecutor (cuando está disponible en el historial)',
    type: () => PersonalResponseDto,
    required: false,
  })
  ejecutor?: PersonalResponseDto

  @ApiProperty({
    description: 'Fecha de creación del registro en formato ISO 8601',
  })
  fechaCreacion!: string
}

export class HistorialCambioDto {
  @ApiProperty({ description: 'Campo modificado', example: 'idMedico' })
  field!: string

  @ApiProperty({
    description: 'Valor anterior del campo',
    required: false,
  })
  before?: string

  @ApiProperty({
    description: 'Valor posterior del campo',
    required: false,
  })
  after?: string

  @ApiProperty({
    description:
      'Detalle del valor anterior si corresponde a un médico, paciente o servicio',
    required: false,
    type: Object,
  })
  beforeDetalle?: PersonalResponseDto | PacienteResponseDto | ServicioCitaDto

  @ApiProperty({
    description:
      'Detalle del valor posterior si corresponde a un médico, paciente o servicio',
    required: false,
    type: Object,
  })
  afterDetalle?: PersonalResponseDto | PacienteResponseDto | ServicioCitaDto
}
