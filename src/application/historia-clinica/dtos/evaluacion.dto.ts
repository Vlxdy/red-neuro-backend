import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'

const DECIMAL_PATTERN = /^\d+(\.\d+)?$/
const INTEGER_PATTERN = /^\d+$/

interface TransformNumberOptions {
  integer?: boolean
}

const TransformToNumber = ({ integer }: TransformNumberOptions = {}) =>
  Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value !== 'string') {
      return value
    }

    const trimmed = value.trim()

    if (trimmed === '') {
      return undefined
    }

    const pattern = integer ? INTEGER_PATTERN : DECIMAL_PATTERN

    if (!pattern.test(trimmed)) {
      return value
    }

    const parsed = Number(trimmed)

    if (!Number.isFinite(parsed)) {
      return value
    }

    if (integer) {
      return Math.trunc(parsed)
    }

    return parsed
  })
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

export class UpsertAntropometriaDto {
  @ApiPropertyOptional({ minimum: 30, maximum: 200 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(30)
  @Max(200)
  circunferenciaCintura?: number

  @ApiPropertyOptional({ minimum: 30, maximum: 200 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(30)
  @Max(200)
  circunferenciaCadera?: number

  @ApiPropertyOptional({ minimum: 0.3, maximum: 2.5 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(0.3)
  @Max(2.5)
  cinturaCaderaRatio?: number

  @ApiPropertyOptional({ minimum: 0, maximum: 50 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(0)
  @Max(50)
  pliegueTricipital?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 70 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(1)
  @Max(70)
  porcentajeGrasa?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 70 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(1)
  @Max(70)
  porcentajeMusculo?: number

  @ApiPropertyOptional({ minimum: 10, maximum: 80 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(10)
  @Max(80)
  aguaCorporal?: number
}

export class UpsertBioquimicaDto {
  @ApiPropertyOptional({ minimum: 40, maximum: 400 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(40)
  @Max(400)
  glucosa?: number

  @ApiPropertyOptional({ minimum: 50, maximum: 400 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(50)
  @Max(400)
  colesterolTotal?: number

  @ApiPropertyOptional({ minimum: 30, maximum: 1000 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(30)
  @Max(1000)
  trigliceridos?: number

  @ApiPropertyOptional({ minimum: 10, maximum: 150 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(10)
  @Max(150)
  hdl?: number

  @ApiPropertyOptional({ minimum: 10, maximum: 300 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(10)
  @Max(300)
  ldl?: number

  @ApiPropertyOptional({ minimum: 5, maximum: 20 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(5)
  @Max(20)
  hemoglobina?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 1000 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(1)
  @Max(1000)
  ferritina?: number
}

export class UpsertDieteticaDto {
  @ApiPropertyOptional({ minimum: 500, maximum: 6000 })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(500)
  @Max(6000)
  caloriasTotales?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 12 })
  @IsOptional()
  @TransformToNumber({ integer: true })
  @IsInt()
  @Min(1)
  @Max(12)
  numeroComidasDiarias?: number

  @ApiPropertyOptional({ description: 'Registro alimentario en formato JSON' })
  @IsOptional()
  registroAlimentario?: Record<string, any>

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @TransformToNumber({ integer: true })
  @IsInt()
  @Min(1)
  @Max(5)
  nivelConsumoAzucar?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @TransformToNumber({ integer: true })
  @IsInt()
  @Min(1)
  @Max(5)
  nivelHidratacion?: number
}

export class UpsertClinicaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patologiasPrevias?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicacionActual?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  nauseas?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  vomitos?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  diarrea?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  fatiga?: boolean
}

export class UpsertPsicosocialDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @TransformToNumber({ integer: true })
  @IsInt()
  @Min(1)
  @Max(5)
  nivelMotivacion?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @TransformToNumber({ integer: true })
  @IsInt()
  @Min(1)
  @Max(5)
  estresAlimentario?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @TransformToNumber({ integer: true })
  @IsInt()
  @Min(1)
  @Max(5)
  ansiedad?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @TransformToNumber({ integer: true })
  @IsInt()
  @Min(1)
  @Max(5)
  apoyoFamiliar?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @TransformToNumber({ integer: true })
  @IsInt()
  @Min(1)
  @Max(5)
  cumplimientoDieta?: number
}

export class CreateEvaluacionDto {
  @ApiPropertyOptional({
    description: 'Peso en kilogramos',
    minimum: 0.1,
    maximum: 500,
  })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(0.1)
  @Max(500)
  peso?: number

  @ApiPropertyOptional({
    description: 'Talla en metros',
    minimum: 0.5,
    maximum: 2.5,
  })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(0.5)
  @Max(2.5)
  talla?: number

  @ApiPropertyOptional({
    description: 'Índice de masa corporal',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(1)
  @Max(100)
  imc?: number

  @ApiPropertyOptional({ description: 'Diagnóstico nutricional' })
  @IsOptional()
  @IsString()
  diagnosticoNutricional?: string

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string

  @ApiPropertyOptional({ description: 'Datos antropométricos asociados' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertAntropometriaDto)
  antropometria?: UpsertAntropometriaDto

  @ApiPropertyOptional({ description: 'Resultados bioquímicos asociados' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertBioquimicaDto)
  bioquimica?: UpsertBioquimicaDto

  @ApiPropertyOptional({ description: 'Hábitos dietéticos asociados' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertDieteticaDto)
  dietetica?: UpsertDieteticaDto

  @ApiPropertyOptional({ description: 'Evaluación clínica asociada' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertClinicaDto)
  clinica?: UpsertClinicaDto

  @ApiPropertyOptional({ description: 'Evaluación psicosocial asociada' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertPsicosocialDto)
  psicosocial?: UpsertPsicosocialDto

  @ApiPropertyOptional({ description: 'Identificador de cita vinculada' })
  @IsOptional()
  @IsString()
  idCita?: string

  @ApiPropertyOptional({ description: 'Permite forzar la fecha de creación' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  forzarFecha?: boolean
}

export class UpdateEvaluacionDto {
  @ApiPropertyOptional({
    description: 'Identificador de la historia clínica',
    example: '1',
  })
  @IsOptional()
  @IsString()
  @IsNumberString()
  historiaClinicaId?: string

  @ApiPropertyOptional({ description: 'Fecha en que se realiza la evaluación' })
  @IsOptional()
  @IsDateString()
  fechaEvaluacion?: string

  @ApiPropertyOptional({
    description: 'Peso en kilogramos',
    minimum: 0.1,
    maximum: 500,
  })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(0.1)
  @Max(500)
  peso?: number

  @ApiPropertyOptional({
    description: 'Talla en metros',
    minimum: 0.5,
    maximum: 2.5,
  })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(0.5)
  @Max(2.5)
  talla?: number

  @ApiPropertyOptional({
    description: 'Índice de masa corporal',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @TransformToNumber()
  @IsNumber()
  @Min(1)
  @Max(100)
  imc?: number

  @ApiPropertyOptional({ description: 'Diagnóstico nutricional' })
  @IsOptional()
  @IsString()
  diagnosticoNutricional?: string

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string

  @ApiPropertyOptional({ description: 'Datos antropométricos asociados' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertAntropometriaDto)
  antropometria?: UpsertAntropometriaDto

  @ApiPropertyOptional({ description: 'Resultados bioquímicos asociados' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertBioquimicaDto)
  bioquimica?: UpsertBioquimicaDto

  @ApiPropertyOptional({ description: 'Hábitos dietéticos asociados' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertDieteticaDto)
  dietetica?: UpsertDieteticaDto

  @ApiPropertyOptional({ description: 'Evaluación clínica asociada' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertClinicaDto)
  clinica?: UpsertClinicaDto

  @ApiPropertyOptional({ description: 'Evaluación psicosocial asociada' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertPsicosocialDto)
  psicosocial?: UpsertPsicosocialDto
}

export const EVALUACION_RELACIONES = [
  'antropometria',
  'bioquimica',
  'dietetica',
  'clinica',
  'psicosocial',
  'archivos',
] as const

export type EvaluacionInclude = (typeof EVALUACION_RELACIONES)[number]

export class QueryEvaluacionesDto extends PaginacionQueryDto {
  @ApiPropertyOptional({ description: 'Identificador de la historia clínica' })
  @IsOptional()
  @IsString()
  @IsNumberString()
  historiaClinicaId?: string

  @ApiPropertyOptional({ description: 'Fecha inicial para el filtro' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string

  @ApiPropertyOptional({ description: 'Fecha final para el filtro' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string

  @ApiPropertyOptional({
    description: 'Relaciones a cargar',
    isArray: true,
    enum: EVALUACION_RELACIONES,
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsIn(EVALUACION_RELACIONES, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value ? [value] : undefined
  )
  include?: EvaluacionInclude[]
}

export class CrearEvaluacionDto extends CreateEvaluacionDto {}

export class CreateEvaluacionAntropometricaDto extends CreateEvaluacionDto {}

export class ActualizarEvaluacionAntropometricaDto extends UpdateEvaluacionDto {}
