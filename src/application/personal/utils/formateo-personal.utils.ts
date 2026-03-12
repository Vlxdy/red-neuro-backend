import { OcupacionPersonalDto, PersonalResponseDto } from '../dto/personal.dto'
import dayjs from 'dayjs'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

const formatearOcupacionPersonal = (
  especialidad: UsuarioRol['usuarioRolOcupaciones'][number]['especialidad']
): OcupacionPersonalDto => {
  return {
    id: especialidad.id,
    nombre: especialidad.nombre,
    descripcion: especialidad.descripcion,
    estado: especialidad.estado,
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
      usuarioRol.usuarioRolOcupaciones?.map((usuarioEspecialidad) =>
        formatearOcupacionPersonal(usuarioEspecialidad.ocupacion)
      ) ?? [],
  }
}

export function formatearPersonales(
  usuariosRoles: UsuarioRol[]
): PersonalResponseDto[] {
  return usuariosRoles.map((usuarioRol) => formatearPersonal(usuarioRol))
}
