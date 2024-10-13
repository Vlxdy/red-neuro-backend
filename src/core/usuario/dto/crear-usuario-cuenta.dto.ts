import { ApiProperty, OmitType } from '@nestjs/swagger'
import {
  CorreoLista,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from '@/common/validation'
import { Type } from 'class-transformer'
import { PersonaDto } from './persona.dto'

class CustomPersonaDto extends OmitType(PersonaDto, [
  'tipoDocumento',
  'uuidCiudadano',
  'telefono',
] as const) {}

export class CrearUsuarioCuentaDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CustomPersonaDto)
  persona: CustomPersonaDto

  @ApiProperty({ example: '123456@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  @CorreoLista()
  correoElectronico: string

  @ApiProperty({ example: 'AGEPIC.admin135' })
  @IsString()
  @IsNotEmpty()
  contrasenaNueva: string
}
