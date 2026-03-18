import { PersonalResponseDto } from '../dto/personal.dto'
import dayjs from 'dayjs'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'

export function formatearPersonal(usuarioRol: UsuarioRol): PersonalResponseDto {
  const { usuario } = usuarioRol
  return {
    id: usuario.id,
    estado: usuarioRol.estado,
    esSupervisor: usuarioRol.esSupervisor,
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

export function formatearUsuarioComoPersonal(
  usuario: Usuario
): PersonalResponseDto {
  return {
    id: usuario.id,
    estado: usuario.estado,
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
  usuariosRoles: UsuarioRol[]
): PersonalResponseDto[] {
  return usuariosRoles.map((usuarioRol) => formatearPersonal(usuarioRol))
}
