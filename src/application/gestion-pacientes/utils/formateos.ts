import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

interface UsuarioRolResponse {
  id: string
  nombres: string
  primerApellido?: string | null
  segundoApellido?: string | null
  nroDocumento: string
  tipoDocumento: string
  genero?: string | null
  correoElectronico?: string | null
  estado: string
}

export function formatearUsuarioRolRespuesta(
  usuariosRol: UsuarioRol[]
): Array<UsuarioRolResponse> {
  const data: Array<UsuarioRolResponse> = []
  usuariosRol.forEach((usuarioRol) => {
    data.push({
      id: usuarioRol.id,
      nombres: usuarioRol.usuario.persona.nombres,
      primerApellido: usuarioRol.usuario.persona.primerApellido,
      segundoApellido: usuarioRol.usuario.persona.segundoApellido,
      nroDocumento: usuarioRol.usuario.persona.nroDocumento,
      tipoDocumento: usuarioRol.usuario.persona.tipoDocumento,
      genero: usuarioRol.usuario.persona.genero,
      correoElectronico: usuarioRol.usuario.correoElectronico,
      estado: usuarioRol.estado,
    })
  })
  return data
}
