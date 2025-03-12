import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from '@/common/validation'
import { RolEnum } from '../rol.enum'

export class ActualizarRolDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'ADMINISTRADOR' })
  rol: RolEnum

  @IsNotEmpty()
  @ApiProperty({ example: 'Administrador' })
  nombre: string

  @ApiProperty({ example: 'Descripción' })
  @IsNotEmpty()
  descripcion: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string
}
