import { UsuarioRolResponse } from '@/common/types/data-response.type'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

export function formatearUsuariosRolesRespuesta(
  usuariosRol: UsuarioRol[]
): Array<UsuarioRolResponse> {
  const data: Array<UsuarioRolResponse> = []
  usuariosRol.forEach((usuarioRol) => {
    const usuarioRolResponse = formatearUsuarioRolRespuesta(usuarioRol)
    data.push(usuarioRolResponse)
  })
  return data
}
export function formatearUsuarioRolRespuesta(
  usuarioRol: UsuarioRol
): UsuarioRolResponse {
  return {
    id: usuarioRol.id,
    nombres: usuarioRol.usuario.persona.nombres,
    primerApellido: usuarioRol.usuario.persona.primerApellido,
    segundoApellido: usuarioRol.usuario.persona.segundoApellido,
    nroDocumento: usuarioRol.usuario.persona.nroDocumento,
    tipoDocumento: usuarioRol.usuario.persona.tipoDocumento,
    genero: usuarioRol.usuario.persona.genero,
    correoElectronico: usuarioRol.usuario.correoElectronico,
    estado: usuarioRol.estado,
  }
}
