import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from '../../../common/validation'

export class ActualizarContrasenaDto {
  @ApiProperty({ example: 'contrasena' })
  @IsString()
  @IsNotEmpty()
  contrasenaActual: string

  @ApiProperty({ example: 'contrasena-nueva' })
  @IsString()
  @IsNotEmpty()
  contrasenaNueva: string
}
