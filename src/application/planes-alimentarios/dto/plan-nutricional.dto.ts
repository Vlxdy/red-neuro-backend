import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from '@/common/validation'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { CategoriaAlimento, UnidadMedida } from '../constant'
import { TipoAlimento } from '../entity/alimento.entity'
import {
  PlanNutricionalDistribucionCalorica,
  PlanNutricionalDistribucionMacronutrientes,
  PlanNutricionalTiempoCalorico,
} from '../entity/plan-nutricional.entity'

class PlanMacroDetalleDto {
  @ApiProperty({ example: 210, description: 'Cantidad expresada en gramos' })
  gramos: number

  @ApiProperty({
    example: 840,
    description: 'Aporte calórico asociado al macronutriente',
  })
  calorias: number

  @ApiProperty({
    example: 0.4,
    description: 'Porcentaje respecto al total calórico diario',
  })
  porcentaje: number
}

class PlanMacroDetalleGrupoDto {
  @ApiProperty({ type: PlanMacroDetalleDto })
  carbohidratos: PlanMacroDetalleDto

  @ApiProperty({ type: PlanMacroDetalleDto })
  proteinas: PlanMacroDetalleDto

  @ApiProperty({ type: PlanMacroDetalleDto })
  grasas: PlanMacroDetalleDto
}

export class PlanNutricionalDistribucionMacronutrientesResponseDto
  implements PlanNutricionalDistribucionMacronutrientes
{
  @ApiProperty({ type: PlanMacroDetalleGrupoDto })
  objetivo: PlanMacroDetalleGrupoDto

  @ApiProperty({ type: PlanMacroDetalleGrupoDto })
  planGenerado: PlanMacroDetalleGrupoDto
}

export class PlanNutricionalTiempoCaloricoResponseDto
  implements PlanNutricionalTiempoCalorico
{
  @ApiProperty({ enum: TipoAlimento })
  tipo: TipoAlimento

  @ApiProperty({
    example: 450,
    description: 'Calorías destinadas al tiempo de comida',
  })
  calorias: number

  @ApiProperty({ example: 0.25, description: 'Porcentaje del total calórico' })
  porcentaje: number
}

export class PlanNutricionalDistribucionCaloricaResponseDto
  implements PlanNutricionalDistribucionCalorica
{
  @ApiProperty({ type: [PlanNutricionalTiempoCaloricoResponseDto] })
  objetivo: PlanNutricionalTiempoCaloricoResponseDto[]

  @ApiProperty({ type: [PlanNutricionalTiempoCaloricoResponseDto] })
  planGenerado: PlanNutricionalTiempoCaloricoResponseDto[]
}

export class PlanAlimentoDto {
  @ApiProperty({ description: 'Identificador del alimento seleccionado' })
  @IsNotEmpty()
  @IsString()
  idAlimento: string

  @ApiProperty({
    example: 1,
    description: 'Cantidad en múltiplos de la porción referencial registrada',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  cantidad: number

  @ApiProperty({ enum: TipoAlimento })
  @IsEnum(TipoAlimento)
  tipo: TipoAlimento
}

export class PlanNutricionalAlimentoResponseDto extends PlanAlimentoDto {
  @ApiPropertyOptional({
    description: 'Identificador del registro dentro del plan',
  })
  id?: string

  @ApiProperty({ description: 'Nombre del alimento' })
  nombre: string

  @ApiProperty({ enum: CategoriaAlimento })
  categoria: CategoriaAlimento

  @ApiProperty({ enum: UnidadMedida })
  unidadMedida: UnidadMedida

  @ApiProperty({ example: 100 })
  cantidadReferencial: number

  @ApiProperty({
    example: 250,
    description: 'Calorías aportadas según la cantidad',
  })
  calorias: number

  @ApiProperty({
    example: 35,
    description: 'Gramos de carbohidratos aportados',
  })
  carbohidratos: number

  @ApiProperty({ example: 25, description: 'Gramos de proteína aportados' })
  proteinas: number

  @ApiProperty({ example: 10, description: 'Gramos de grasa aportados' })
  grasa: number

  @ApiPropertyOptional({ description: 'URL de la imagen del alimento' })
  urlImage?: string | null
}

export class CrearPlanNutricionalDto {
  @ApiProperty({ example: '2025-05-20', description: 'Fecha del plan diario' })
  @IsNotEmpty()
  @IsString()
  fecha: string

  @ApiProperty({ example: 'UUID o ID de usuario rol del paciente' })
  @IsNotEmpty()
  @IsString()
  idUsuarioRol: string

  @ApiPropertyOptional({
    type: [PlanAlimentoDto],
    description: 'Listado de alimentos asignados manualmente',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanAlimentoDto)
  alimentos?: PlanAlimentoDto[]

  @ApiPropertyOptional({
    description:
      'Indica si se debe generar automáticamente el plan a partir de la evaluación más reciente',
  })
  @IsOptional()
  @IsBoolean()
  autoGenerar?: boolean

  @ApiPropertyOptional({
    description: 'Recomendaciones adicionales ingresadas por el profesional',
  })
  @IsOptional()
  @IsString()
  recomendaciones?: string
}

export class GenerarPlanNutricionalDto {
  @ApiProperty({ example: '2025-05-20', description: 'Fecha a planificar' })
  @IsNotEmpty()
  @IsString()
  fecha: string

  @ApiProperty({ description: 'Identificador del paciente (idUsuarioRol)' })
  @IsNotEmpty()
  @IsString()
  idUsuarioRol: string

  @ApiPropertyOptional({
    description:
      'Si es verdadero y existe un plan activo para la fecha, se devolverá ese plan en lugar de generar uno nuevo',
  })
  @IsOptional()
  @IsBoolean()
  reutilizarPlanExistente?: boolean
}

export class ActualizarPlanNutricionalDto {
  @ApiPropertyOptional({ type: [PlanAlimentoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanAlimentoDto)
  alimentos?: PlanAlimentoDto[]

  @ApiPropertyOptional({
    description:
      'Regenerar automáticamente el plan a partir de la última evaluación',
  })
  @IsOptional()
  @IsBoolean()
  autoGenerar?: boolean

  @ApiPropertyOptional({ description: 'Recomendaciones actualizadas' })
  @IsOptional()
  @IsString()
  recomendaciones?: string
}

export class PlanNutricionalDetalleResponseDto {
  @ApiPropertyOptional({ description: 'Identificador del plan nutricional' })
  id?: string

  @ApiProperty({ description: 'Fecha del plan' })
  fecha: string

  @ApiProperty({ description: 'Identificador del paciente (UsuarioRol)' })
  idPaciente: string

  @ApiPropertyOptional({
    description: 'Evaluación nutricional utilizada como referencia',
  })
  idEvaluacionNutricional?: string | null

  @ApiPropertyOptional({
    description: 'Calorías objetivo derivadas de la evaluación',
  })
  caloriasObjetivo?: number | null

  @ApiPropertyOptional({
    type: PlanNutricionalDistribucionMacronutrientesResponseDto,
  })
  distribucionMacronutrientes?: PlanNutricionalDistribucionMacronutrientesResponseDto | null

  @ApiPropertyOptional({ type: PlanNutricionalDistribucionCaloricaResponseDto })
  distribucionCalorica?: PlanNutricionalDistribucionCaloricaResponseDto | null

  @ApiProperty({
    description: 'Indica si el plan fue generado automáticamente',
  })
  esGeneradoAutomatico: boolean

  @ApiPropertyOptional({
    description: 'Recomendaciones sugeridas para el paciente',
  })
  recomendaciones?: string | null

  @ApiProperty({
    type: [PlanNutricionalAlimentoResponseDto],
    description: 'Detalle de alimentos que componen el plan',
  })
  alimentos: PlanNutricionalAlimentoResponseDto[]
}

export class PlanNutricionalGeneradoResponseDto extends PlanNutricionalDetalleResponseDto {
  @ApiProperty({
    description:
      'Indica si el plan ha sido persistido en base de datos o es una previsualización',
  })
  persistido: boolean
}
