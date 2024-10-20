import { IsEmail, IsOptional, IsString } from 'class-validator'

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
}
