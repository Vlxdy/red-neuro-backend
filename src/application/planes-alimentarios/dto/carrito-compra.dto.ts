import { IsNotEmpty, IsString } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { TipoAlimento } from '../entity/alimento.entity'
import { CategoriaAlimento, UnidadMedida } from '../constant'

export class CrearCarritoCompraDto {
  @ApiProperty({ example: 'Nombre del carrito' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ example: 'id usuario rol' })
  @IsNotEmpty()
  @IsString()
  idUsuarioRol: string
}

export class PlanNutricionalDto {
  @ApiProperty({
    example: '2',
    description: 'Identificador único del plan nutricional o alimento.',
  })
  id: string

  @ApiProperty({
    example: 13.3,
    description: 'Cantidad establecida del alimento dentro del plan.',
  })
  cantidad: number

  @ApiProperty({
    example: 'ACTIVO',
    description: 'Estado actual del alimento en el plan.',
  })
  estado: string

  @ApiProperty({
    enum: TipoAlimento,
    description: 'Tipo de alimento según la categoría del plan.',
    example: TipoAlimento.DESAYUNO,
  })
  tipo: TipoAlimento

  @ApiProperty({
    example: 'Pan integral',
    description: 'Nombre del alimento.',
  })
  nombre: string

  @ApiProperty({
    enum: CategoriaAlimento,
    description: 'Categoría general del alimento.',
    example: CategoriaAlimento.CEREAL,
  })
  categoria: CategoriaAlimento

  @ApiProperty({
    enum: UnidadMedida,
    description: 'Unidad de medida usada para cuantificar el alimento.',
    example: UnidadMedida.REBANADA,
  })
  unidadMedida: UnidadMedida

  @ApiProperty({
    example: 70.0,
    description: 'Cantidad de calorías por porción.',
  })
  calorias: number

  @ApiProperty({
    example: 1.0,
    description: 'Cantidad referencial del alimento (por porción estándar).',
  })
  cantidadReferencial: number

  @ApiProperty({
    example: '14',
    description: 'Identificador del alimento base registrado.',
  })
  idAlimento: string

  @ApiProperty({
    example: '/uploads/food/pan-integral.jpg',
    description: 'Ruta relativa o URL de la imagen del alimento.',
  })
  urlImage: string

  @ApiProperty({
    example: 'Cereal elaborado con harina integral, rico en fibra.',
    description: 'Descripción breve del alimento.',
  })
  descripcion: string

  @ApiProperty({
    example: 12.0,
    description: 'Cantidad de carbohidratos (g) por porción.',
  })
  carbohidratos: number

  @ApiProperty({
    example: 1.0,
    description: 'Cantidad de grasa (g) por porción.',
  })
  grasa: number

  @ApiProperty({
    example: 3.0,
    description: 'Cantidad de proteínas (g) por porción.',
  })
  proteinas: number
}
