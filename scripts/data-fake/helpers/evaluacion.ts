import dayjs from 'dayjs'
import {
  DatosNutricionalesFake,
  generarDiagnosticoNutricional,
} from '../utils/evaluacion'
import { PacienteCitasGeneradas } from './citas'
import { getHistoriaClinicaPorPaciente } from './historia'
import defaultApi from './loginNutriologo'
import type { AxiosInstance } from 'axios'
import { Genero } from '@/common/constants'

interface CrearEvaluacionNutricionalParams {
  idHistoria: string
  diagnostico: string
  peso: number
  pesoObjetivo: number
  estatura: number
  idCita: string
  api?: AxiosInstance
}

export async function crearEvaluacionNutricional({
  idHistoria,
  diagnostico,
  peso,
  pesoObjetivo,
  estatura,
  idCita,
  api = defaultApi,
}: CrearEvaluacionNutricionalParams): Promise<any> {
  // Specify return type if known, e.g., Promise<EvaluacionNutricionalResponse>
  try {
    // No logging here for successful individual creations to keep console clean
    const res = await api.post(
      `/historia-clinica/${idHistoria}/evaluacion-nutricional`,
      {
        diagnostico,
        peso,
        pesoObjetivo,
        estatura,
        idCita,
        forzarFecha: true,
      }
    )
    return res.data
  } catch (err: any) {
    // Type 'err' as 'any' or 'unknown'
    const errorMessage =
      err.response?.data?.message || err.message || 'Error desconocido'
    // Log detailed error with indentation and context
    console.error(
      `       ❌ Error al crear evaluación para Historia ${idHistoria} (Cita: ${idCita}): ${errorMessage}`
    )
    throw err // Re-throw to propagate the error up to `generarEvaluacionNutricional`
  }
}

export async function generarEvaluacionNutricional({
  pacientesCitasGeneradas,
}: {
  pacientesCitasGeneradas: Array<PacienteCitasGeneradas>
}) {
  let totalEvaluacionesCreadas = 0
  console.log(
    `   Iniciando generación de evaluaciones nutricionales para ${pacientesCitasGeneradas.length} pacientes...`
  )

  for await (const element of pacientesCitasGeneradas) {
    const paciente = element.paciente
    const citas = element.citas
    const pacienteIdentifier =
      paciente.nroDocumento || paciente.correoElectronico || paciente.id
    console.log(
      `     🔄 Procesando evaluaciones para paciente: ${paciente.nombres} ${paciente.primerApellido} (${pacienteIdentifier})`
    )

    const evaluacionesGeneradasParaPaciente: Array<DatosNutricionalesFake> = [] // Store generated fake data for continuity

    let evaluacionesCountForThisPaciente = 0

    for await (const cita of citas) {
      // Only process future or current appointments for consistency in the test.
      // Or consider if you truly want to simulate past appointments.
      // Based on your original code: `if (!dayjs(cita.fechaInicio).isBefore(dayjs())) continue`
      // I'll keep the logic, but note the current date is June 10, 2025.
      if (!dayjs(cita.fechaInicio).isBefore(dayjs())) {
        console.log(
          `       ⚠️ Saltando evaluación para cita ${cita.id} (${cita.detalle}): La fecha (${dayjs(cita.fechaInicio).format('DD/MM/YYYY')}) no es anterior a la actual.`
        )
        continue
      }

      const historia = await getHistoriaClinicaPorPaciente({
        idPaciente: paciente.id,
      })

      if (!historia || !historia.id) {
        console.error(
          `       ❌ No se encontró historia clínica para el paciente ${pacienteIdentifier}. Saltando evaluaciones para este paciente.`
        )
        break // Break from current patient's appointments if no history found
      }

      const fechaNacimiento = paciente.fechaNacimiento
      const edad = dayjs().diff(dayjs(fechaNacimiento), 'year')

      // Get previous evaluation data for continuity or an empty object if it's the first
      const previousEvaluationData =
        evaluacionesGeneradasParaPaciente.length > 0
          ? evaluacionesGeneradasParaPaciente[
              evaluacionesGeneradasParaPaciente.length - 1
            ]
          : {}

      const evaluacionGeneradaData = generarDiagnosticoNutricional(
        (paciente.genero as Genero) ?? Genero.MASCULINO,
        {
          edad,
          ...previousEvaluationData,
        }
      )

      try {
        await crearEvaluacionNutricional({
          idHistoria: historia.id,
          diagnostico: `${evaluacionGeneradaData.clasificacion} - ${evaluacionGeneradaData.comentario}`,
          peso: parseFloat(evaluacionGeneradaData.peso.replace(' kg', '')),
          pesoObjetivo: parseFloat(
            evaluacionGeneradaData.pesoObjetivo.replace(' kg', '')
          ),
          estatura: parseInt(evaluacionGeneradaData.altura.replace(' cm', '')),
          idCita: cita.id,
        })

        // Store generated data for the next iteration for this patient
        evaluacionesGeneradasParaPaciente.push(evaluacionGeneradaData)

        // This log is for successful individual evaluation creation within the patient's context
        console.log(`       ✅ Evaluación creada para cita (ID: ${cita.id}).`)
        evaluacionesCountForThisPaciente++
        totalEvaluacionesCreadas++
      } catch (innerError) {
        // Error already logged by crearEvaluacionNutricional. Continue to next cita.
      }
    }
    if (evaluacionesCountForThisPaciente > 0) {
      console.log(
        `     ✅ ${evaluacionesCountForThisPaciente} evaluaciones creadas para el paciente ${pacienteIdentifier}.`
      )
    } else {
      console.warn(
        `     ⚠️ No se pudo crear ninguna evaluación para el paciente ${pacienteIdentifier}.`
      )
    }
  }

  console.log(
    `   Finalizada la generación de evaluaciones nutricionales. Total de evaluaciones creadas: ${totalEvaluacionesCreadas}.`
  )
  return totalEvaluacionesCreadas // Return count for summary if needed
}
