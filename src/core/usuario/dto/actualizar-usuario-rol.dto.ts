import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  CorreoLista,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from '@/common/validation'
import { PersonaDto } from './persona.dto'

export class ActualizarUsuarioRolDto {
  @ApiProperty({ example: PersonaDto })
  @ValidateNested()
  @Type(() => PersonaDto)
  persona?: PersonaDto

  @IsNotEmpty()
  @IsEmail()
  @CorreoLista()
  @ValidateIf((o) => o.correoElectronico !== undefined)
  @ApiProperty({ example: 'asdfg123@gmail.com' })
  correoElectronico?: string | null

  @ApiProperty({ example: ['3'] })
  @ValidateIf((o) => o.roles !== undefined)
  @IsNotEmpty()
  @IsArray()
  roles?: Array<string>

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    required: false,
    description: 'Habilita permisos de supervisión para el rol PERSONAL_SALUD.',
  })
  esSupervisor?: boolean
}
