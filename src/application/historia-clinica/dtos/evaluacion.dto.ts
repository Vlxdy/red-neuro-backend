import { IsNumber, IsOptional, IsString, Max, Min } from '@/common/validation'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { MinLength } from 'class-validator'

export class CrearEvaluacionDto {
  // @ApiProperty({
  //   description: 'Peso del paciente (en kilogramos)',
  //   example: 70,
  //   minimum: 1,
  //   maximum: 500,
  // })
  // @Type(() => Number)
  // @IsNumber({ maxDecimalPlaces: 2 })
  // @Min(1, { message: 'El peso debe ser mayor a 0 kg.' })
  // @Max(500, { message: 'El peso no puede superar los 500 kg.' })
  // peso: number

  // @ApiProperty({
  //   description: 'Talla del paciente en centímetros',
  //   example: 175,
  //   minimum: 30,
  //   maximum: 250,
  // })
  // @Type(() => Number)
  // @IsNumber({ maxDecimalPlaces: 2 })
  // @Min(30, { message: 'La talla debe ser mayor a 30 cm.' })
  // @Max(250, { message: 'La talla no puede superar los 250 cm.' })
  // talla: number

  @ApiProperty({
    description: 'Requerimiento calórico diario del paciente (en kilocalorías)',
    example: 2000,
    minimum: 500,
    maximum: 10000,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(500, {
    message: 'El requerimiento calórico debe ser al menos 500 kcal.',
  })
  @Max(10000, {
    message: 'El requerimiento calórico no puede exceder los 10000 kcal.',
  })
  requerimientoCalorico: number

  // @ApiProperty({
  //   description: 'Índice de masa corporal del paciente',
  //   example: 22.86,
  // })
  // @IsOptional()
  // @Type(() => Number)
  // @IsNumber({ maxDecimalPlaces: 2 })
  imc?: number

  @ApiProperty({
    description: 'Diagnóstico del paciente',
    example: 'Paciente con sobrepeso',
  })
  @IsOptional()
  @IsString()
  diagnostico?: string
}

export class CreateEvaluacionAntropometricaDto {
  // Medidas básicas
  @ApiProperty({ example: 70.5, description: 'Masa corporal (kg)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  peso?: number

  @ApiPropertyOptional({ example: 68, description: 'Peso en competición (kg)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  pesoCompeticion?: number

  @ApiPropertyOptional({ example: 65, description: 'Peso objetivo (kg)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  pesoObjetivo?: number

  @ApiPropertyOptional({ example: 170, description: 'Estatura (cm)' })
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(250)
  estatura?: number

  @ApiPropertyOptional({ example: 175, description: 'Envergadura (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(250)
  envergadura?: number

  @ApiPropertyOptional({ example: 85, description: 'Estatura sentada (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(250)
  estaturaSentada?: number

  // Pliegues cutáneos
  @ApiPropertyOptional({
    example: 12.5,
    description: 'Pliegue tricipital (mm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  triceps?: number

  @ApiPropertyOptional({
    example: 10,
    description: 'Pliegue subescapular (mm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subescapular?: number

  @ApiPropertyOptional({ example: 8, description: 'Pliegue bíceps (mm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  biceps?: number

  @ApiPropertyOptional({
    example: 15,
    description: 'Pliegue cresta ilíaca (mm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  crestaIliaca?: number

  @ApiPropertyOptional({
    example: 14,
    description: 'Pliegue supraespinal (mm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  supraEspinal?: number

  @ApiPropertyOptional({ example: 18, description: 'Pliegue abdominal (mm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  abdominal?: number

  @ApiPropertyOptional({ example: 20, description: 'Pliegue muslo (mm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  muslo?: number

  @ApiPropertyOptional({ example: 10, description: 'Pliegue pierna (mm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pierna?: number

  // Perímetros
  @ApiPropertyOptional({ example: 30.5, description: 'Brazo relajado (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brazoRelajado?: number

  @ApiPropertyOptional({ example: 32, description: 'Brazo contraído (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brazoFlexContraido?: number

  @ApiPropertyOptional({ example: 85, description: 'Cintura (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(200)
  cintura?: number

  @ApiPropertyOptional({ example: 95, description: 'Caderas (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  caderas?: number

  @ApiPropertyOptional({ example: 55, description: 'Muslo medio (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  musloMedio?: number

  @ApiPropertyOptional({ example: 40, description: 'Pierna (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  piernaPerimetro?: number

  // Diámetros
  @ApiPropertyOptional({
    example: 7.5,
    description: 'Diámetro del húmero (cm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  humero?: number

  @ApiPropertyOptional({
    example: 6.8,
    description: 'Diámetro bi estilóideo (cm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  biEstiloideo?: number

  @ApiPropertyOptional({ example: 9.2, description: 'Diámetro del fémur (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  femur?: number

  // Diagnóstico y requerimiento
  @ApiPropertyOptional({
    example: 2000,
    description: 'Requerimiento calórico estimado (kcal)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(500)
  @Max(10000)
  requerimientoCalorico?: number

  @ApiPropertyOptional({
    example: 'Paciente con sobrepeso grado I',
    description: 'Diagnóstico nutricional clínico',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  diagnostico?: string

  imc?: number | null
  masaGrasa?: number | null
  masaLibreGrasa?: number | null
  relacionCinturaCadera?: number | null
  pesoResidual?: number | null
}
