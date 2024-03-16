import { CorreoLista, IsEmail, IsNotEmpty } from '@/common/validation'

export class UsuarioDto {
  usuario?: string

  estado?: string

  contrasena?: string

  @IsNotEmpty()
  @IsEmail()
  @CorreoLista()
  correoElectronico: string

  ciudadaniaDigital?: boolean

  usuarioCreacion?: string
}
