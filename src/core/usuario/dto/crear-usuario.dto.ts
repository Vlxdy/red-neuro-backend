import { ApiProperty } from '@nestjs/swagger'
import {
  CorreoLista,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
} from '@/common/validation'
import { PersonaDto } from './persona.dto'
import { Type } from 'class-transformer'

export class CrearUsuarioDto {
  usuario?: string
  estado?: string
  contrasena?: string
  @ApiProperty({ example: '123456@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  @CorreoLista()
  correoElectronico: string
  @ApiProperty()
  @ValidateNested()
  @Type(() => PersonaDto)
  persona: PersonaDto

  ciudadaniaDigital?: boolean

  @IsNotEmpty()
  @ApiProperty({ example: ['1'] })
  roles: Array<string>
  usuarioCreacion?: string
}
