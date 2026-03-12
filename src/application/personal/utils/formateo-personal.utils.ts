import { OcupacionPersonalDto, PersonalResponseDto } from '../dto/personal.dto'
import dayjs from 'dayjs'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

const formatearOcupacionPersonal = (
  ocupacion: UsuarioRol['usuarioRolOcupaciones'][number]['ocupacion']
): OcupacionPersonalDto => {
  return {
    id: ocupacion.id,
    nombre: ocupacion.nombre,
    descripcion: ocupacion.descripcion,
    estado: ocupacion.estado,
  }
}

export function formatearPersonal(usuarioRol: UsuarioRol): PersonalResponseDto {
  const { usuario } = usuarioRol
  const esSupervisor = usuarioRol.esSupervisor
  return {
    id: usuarioRol.id,
    estado: usuarioRol.estado,
    esSupervisor,
    nroDocumento: usuario.persona.nroDocumento,
    nombres: usuario.persona.nombres,
    primerApellido: usuario.persona.primerApellido,
    segundoApellido: usuario.persona.segundoApellido,
    fechaNacimiento: dayjs(usuario.persona.fechaNacimiento).toISOString(),
    telefono: usuario.persona.telefono,
    correoElectronico: usuario.correoElectronico,
    genero: usuario.persona.genero,
    urlFoto: usuario.urlFoto,
    ocupaciones:
      usuarioRol.usuarioRolOcupaciones?.map((usuarioOcupacion) =>
        formatearOcupacionPersonal(usuarioOcupacion.ocupacion)
      ) ?? [],
  }
}

export function formatearPersonales(
  usuariosRoles: UsuarioRol[]
): PersonalResponseDto[] {
  return usuariosRoles.map((usuarioRol) => formatearPersonal(usuarioRol))
}
