import { IsNotEmpty } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class ActualizarParametroDto {
  @ApiProperty({ example: 'TD-CI' })
  @IsNotEmpty()
  codigo: string

  @ApiProperty({ example: 'Cédula de identidad' })
  @IsNotEmpty()
  nombre: string

  @ApiProperty({ example: 'CD' })
  @IsNotEmpty()
  grupo: string

  @ApiProperty({ example: 'Cédula de identidad' })
  descripcion: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string
}
