import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CrearPlanAlimentarioDto {
  @ApiProperty({ example: 'Plan de dieta' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ example: 'Descripción del plan de dieta' })
  @IsString()
  @IsOptional()
  descripcion?: string

  @ApiProperty({ example: '2023-10-01' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string

  @ApiProperty({ example: '2023-10-31' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string

  @ApiProperty({
    example: [
      {
        diaSemana: 'Lunes',
        momento: 'Desayuno',
        alimentos: 'Frutas, Verduras',
        calorias: 500,
      },
    ],
  })
  @IsNotEmpty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearDetallePlanDto)
  detalles: CrearDetallePlanDto[]
}

export class CrearDetallePlanDto {
  @ApiProperty({ example: 'Lunes' })
  @IsNotEmpty()
  diaSemana: string

  @ApiProperty({ example: 'Desayuno' })
  @IsNotEmpty()
  momento: string

  @ApiProperty({ example: 'Frutas, Verduras' })
  @IsNotEmpty()
  alimentos: string

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  calorias: number
}
