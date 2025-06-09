import { UsuarioFake } from '../data/usuarios.fake'
import apiAdmin from './loginAdmin'

interface UsuarioPayload {
  nombres: string
  primerApellido: string
  segundoApellido: string
  nroDocumento: string
  fechaNacimiento: string
  correoElectronico: string
  telefono: string
  roles: string[]
  contrasena: string
  repetirContrasena: string
  persona: {
    nombres: string
    primerApellido: string
    segundoApellido: string
    nroDocumento: string
    fechaNacimiento: string
    telefono: string
  }
}

export async function crearUsuario(payload: UsuarioPayload): Promise<void> {
  try {
    const response = await apiAdmin.post('/usuarios', payload)

    if (response.status !== 201) {
      throw new Error(`Error al crear usuario: ${response.statusText}`)
    }
    console.log('Respuesta del servidor:', response.data)
  } catch (error) {
    console.error('Error al crear usuario:', error)
  }
}

export async function crearArmarUsuario(
  usuario: UsuarioFake,
  roles: string[]
): Promise<void> {
  const contrasena = '123'
  await crearUsuario({
    nombres: usuario.persona.nombres,
    primerApellido: usuario.persona.primerApellido,
    segundoApellido: usuario.persona.segundoApellido,
    nroDocumento: usuario.persona.nroDocumento,
    fechaNacimiento: usuario.persona.fechaNacimiento,
    correoElectronico: usuario.correoElectronico,
    telefono: usuario.persona.telefono,
    roles: roles,
    contrasena: contrasena,
    repetirContrasena: contrasena,
    persona: {
      nombres: usuario.persona.nombres,
      primerApellido: usuario.persona.primerApellido,
      segundoApellido: usuario.persona.segundoApellido,
      nroDocumento: usuario.persona.nroDocumento,
      fechaNacimiento: usuario.persona.fechaNacimiento,
      telefono: usuario.persona.telefono,
    },
  })
}
