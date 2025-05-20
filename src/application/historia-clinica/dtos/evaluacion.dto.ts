import { IsNumber, IsOptional, IsString } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CrearEvaluacionDto {
  @ApiProperty({
    description: 'Peso del paciente',
    example: 70,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  peso?: number

  @ApiProperty({
    description: 'Talla del paciente en centímetros',
    example: 175,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  talla?: number

  @ApiProperty({
    description: 'Índice de masa corporal del paciente',
    example: 22.86,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  imc?: number

  @ApiProperty({
    description: 'Diagnóstico del paciente',
    example: 'Paciente con sobrepeso',
  })
  @IsOptional()
  @IsString()
  diagnostico?: string
}
