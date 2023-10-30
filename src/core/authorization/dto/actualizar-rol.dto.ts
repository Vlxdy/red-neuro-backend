import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class ActualizarRolDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'ADMINISTRADOR' })
  rol: string

  @IsNotEmpty()
  @ApiProperty({ example: 'Administrador' })
  nombre: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string
}
