import {
  EspecialidadPersonalDto,
  PersonalResponseDto,
} from '../dto/personal.dto'
import dayjs from 'dayjs'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

const formatearEspecialidadPersonal = (
  especialidad: UsuarioRol['usuarioRolEspecialidades'][number]['especialidad']
): EspecialidadPersonalDto => {
  return {
    id: especialidad.id,
    nombre: especialidad.nombre,
    descripcion: especialidad.descripcion,
    estado: especialidad.estado,
    colorHex: especialidad.colorHex,
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
    especialidades:
      usuarioRol.usuarioRolEspecialidades?.map((usuarioEspecialidad) =>
        formatearEspecialidadPersonal(usuarioEspecialidad.especialidad)
      ) ?? [],
  }
}

export function formatearPersonales(
  usuariosRoles: UsuarioRol[]
): PersonalResponseDto[] {
  return usuariosRoles.map((usuarioRol) => formatearPersonal(usuarioRol))
}
