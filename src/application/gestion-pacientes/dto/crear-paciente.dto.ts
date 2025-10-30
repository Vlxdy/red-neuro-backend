import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { CrearUsuarioDto } from '@/core/usuario/dto/crear-usuario.dto'
import { PersonaDto } from '@/core/usuario/dto/persona.dto'
import { Genero } from '@/common/constants'
import { Transform, Type } from 'class-transformer'
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  NombreApellido,
  NroDocumento,
  ValidateNested,
} from '@/common/validation'

class PersonaPacienteDto extends PersonaDto {
  @ApiProperty({ example: '2002-05-04' })
  @IsDateString()
  @IsNotEmpty()
  override fechaNacimiento: Date

  @ApiProperty({ enum: Genero })
  @IsEnum(Genero)
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value
  )
  override genero: Genero
}

class PersonaPacienteActualizarDto {
  @ApiPropertyOptional({ example: '4192299' })
  @IsOptional()
  @NroDocumento()
  @Transform(({ value }) => value?.trim())
  nroDocumento?: string

  @ApiPropertyOptional({ example: 'CI' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  tipoDocumento?: string

  @ApiPropertyOptional({ example: 'MARIELA' })
  @IsOptional()
  @NombreApellido()
  @Transform(({ value }) => value?.trim().toUpperCase())
  nombres?: string

  @ApiPropertyOptional({ example: 'ALCAZAR' })
  @IsOptional()
  @NombreApellido()
  @Transform(({ value }) => value?.trim().toUpperCase())
  primerApellido?: string

  @ApiPropertyOptional({ example: 'ALMARAZ' })
  @IsOptional()
  @NombreApellido()
  @Transform(({ value }) => value?.trim().toUpperCase())
  segundoApellido?: string

  @ApiProperty({ example: '2002-05-04' })
  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento: Date

  @ApiProperty({ enum: Genero })
  @IsEnum(Genero)
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value
  )
  genero: Genero

  @ApiPropertyOptional({ example: '71234567' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
  )
  @Matches(/^\d+$/)
  @MinLength(7)
  @MaxLength(15)
  telefono?: string
}

export class CrearPacienteDto extends OmitType(CrearUsuarioDto, [
  'roles',
] as const) {
  @ApiProperty({ type: PersonaPacienteDto })
  @ValidateNested()
  @Type(() => PersonaPacienteDto)
  override persona: PersonaPacienteDto
}

export class ActualizarPacienteDto {
  @ApiProperty({ type: PersonaPacienteActualizarDto })
  @ValidateNested()
  @Type(() => PersonaPacienteActualizarDto)
  persona: PersonaPacienteActualizarDto

  @ApiPropertyOptional({ example: 'paciente@example.com' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() !== ''
      ? value.trim().toLowerCase()
      : undefined
  )
  @IsEmail()
  correoElectronico?: string
}
