import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { CrearUsuarioDto } from '@/core/usuario/dto/crear-usuario.dto'
import { IsOptional, IsString, ValidateNested } from '@/common/validation'
import { Type } from 'class-transformer'
import { PersonaDto } from '@/core/usuario/dto/persona.dto'

export class CrearPersonalSaludDto extends OmitType(CrearUsuarioDto, [
  'roles',
] as const) {
  @ApiProperty({
    description: 'Datos personales del profesional de salud',
    type: () => PersonaDto,
  })
  @ValidateNested()
  @Type(() => PersonaDto)
  persona: PersonaDto

  @ApiProperty({
    description: 'Ocupación del profesional de salud',
    example: 'Cardiología',
    required: false,
  })
  @IsOptional()
  @IsString()
  ocupacion?: string
}

export class ActualizarPersonalSaludDto extends PartialType(
  OmitType(CrearPersonalSaludDto, ['contrasena', 'repetirContrasena'] as const)
) {}
