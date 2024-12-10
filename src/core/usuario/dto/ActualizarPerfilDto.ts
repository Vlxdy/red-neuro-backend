import { IsNumberInRangeConstraint, IsNumberString } from '@/common/validation'
import { IsEmail, IsOptional, IsString, Validate } from 'class-validator'

export class ActualizarPerfilDto {
  @IsOptional()
  @IsString()
  nombres?: string

  @IsOptional()
  @IsString()
  primerApellido?: string

  @IsOptional()
  @IsString()
  segundoApellido?: string

  @IsOptional()
  @IsEmail()
  correoElectronico?: string

  @IsOptional()
  @IsNumberString()
  @Validate(IsNumberInRangeConstraint, [60000000, 79999999])
  telefono?: string | null
}
