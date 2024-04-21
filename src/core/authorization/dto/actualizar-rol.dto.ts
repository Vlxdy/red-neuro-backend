import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from '@/common/validation'

export class ActualizarRolDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'ADMINISTRADOR' })
  rol: string

  @IsNotEmpty()
  @ApiProperty({ example: 'Administrador' })
  nombre: string

  @ApiProperty({ example: 'Descripción' })
  @IsNotEmpty()
  descripcion: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string
}
