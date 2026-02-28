import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from '@/common/validation'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { TipoCita } from '@/application/citas/constants'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

export class ListarServiciosQueryDto extends PaginacionQueryDto {
  @ApiProperty({
    enum: TipoCita,
    description: 'Filtra por tipo de servicio: CONSULTA o ESTUDIO',
    required: false,
    example: TipoCita.CONSULTA,
  })
  @IsOptional()
  @IsEnum(TipoCita)
  tipo?: TipoCita
}

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

export class CrearServicioDto {
  @ApiProperty({
    description: 'Nombre identificador del servicio',
    example: 'Ecografía abdominal',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre!: string

  @ApiProperty({
    description: 'Descripción funcional del servicio',
    example: 'Evaluación ecográfica de órganos abdominales',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion!: string

  @ApiProperty({
    description: 'Duración estimada del servicio en minutos',
    example: 30,
  })
  @IsInt()
  @Min(1)
  duracionMinutos!: number

  @ApiProperty({
    enum: TipoCita,
    description: 'Tipo de servicio: CONSULTA o ESTUDIO',
    example: TipoCita.CONSULTA,
  })
  @IsString()
  @IsNotEmpty()
  tipo!: TipoCita

  @ApiProperty({
    description: 'Costo referencial del servicio',
    example: 120,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costo!: number

  @ApiProperty({
    description: 'Identificadores de especialidades asociadas (opcional)',
    example: ['2', '5'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  especialidadIds?: string[]
}

export class ServicioResponseDto {
  @ApiProperty({
    description: 'Identificador único del servicio',
    example: '8',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre identificador del servicio',
    example: 'Ecografía abdominal',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción funcional del servicio',
    example: 'Evaluación ecográfica de órganos abdominales',
  })
  descripcion!: string

  @ApiProperty({
    description: 'Duración estimada del servicio en minutos',
    example: 30,
  })
  duracionMinutos!: number

  @ApiProperty({ description: 'Estado del registro', example: 'ACTIVO' })
  estado!: string

  @ApiProperty({
    enum: TipoCita,
    description: 'Tipo de servicio: CONSULTA o ESTUDIO',
    example: TipoCita.CONSULTA,
  })
  tipo!: TipoCita

  @ApiProperty({
    description: 'Costo referencial del servicio',
    example: 120,
  })
  costo!: number

  @ApiProperty({
    description: 'Especialidades asociadas al servicio',
    type: [EspecialidadResumenDto],
  })
  especialidades!: EspecialidadResumenDto[]
}

export class ActualizarServicioDto extends PartialType(CrearServicioDto) {
  @ApiProperty({
    description: 'Permite reactivar o desactivar el servicio',
    example: 'ACTIVO',
    required: false,
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}
