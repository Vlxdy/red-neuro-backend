import { PersonalResponseDto } from '../dto/personal.dto'
import dayjs from 'dayjs'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { RolEnum } from '@/core/authorization/rol.enum'

function obtenerRolesDesdeUsuario(usuario: Usuario): RolEnum[] | undefined {
  const roles = Array.from(
    new Set(
      (usuario.usuarioRol ?? [])
        .map((usuarioRol) => usuarioRol.rol?.rol)
        .filter((rol): rol is RolEnum => Boolean(rol))
    )
  )

  return roles.length > 0 ? roles : undefined
}

export function formatearUsuarioComoPersonal(
  usuario: Usuario
): PersonalResponseDto {
  return {
    id: usuario.id,
    estado: usuario.usuarioRol?.[0]?.estado ?? usuario.estado,
    roles: obtenerRolesDesdeUsuario(usuario),
    nroDocumento: usuario.persona.nroDocumento,
    nombres: usuario.persona.nombres,
    primerApellido: usuario.persona.primerApellido,
    segundoApellido: usuario.persona.segundoApellido,
    fechaNacimiento: dayjs(usuario.persona.fechaNacimiento).toISOString(),
    telefono: usuario.persona.telefono,
    correoElectronico: usuario.correoElectronico,
    genero: usuario.persona.genero,
    urlFoto: usuario.urlFoto,
    ocupacion: usuario.ocupacion,
  }
}

export function formatearPersonales(
  usuarios: Usuario[]
): PersonalResponseDto[] {
  return usuarios.map((usuario) => formatearUsuarioComoPersonal(usuario))
}
