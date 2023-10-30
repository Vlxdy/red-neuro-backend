import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CrearRolDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'CONSULTA' })
  rol: string

  @IsNotEmpty()
  @ApiProperty({ example: 'Consulta' })
  nombre: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string
}
