import { IsNumber, IsOptional, IsString, Max, Min } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CrearEvaluacionDto {
  @ApiProperty({
    description: 'Peso del paciente (en kilogramos)',
    example: 70,
    minimum: 1,
    maximum: 500,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1, { message: 'El peso debe ser mayor a 0 kg.' })
  @Max(500, { message: 'El peso no puede superar los 500 kg.' })
  peso: number

  @ApiProperty({
    description: 'Talla del paciente en centímetros',
    example: 175,
    minimum: 30,
    maximum: 250,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30, { message: 'La talla debe ser mayor a 30 cm.' })
  @Max(250, { message: 'La talla no puede superar los 250 cm.' })
  talla: number

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
