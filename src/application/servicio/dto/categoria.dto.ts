import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from '@/common/validation'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

export class ListarCategoriasQueryDto extends PaginacionQueryDto {}

export class CrearCategoriaDto {
  @ApiProperty({
    description: 'Nombre visible de la categoría',
    example: 'Cardiología',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional de la categoría',
    required: false,
    example: 'Categoría enfocada en corazón y sistema vascular.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string

  @ApiProperty({
    description: 'Color identificador de la categoría (hexadecimal)',
    required: false,
    example: '#ef4444',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6})$/)
  colorHex?: string
}

export class CategoriaResponseDto {
  @ApiProperty({
    description: 'Identificador único de la categoría',
    example: '1',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre visible de la categoría',
    example: 'Cardiología',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional de la categoría',
    required: false,
  })
  descripcion?: string

  @ApiProperty({
    description: 'Color identificador de la categoría',
    required: false,
    example: '#ef4444',
  })
  colorHex?: string

  @ApiProperty({ description: 'Estado del registro', example: 'ACTIVO' })
  estado!: string
}

export class ActualizarCategoriaDto extends PartialType(CrearCategoriaDto) {
  @ApiProperty({
    description: 'Permite reactivar o desactivar la categoría',
    required: false,
    example: 'ACTIVO',
  })
  @IsOptional()
  @IsString()
  estado?: 'ACTIVO' | 'INACTIVO'
}
