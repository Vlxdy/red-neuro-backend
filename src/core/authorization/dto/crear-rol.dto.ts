import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from '@/common/validation'
import { RolEnum } from '../rol.enum'

export class CrearRolDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'CONSULTA' })
  rol: RolEnum

  @IsNotEmpty()
  @ApiProperty({ example: 'Consulta' })
  nombre: string

  @ApiProperty({ example: 'Descripción' })
  @IsNotEmpty()
  descripcion: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string
}
