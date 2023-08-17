import { IsOptional } from 'class-validator'

export class ActualizarUsuarioDto {
  @IsOptional()
  estado?: string | null
  @IsOptional()
  correoElectronico?: string
  @IsOptional()
  contrasena?: string | null
  @IsOptional()
  intentos?: number | null
  @IsOptional()
  fechaBloqueo?: string | null
  @IsOptional()
  codigoDesbloqueo?: string | null
  @IsOptional()
  codigoActivacion?: string | null

  @IsOptional()
  codigoTransaccion?: string | null

  @IsOptional()
  codigoRecuperacion?: string | null

  @IsOptional()
  ciudadaniaDigital?: boolean | null
}
