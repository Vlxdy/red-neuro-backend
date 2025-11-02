import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { IsEnum, IsNotEmpty } from '@/common/validation'
import { RolEnum } from '@/core/authorization/rol.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ListarUsuariosRegistradosDto {
  @ApiProperty({
    description: 'Rol de los usuarios',
    enum: RolEnum,
  })
  @IsNotEmpty()
  @IsEnum(RolEnum)
  rol: RolEnum
}

export class UsuariosRegistradosResponse {
  id: string
  nombres: string
  primerApellido?: string | null
  segundoApellido?: string | null
  nroDocumento: string
  tipoDocumento: string
  genero?: string | null
  correoElectronico?: string | null
  estado: string
  // especialidad: string
}

export class PacientesAsignadosDto extends PaginacionQueryDto {
  todos?: boolean
}

export class PacientePorAsignarUsuarioResponseDto {
  @ApiProperty({
    example: '42',
    description: 'Identificador único del registro usuario-rol.',
  })
  id: string

  @ApiProperty({ example: 'María Fernanda' })
  nombres: string

  @ApiPropertyOptional({
    example: 'Pérez',
    nullable: true,
  })
  primerApellido?: string | null

  @ApiPropertyOptional({
    example: 'Gutiérrez',
    nullable: true,
  })
  segundoApellido?: string | null

  @ApiProperty({ example: '87654321' })
  nroDocumento: string

  @ApiProperty({ example: 'CI' })
  tipoDocumento: string

  @ApiPropertyOptional({ example: 'F', nullable: true })
  genero?: string | null

  @ApiPropertyOptional({
    example: 'maria.fernanda@example.com',
    nullable: true,
  })
  correoElectronico?: string | null

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatars/pacientes/42.png',
    nullable: true,
  })
  urlFoto?: string | null

  @ApiPropertyOptional({
    example: '1994-05-12',
    nullable: true,
    type: String,
  })
  fechaNacimiento?: Date | string | null

  @ApiPropertyOptional({
    example: '+59170123456',
    nullable: true,
  })
  telefono?: string | null

  @ApiProperty({ example: 'ACTIVO' })
  estado: string
}

export class PacientePorAsignarItemResponseDto extends PacientePorAsignarUsuarioResponseDto {
  @ApiProperty({
    example: false,
    description:
      'Indica si el paciente ya cuenta con un nutricionista asignado.',
  })
  estaAsignado: boolean

  @ApiPropertyOptional({
    type: () => PacientePorAsignarUsuarioResponseDto,
    nullable: true,
    description:
      'Información básica del nutricionista asignado cuando el paciente ya fue vinculado.',
  })
  nutricionistaAsignado?: PacientePorAsignarUsuarioResponseDto | null
}

class PacientesPorAsignarResponseDataDto {
  @ApiProperty({
    type: () => PacientePorAsignarItemResponseDto,
    isArray: true,
  })
  filas: PacientePorAsignarItemResponseDto[]

  @ApiProperty({ example: 12 })
  total: number
}

export class ListarPacientesPorAsignarSuccessResponseDto {
  @ApiProperty({ example: true })
  finalizado: boolean

  @ApiProperty({ example: 'Consulta exitosa' })
  mensaje: string

  @ApiProperty({ type: () => PacientesPorAsignarResponseDataDto })
  datos: PacientesPorAsignarResponseDataDto
}
