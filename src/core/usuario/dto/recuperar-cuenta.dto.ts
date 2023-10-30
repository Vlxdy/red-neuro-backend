import { ApiProperty } from '@nestjs/swagger'
import {
  CorreoLista,
  IsEmail,
  IsNotEmpty,
  IsString,
} from '../../../common/validation'

export class RecuperarCuentaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @CorreoLista()
  @ApiProperty({ example: '123456@gmail.com' })
  correoElectronico: string
}

export class ValidarRecuperarCuentaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  codigo: string
}

export class ActivarCuentaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  codigo: string
}

export class NuevaContrasenaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  codigo: string
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contrasenaNueva: string
}
