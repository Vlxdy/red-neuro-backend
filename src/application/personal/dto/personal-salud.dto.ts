import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { CrearUsuarioDto } from '@/core/usuario/dto/crear-usuario.dto'
import { IsIn, IsOptional, IsString, ValidateNested } from '@/common/validation'
import { Type } from 'class-transformer'
import { PersonaDto } from '@/core/usuario/dto/persona.dto'
import { RolEnum } from '@/core/authorization/rol.enum'

export const ROLES_CREABLES_PERSONAL = [
  RolEnum.ADMINISTRADOR,
  RolEnum.JEFE,
  RolEnum.COORDINADOR,
  RolEnum.PERSONAL,
  RolEnum.PROFESIONAL_INVITADO,
] as const

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

  @ApiProperty({
    description:
      'Rol principal a asignar al usuario creado. Jefe puede crear COORDINADOR, PERSONAL o PROFESIONAL_INVITADO; Administrador puede crear cualquier rol.',
    enum: ROLES_CREABLES_PERSONAL,
    example: RolEnum.PERSONAL,
  })
  @IsIn(ROLES_CREABLES_PERSONAL)
  rol!: RolEnum
}

export class ActualizarPersonalSaludDto extends PartialType(
  OmitType(CrearPersonalSaludDto, ['contrasena', 'repetirContrasena'] as const)
) {}
