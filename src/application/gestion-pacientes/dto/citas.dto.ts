import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from '@/common/validation'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { CitasEstado } from '../constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

class CitaUsuarioRolResponseDto {
  @ApiProperty({ example: '23' })
  id: string

  @ApiProperty({ example: 'María' })
  nombres: string

  @ApiPropertyOptional({ example: 'Pérez' })
  primerApellido?: string | null

  @ApiPropertyOptional({ example: 'Gómez' })
  segundoApellido?: string | null

  @ApiProperty({ example: '87654321' })
  nroDocumento: string

  @ApiProperty({ example: 'DNI' })
  tipoDocumento: string

  @ApiPropertyOptional({ example: 'F' })
  genero?: string | null

  @ApiPropertyOptional({ example: 'maria.perez@example.com' })
  correoElectronico?: string | null

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatars/maria.jpg' })
  urlFoto?: string | null

  @ApiPropertyOptional({ example: '1992-05-10' })
  fechaNacimiento?: Date | string | null

  @ApiPropertyOptional({ example: '+51987654321' })
  telefono?: string | null

  @ApiProperty({ example: 'ACTIVO' })
  estado: string
}

class CitaListadoItemResponseDto {
  @ApiProperty({ example: '15' })
  id: string

  @ApiProperty({ example: 'Control mensual' })
  detalle: string

  @ApiProperty({ example: '2024-07-18T15:00:00.000Z' })
  fechaInicio: Date | string | null

  @ApiProperty({ example: '2024-07-18T15:30:00.000Z' })
  fechaFin: Date | string | null

  @ApiProperty({ example: 'PROGRAMADA' })
  estado: string

  @ApiProperty({
    type: () => CitaUsuarioRolResponseDto,
    nullable: true,
  })
  paciente: CitaUsuarioRolResponseDto | null

  @ApiProperty({
    type: () => CitaUsuarioRolResponseDto,
    nullable: true,
  })
  medico: CitaUsuarioRolResponseDto | null
}

class ListarCitasResponseDataDto {
  @ApiProperty({
    type: () => CitaListadoItemResponseDto,
    isArray: true,
  })
  filas: CitaListadoItemResponseDto[]

  @ApiProperty({ example: 1 })
  total: number
}

export class CitaDetalleResponseDto extends CitaListadoItemResponseDto {
  @ApiProperty({ example: '23' })
  idPaciente: string

  @ApiProperty({ example: '7' })
  idMedico: string

  @ApiPropertyOptional({
    description:
      'Último comentario registrado por el nutricionista para la cita',
    example: 'Recuerda traer tus últimos análisis.',
    nullable: true,
  })
  comentarioNutricionista?: string | null

  @ApiPropertyOptional({
    description: 'Fecha en la que la cita fue confirmada y quedó bloqueada',
    example: '2024-07-10T14:00:00.000Z',
    nullable: true,
  })
  lockedAt?: Date | string | null

  @ApiProperty({
    description:
      'Cantidad de reversiones de pendiente a borrador dentro de la ventana controlada',
    example: 0,
  })
  reversionesPendiente: number

  @ApiPropertyOptional({
    description: 'Última fecha en la que se actualizó la ventana de reversión',
    example: '2024-07-09T10:30:00.000Z',
    nullable: true,
  })
  reversionPendienteActualizadaEn?: Date | string | null

  @ApiProperty({
    description:
      'Cantidad de reprogramaciones realizadas después de un rechazo',
    example: 1,
  })
  reprogramacionesDesdeRechazo: number

  @ApiProperty({
    description: 'Cantidad total de reprogramaciones realizadas sobre la cita',
    example: 2,
  })
  reprogramacionesTotales: number

  @ApiProperty({
    description: 'Fecha de creación del registro de la cita',
    example: '2024-07-05T12:15:30.000Z',
  })
  fechaCreacion: Date | string

  @ApiPropertyOptional({
    description: 'Fecha de última modificación del registro de la cita',
    example: '2024-07-11T09:45:00.000Z',
    nullable: true,
  })
  fechaModificacion?: Date | string | null
}

export class ListarCitasSuccessResponseDto {
  @ApiProperty({ example: true })
  finalizado: boolean

  @ApiProperty({ example: 'Consulta exitosa' })
  mensaje: string

  @ApiProperty({ type: () => ListarCitasResponseDataDto })
  datos: ListarCitasResponseDataDto
}

export class CrearCitaDto {
  // @ApiProperty({
  //   description: 'Clave foránea que referencia al medico idRolUsuario',
  //   example: '2',
  // })
  // @IsNotEmpty()
  // @IsNumberString()
  // idMedico: string

  @ApiPropertyOptional({
    description:
      'Clave foránea que referencia al paciente idRolUsuario. Obligatorio para administradores y nutricionistas.',
    example: '3',
  })
  @IsOptional()
  @IsNumberString()
  idPaciente?: string

  @ApiProperty({
    example: '2023-10-01T10:00:00Z',
    description: 'Fecha y hora de inicio de la cita',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaInicio: Date

  @ApiProperty({
    description: 'Fecha y hora de fin de la cita',
    example: '2023-10-01T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaFin: Date

  @ApiProperty({
    description: 'Descripción de la cita',
    example: 'Consulta médica general',
  })
  @IsNotEmpty()
  @IsString()
  detalle: string
}

export class ListarCitasQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha inicial del rango de búsqueda',
    example: '2024-07-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string

  @ApiPropertyOptional({
    description: 'Fecha final del rango de búsqueda',
    example: '2024-07-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string
}

export class ListarCitasPorRangoQueryDto extends ListarCitasQueryDto {
  @ApiPropertyOptional({
    description:
      'Identificador del paciente para filtrar (solo administradores o nutricionistas).',
    example: '23',
  })
  @IsOptional()
  @IsNumberString()
  idPaciente?: string

  @ApiPropertyOptional({
    description:
      'Identificador del nutricionista para filtrar (solo administradores).',
    example: '5',
  })
  @IsOptional()
  @IsNumberString()
  idMedico?: string

  @ApiPropertyOptional({
    description: 'Estados de las citas a incluir en la búsqueda',
    enum: CitasEstado,
    isArray: true,
    example: [CitasEstado.CONFIRMADA, CitasEstado.SOLICITADA],
  })
  @Transform(({ value }) =>
    value === undefined ? undefined : Array.isArray(value) ? value : [value]
  )
  @IsOptional()
  @IsArray()
  @IsEnum(CitasEstado, { each: true })
  estados?: CitasEstado[]
}

export class ListarAgendaCitasQueryDto extends PaginacionQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha del día a consultar. Si se omite no se limita por día.',
    example: '2024-07-21T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string

  @ApiPropertyOptional({
    description:
      'Identificador del paciente para filtrar (solo administradores o nutricionistas).',
    example: '23',
  })
  @IsOptional()
  @IsNumberString()
  idPaciente?: string

  @ApiPropertyOptional({
    description:
      'Identificador del nutricionista para filtrar (solo administradores).',
    example: '5',
  })
  @IsOptional()
  @IsNumberString()
  idMedico?: string

  @ApiPropertyOptional({
    description: 'Estados de las citas a incluir en la agenda paginada',
    enum: CitasEstado,
    isArray: true,
    example: [CitasEstado.CONFIRMADA, CitasEstado.SOLICITADA],
  })
  @Transform(({ value }) =>
    value === undefined ? undefined : Array.isArray(value) ? value : [value]
  )
  @IsOptional()
  @IsArray()
  @IsEnum(CitasEstado, { each: true })
  estados?: CitasEstado[]
}

export class ActualizarCitaDto {
  @ApiProperty({
    description: 'Clave foránea que referencia al paciente idRolUsuario',
    example: '3',
  })
  @IsNotEmpty()
  @IsNumberString()
  @IsOptional()
  idPaciente?: string

  @ApiProperty({
    example: '2023-10-01T10:00:00Z',
    description: 'Fecha y hora de inicio de la cita',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsOptional()
  fechaInicio?: Date

  @ApiProperty({
    description: 'Fecha y hora de fin de la cita',
    example: '2023-10-01T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  fechaFin?: Date

  @ApiProperty({
    description: 'Descripción de la cita',
    example: 'Consulta médica general',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  detalle?: string

  @ApiProperty({
    description: 'Estado de la cita',
    example: 'PENDIENTE',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(CitasEstado)
  @IsOptional()
  estado?: CitasEstado
}

export class CrearCitaPacienteDto {
  @ApiProperty({
    example: '2023-10-01T10:00:00Z',
    description: 'Fecha y hora de inicio de la cita',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaInicio: Date

  @ApiProperty({
    description: 'Fecha y hora de fin de la cita',
    example: '2023-10-01T10:30:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaFin: Date

  @ApiProperty({
    description: 'Descripción de la cita',
    example: 'Consulta de control mensual',
  })
  @IsNotEmpty()
  @IsString()
  detalle: string
}

export class CancelarCitaDto {
  @ApiProperty({
    description: 'Motivo de la cancelación registrada en el historial',
    example: 'No podré asistir por un viaje programado',
  })
  @IsNotEmpty()
  @IsString()
  motivo: string
}

export class AprobarCitaDto {
  @ApiPropertyOptional({
    description: 'Comentario opcional que se enviará junto con la confirmación',
    example: 'Te espero 10 minutos antes para revisar tus últimos resultados.',
  })
  @IsOptional()
  @IsString()
  comentario?: string
}

export class RechazarCitaDto {
  @ApiProperty({
    description: 'Motivo detallado del rechazo que verá el paciente',
    example:
      'La hora propuesta coincide con otra atención, por favor elige otro horario.',
  })
  @IsNotEmpty()
  @IsString()
  comentario: string
}

export class ReprogramarCitaDto {
  @ApiProperty({
    description: 'Nueva fecha y hora de inicio',
    example: '2024-07-18T15:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaInicio: Date

  @ApiProperty({
    description: 'Nueva fecha y hora de término',
    example: '2024-07-18T15:30:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaFin: Date

  @ApiProperty({
    description: 'Comentario con el detalle de la reprogramación',
    example: 'Reprogramamos para ajustar a tu nuevo horario de trabajo.',
  })
  @IsNotEmpty()
  @IsString()
  comentario: string
}

export class ReabrirCitaDto {
  @ApiPropertyOptional({
    description:
      'Comentario opcional que describe el ajuste que realizará el paciente',
    example: 'Actualizaré el horario para después de mis clases.',
  })
  @IsOptional()
  @IsString()
  comentario?: string
}

export class HistorialCitaItemResponseDto {
  @ApiProperty({ example: '12' })
  id: string

  @ApiPropertyOptional({ enum: CitasEstado, nullable: true })
  estadoAnterior?: CitasEstado | null

  @ApiProperty({ enum: CitasEstado })
  estado: CitasEstado

  @ApiPropertyOptional({
    example: 'El paciente solicitó cambiar el horario para la tarde.',
    nullable: true,
  })
  comentario?: string | null

  @ApiProperty({ example: 'PACIENTE' })
  rolEjecutor: string

  @ApiProperty({ example: '45' })
  usuarioEjecutor: string

  @ApiProperty({
    example: '2024-07-18T15:00:00.000Z',
    description: 'Fecha en la que se registró el evento',
  })
  fechaCreacion: Date
}
