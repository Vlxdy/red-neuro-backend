import { ApiProperty } from '@nestjs/swagger'
import {
  CorreoLista,
  IsEmail,
  IsNotEmpty,
  IsString,
} from '../../../common/validation'

export class CrearUsuarioCuentaDto {
  @ApiProperty()
  nombres: string
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @CorreoLista()
  correoElectronico: string
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contrasenaNueva: string
}
