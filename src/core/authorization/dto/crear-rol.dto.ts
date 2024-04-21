import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from '@/common/validation'

export class CrearRolDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'CONSULTA' })
  rol: string

  @IsNotEmpty()
  @ApiProperty({ example: 'Consulta' })
  nombre: string

  @ApiProperty({ example: 'Descripción' })
  @IsNotEmpty()
  descripcion: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string
}
