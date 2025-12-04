import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CrearEtiquetaDto {
  @ApiProperty({
    description: 'Nombre visible de la etiqueta',
    example: 'Urgente',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre!: string

  @ApiProperty({
    description: 'Color en formato hexadecimal',
    example: '#ff3366',
  })
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  colorHex!: string
}

export class ActualizarEtiquetaDto extends PartialType(CrearEtiquetaDto) {
  @ApiProperty({
    description: 'Permite reactivar o desactivar la etiqueta',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}

export class EtiquetaResponseDto {
  @ApiProperty({
    description: 'Identificador único de la etiqueta',
    example: '10',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre visible de la etiqueta',
    example: 'Urgente',
  })
  nombre!: string

  @ApiProperty({
    description: 'Color en formato hexadecimal',
    example: '#ff3366',
  })
  colorHex!: string

  @ApiProperty({ description: 'Estado del registro', example: 'ACTIVO' })
  estado!: string
}

export class EtiquetaDeleteResponseDto {
  @ApiProperty({
    description: 'Identificador único de la etiqueta',
    example: '10',
  })
  id!: string
}
