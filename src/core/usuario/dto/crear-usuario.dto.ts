import { ApiProperty } from '@nestjs/swagger'
import {
  CorreoLista,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from '@/common/validation'
import { PersonaDto } from './persona.dto'
import { Type } from 'class-transformer'
import { RepetirContenido } from '@/common/validation/repetir-contenido'

export class CrearUsuarioDto {
  usuario?: string
  estado?: string

  @ApiProperty({ example: 'AGEPIC.admin135' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  contrasena: string

  @ApiProperty({ example: 'AGEPIC.admin135' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @RepetirContenido('contrasena', { message: 'Las contraseñas no coinciden' })
  repetirContrasena: string

  @ApiProperty({ example: '123456@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  @CorreoLista()
  correoElectronico: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => PersonaDto)
  persona: PersonaDto

  @IsNotEmpty()
  @ApiProperty({ example: ['1'] })
  roles: Array<string>

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    required: false,
    description: 'Habilita permisos de supervisión para el rol PERSONAL_SALUD.',
  })
  esSupervisor?: boolean
  usuarioCreacion?: string
}
