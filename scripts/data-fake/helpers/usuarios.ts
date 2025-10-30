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

interface PacientePayload {
  usuario?: string
  contrasena: string
  repetirContrasena: string
  correoElectronico: string
  persona: {
    tipoDocumento?: string
    nroDocumento: string
    nombres: string
    primerApellido?: string
    segundoApellido?: string
    fechaNacimiento: string
    genero: string
    telefono?: string
  }
}

let userIdCounter = 0
function generateUniqueUserId() {
  return ++userIdCounter
}

export async function crearUsuario(payload: UsuarioPayload): Promise<void> {
  const userIdentifier =
    payload.nroDocumento || payload.correoElectronico || 'Usuario Desconocido' // Use a unique identifier for logging
  const internalId = generateUniqueUserId() // Generate an internal ID for this specific run

  try {
    const response = await apiAdmin.post('/usuarios', payload)

    if (response.status !== 201) {
      // Log errors clearly
      console.error(
        `[${internalId}] ❌ ERROR al crear usuario ${userIdentifier}: ${response.statusText} (Status: ${response.status})`
      )
      throw new Error(`Error al crear usuario: ${response.statusText}`)
    }

    // Log success with key details
    console.log(
      `[${internalId}] ✅ Usuario ${userIdentifier} creado exitosamente. ID del servidor: ${response.data.datos.id || 'N/A'}`
    )
    // You can log more response.data fields if they are relevant, e.g., response.data.message
  } catch (error: any) {
    // Type 'error' as 'any' or 'unknown' and handle appropriately
    // Ensure error messages are useful
    const errorMessage =
      error.response?.data?.message || error.message || 'Error desconocido'
    console.error(
      `[${internalId}] ❌ Fallo en la creación del usuario ${userIdentifier}: ${errorMessage}`
    )
    // Re-throw if you want the error to propagate and potentially stop the batch
    throw error
  }
}

async function crearPaciente(payload: PacientePayload): Promise<void> {
  const userIdentifier =
    payload.persona.nroDocumento ||
    payload.correoElectronico ||
    'Paciente Desconocido'
  const internalId = generateUniqueUserId()

  try {
    const response = await apiAdmin.post('/pacientes', payload)

    if (response.status !== 201) {
      console.error(
        `[${internalId}] ❌ ERROR al crear paciente ${userIdentifier}: ${response.statusText} (Status: ${response.status})`
      )
      throw new Error(`Error al crear paciente: ${response.statusText}`)
    }

    console.log(
      `[${internalId}] ✅ Paciente ${userIdentifier} creado exitosamente. ID del servidor: ${response.data.datos.id || 'N/A'}`
    )
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Error desconocido'
    console.error(
      `[${internalId}] ❌ Fallo en la creación del paciente ${userIdentifier}: ${errorMessage}`
    )
    throw error
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

async function crearPacienteDesdeFake(usuario: UsuarioFake): Promise<void> {
  const contrasena = '123'
  await crearPaciente({
    usuario: usuario.usuario,
    contrasena,
    repetirContrasena: contrasena,
    correoElectronico: usuario.correoElectronico,
    persona: {
      tipoDocumento: usuario.persona.tipoDocumento,
      nroDocumento: usuario.persona.nroDocumento,
      nombres: usuario.persona.nombres,
      primerApellido: usuario.persona.primerApellido,
      segundoApellido: usuario.persona.segundoApellido,
      fechaNacimiento: usuario.persona.fechaNacimiento,
      genero: usuario.persona.genero.toUpperCase(),
      telefono: usuario.persona.telefono,
    },
  })
}

export async function registrarUsuariosEnGrupos(
  personasFake: UsuarioFake[],
  ajuste: number = 0
): Promise<void> {
  const BATCH_SIZE = 20 // Modificar este valor si el servidor no soporta más usuarios por lote
  const totalUsers = personasFake.length - ajuste // Adjust for your loop's starting index
  let usersProcessed = 0

  console.log(
    `\n--- Iniciando registro de ${totalUsers} pacientes en lotes de ${BATCH_SIZE} ---`
  )

  for (let i = 2; i < personasFake.length; i += BATCH_SIZE) {
    const batch = personasFake.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.floor((i - 2) / BATCH_SIZE) + 1 // Calculate current batch number
    const startUserIndex = i - 2 // User index relative to the start of processing
    const endUserIndex = Math.min(i + BATCH_SIZE - 3, totalUsers - 1) // Adjusted end index

    console.log(
      `\n--- Procesando lote ${batchNumber}/${Math.ceil(totalUsers / BATCH_SIZE)} (Usuarios ${startUserIndex + 1} - ${endUserIndex + 1}) ---`
    )

    const promises = batch.map((element) => crearPacienteDesdeFake(element))

    try {
      await Promise.all(promises)
      usersProcessed += batch.length
      console.log(
        `--- Lote ${batchNumber} completado. Total de pacientes procesados: ${usersProcessed}/${totalUsers} ---`
      )
    } catch (error) {
      console.error(
        `--- ⚠️ ERROR: Un error ocurrió en el lote ${batchNumber}. Deteniendo el proceso del lote. ---`
      )
      // Decide if you want to stop all processing on a batch error or continue
      // For now, it will log and continue to the next batch.
      // If you want to stop completely: throw error;
    }
  }
  console.log(
    `\n--- Proceso de registro de pacientes finalizado. Se procesaron ${usersProcessed} de ${totalUsers} pacientes. ---`
  )
}
