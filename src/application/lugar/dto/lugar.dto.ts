import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from '@/common/validation'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { TipoLugar } from '../constants'

export class CrearLugarDto {
  @ApiProperty({
    description: 'Nombre de la lugar',
    example: 'Hospital General',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string

  @ApiProperty({ description: 'Sigla de la lugar', example: 'HGR' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  sigla?: string

  @ApiProperty({
    description: 'Dirección del lugar',
    example: 'Av. Siempre Viva #123',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccion?: string

  @ApiProperty({
    enum: TipoLugar,
    description: 'Tipo de lugar',
    example: TipoLugar.HOSPITAL,
  })
  @IsEnum(TipoLugar)
  tipo!: TipoLugar
}

export class ActualizarLugarDto extends PartialType(CrearLugarDto) {
  @ApiProperty({
    description: 'Estado del registro',
    required: false,
    example: 'ACTIVO',
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}

export class LugarResponseDto {
  @ApiProperty({ description: 'Identificador de la lugar', example: '1' })
  id!: string

  @ApiProperty({
    description: 'Nombre de la lugar',
    example: 'Hospital General',
  })
  nombre!: string

  @ApiProperty({ description: 'Sigla de la lugar', example: 'HGR' })
  sigla!: string

  @ApiProperty({
    description: 'Dirección de la lugar',
    example: 'Av. Siempre Viva #123',
  })
  direccion!: string

  @ApiProperty({
    enum: TipoLugar,
    description: 'Tipo de lugar',
    example: TipoLugar.HOSPITAL,
  })
  tipo!: TipoLugar

  @ApiProperty({ description: 'Estado del lugar', example: 'ACTIVO' })
  estado!: string
}
