import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from '../../../common/validation'

export class ActualizarParametroDto {
  @ApiProperty({ example: 'TD-CI' })
  @IsNotEmpty()
  @ApiProperty({ example: 'TD-2' })
  codigo: string

  @ApiProperty({ example: 'Cédula de identidad' })
  @IsNotEmpty()
  @ApiProperty({ example: 'Documento de extranjería actualizado' })
  nombre: string

  @ApiProperty({ example: 'CD' })
  @IsNotEmpty()
  @ApiProperty({ example: 'TD' })
  grupo: string

  @ApiProperty({ example: 'Cédula de identidad' })
  descripcion: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string
}
