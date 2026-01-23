import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from '@/common/validation'
import { PersonaDto } from '@/core/usuario/dto/persona.dto'

export class CambioRolDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1' })
  idRol: string
}

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  token: string
}

export class AuthDto {
  @ApiProperty({
    example: 'ADMINISTRADOR',
    description: 'Usuario',
  })
  usuario: string

  @ApiProperty({
    example: 'MTIz',
    description: 'Contraseña',
  })
  contrasena: string
}

export class ModuloPropiedadesDto {
  @ApiProperty({ example: 'dashboard', nullable: true })
  icono?: string | null

  @ApiProperty({ example: 'Módulo de estadísticas', nullable: true })
  descripcion?: string | null

  @ApiProperty({ example: 1 })
  orden: number
}

class ModuloBaseDto {
  @ApiProperty({ example: '1' })
  id: string

  @ApiProperty({ example: 'Dashboard' })
  label: string

  @ApiProperty({ example: '/admin/dashboard' })
  url: string

  @ApiProperty({ example: 'Dashboard' })
  nombre: string

  @ApiProperty({ type: ModuloPropiedadesDto })
  propiedades: ModuloPropiedadesDto

  @ApiProperty({ example: 'ACTIVE' })
  estado: string
}

export class ModuloSubModuloDto extends ModuloBaseDto {}

export class ModuloPermisoDto extends ModuloBaseDto {
  @ApiProperty({
    type: [ModuloSubModuloDto],
    description: 'Listado de submódulos habilitados para el rol',
  })
  subModulo: ModuloSubModuloDto[]
}

export class RolAutenticadoDto {
  @ApiProperty({ example: '2' })
  idUsuarioRol: string

  @ApiProperty({ example: '1' })
  idRol: string

  @ApiProperty({ example: 'ADMINISTRADOR' })
  rol: string

  @ApiProperty({ example: 'Administrador del sistema', nullable: true })
  nombre?: string | null

  @ApiProperty({
    example: 'Rol con acceso completo a los módulos del sistema',
    nullable: true,
  })
  descripcion?: string | null

  @ApiProperty({
    type: [ModuloPermisoDto],
    description: 'Listado de módulos y permisos habilitados para el rol',
  })
  modulos: ModuloPermisoDto[]

  @ApiProperty({
    description:
      'Indica si el rol de personal de salud cuenta con permisos de supervisión',
    example: false,
    required: false,
  })
  esSupervisor?: boolean
}

export class UsuarioAutenticadoDto {
  @ApiProperty({ example: '1' })
  id: string

  @ApiProperty({ example: 'usuario.demo' })
  usuario: string

  @ApiProperty({ example: 'demo@correo.bo', nullable: true })
  correoElectronico?: string | null

  @ApiProperty({
    example: 'https://mi-servidor.com/usuario.png',
    nullable: true,
  })
  urlFoto?: string | null

  @ApiProperty({ example: 'ACTIVE' })
  estado: string

  @ApiProperty({ type: PersonaDto })
  persona: PersonaDto

  @ApiProperty({ type: [RolAutenticadoDto] })
  roles: RolAutenticadoDto[]
}

export class AuthResponseDto extends UsuarioAutenticadoDto {
  @ApiProperty({ description: 'Token de acceso generado para el usuario' })
  access_token: string

  @ApiProperty({ example: '2', nullable: true })
  idUsuarioRol?: string

  @ApiProperty({ example: '1' })
  idRol: string

  @ApiProperty({ example: 'ADMINISTRADOR' })
  rol: string

  @ApiProperty({
    description:
      'Indica si el rol activo de personal de salud cuenta con permisos de supervisión',
    example: false,
    required: false,
  })
  esSupervisor?: boolean
}

export class AccessTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string
}

export class EmptyDto {}

export class DeleteResultDto {
  @ApiProperty({ example: 1, required: false })
  affected?: number

  @ApiProperty({ type: Object, required: false })
  raw?: Record<string, unknown>
}

export type RefreshTokenHandle = { id: string }

export type AuthenticatedUser = {
  id: string
  roles: Array<string>
}

export type AuthenticatedResponse = {
  refresh_token: RefreshTokenHandle
  data: AuthResponseDto
}

export type AuthenticatedOidcResponse = {
  refresh_token: RefreshTokenHandle
  data: AccessTokenDto
}

export type RefreshTokenResponse = {
  data: AuthResponseDto
  refresh_token: RefreshTokenHandle | null
}
