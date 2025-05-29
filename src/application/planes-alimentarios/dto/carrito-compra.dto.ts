import { IsNotEmpty, IsString } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

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
