import dayjs from 'dayjs'
import defaultApi from './loginNutriologo'
import type { AxiosInstance } from 'axios'
import { UsuarioRolResponse } from '@/common/types/data-response.type'
import { generarCitasSinSolapamiento } from '../utils/fecha-citas'
import { detallesCita, obtenerElementoAleatorio } from './detalles_cita'

interface CrearCitaParams {
  detalle: string
  fechaInicio: string // ISO con zona horaria, ej: "2025-05-28T01:00:00-04:00"
  idPaciente: string
  api?: AxiosInstance
}

export async function crearCita({
  detalle,
  fechaInicio,
  idPaciente,
  api = defaultApi,
}: CrearCitaParams): Promise<string> {
  // Explicitly define return type as string
  const inicio = dayjs(fechaInicio)
  const fin = inicio.add(1, 'hour') // Assuming all appointments are 1 hour long

  try {
    // No logging here to keep console clean for individual successful creations
    const res = await api.post('/citas', {
      detalle,
      fechaInicio: inicio.toISOString(),
      fechaFin: fin.toISOString(),
      idPaciente,
    })

    if (res?.data?.datos?.id) {
      // Return the ID on success, no console.log here
      return res.data.datos.id as string
    }
    // If we get a response but no ID, it's still an issue
    throw new Error('No se recibió el ID de la cita creada en la respuesta.')
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message || err.message || 'Error desconocido'

    console.error(
      `❌ Error al crear cita para paciente ${idPaciente} (${dayjs(fechaInicio).format('DD/MM HH:mm')}): ${errorMessage}`
    )

    // Si el error tiene un cuerpo JSON completo, mostrarlo formateado
    if (err.response?.data && typeof err.response.data === 'object') {
      console.log(detalle, fechaInicio, idPaciente)

      console.error(
        '🧩 Cuerpo completo del error:',
        JSON.stringify(err.response.data, null, 2)
      )
    } else if (typeof err.response?.data === 'string') {
      console.error('🧩 Respuesta del servidor (texto):', err.response.data)
    }
    throw err
  }
}
type Cita = { inicio: string; fin: string }
type CitaGenerada = {
  fechaInicio: string
  detalle: string
  id: string
}
export type PacienteCitasGeneradas = {
  paciente: UsuarioRolResponse
  citas: Array<CitaGenerada>
}

export interface DataDevuelto {
  PacienteCitasCreadas: Array<PacienteCitasGeneradas>
  TotalCitasCreada: number
}

export async function generarCitas({
  pacientes,
  fechaBase,
}: {
  fechaBase: string
  pacientes: UsuarioRolResponse[]
}): Promise<DataDevuelto> {
  const allGeneratedCitas: Cita[] = [] // Track all generated citas to prevent overlaps
  const response: Array<PacienteCitasGeneradas> = []
  let totalCitasCreated = 0

  console.log(`   Generando citas para ${pacientes.length} pacientes...`)

  for await (const paciente of pacientes) {
    const pacienteIdentifier =
      paciente.nroDocumento || paciente.correoElectronico || paciente.id
    console.log(
      `     🔄 Procesando citas para paciente: ${paciente.nombres} ${paciente.primerApellido} (${pacienteIdentifier})`
    )

    const citasForPaciente = generarCitasSinSolapamiento(
      fechaBase,
      allGeneratedCitas
    )
    const citasConPaciente: CitaGenerada[] = []

    if (!citasForPaciente || citasForPaciente.length === 0) {
      console.warn(
        `     ⚠️ No se pudieron generar bloques de citas sin solapamiento para el paciente ${pacienteIdentifier}.`
      )
      continue // Move to the next patient if no valid slots found
    }

    // Add newly generated slots to the global tracker
    allGeneratedCitas.push(...citasForPaciente)

    let citasCountForThisPaciente = 0
    for await (const cita of citasForPaciente) {
      const detalle =
        obtenerElementoAleatorio<string>(detallesCita) ?? 'Consulta general'
      try {
        const idCita = await crearCita({
          detalle,
          fechaInicio: cita.inicio,
          idPaciente: paciente.id,
          // fechaFin is calculated internally by crearCita now
        })
        if (idCita) {
          citasConPaciente.push({
            fechaInicio: cita.inicio,
            detalle,
            id: idCita,
          })
          citasCountForThisPaciente++
        }
      } catch (innerError) {
        // Error already logged by crearCita. We can choose to continue or break for this patient.
        // For now, we'll continue trying to create other appointments for the same patient.
      }
    }

    if (citasCountForThisPaciente > 0) {
      console.log(
        `     ✅ ${citasCountForThisPaciente} citas creadas para el paciente ${pacienteIdentifier}.`
      )
      totalCitasCreated += citasCountForThisPaciente
    } else {
      console.warn(
        `     ⚠️ No se pudo crear ninguna cita para el paciente ${pacienteIdentifier}.`
      )
    }

    response.push({
      paciente,
      citas: citasConPaciente,
    })
  }

  console.log(
    `   Finalizada la generación de citas. Total de citas creadas: ${totalCitasCreated}.`
  )
  return {
    PacienteCitasCreadas: response,
    TotalCitasCreada: totalCitasCreated,
  }
}
