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
}: CrearEvaluacionNutricionalParams) {
  try {
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
  } catch (err) {
    console.error(
      '❌ Error al crear evaluación nutricional:',
      err.response?.data || err.message
    )
    throw err
  }
}

export async function generarEvaluacionNutricional({
  pacientesCitasGeneradas,
}: {
  pacientesCitasGeneradas: Array<PacienteCitasGeneradas>
}) {
  for await (const element of pacientesCitasGeneradas) {
    const paciente = element.paciente
    const citas = element.citas
    const evaluacionesGenerada: Array<DatosNutricionalesFake> = []
    for await (const cita of citas) {
      const historia = await getHistoriaClinicaPorPaciente({
        idPaciente: paciente.id,
      })

      if (!dayjs(cita.fechaInicio).isBefore(dayjs())) continue
      if (!historia || !historia.id) {
        console.error(
          `❌ No se encontró historia clínica para el paciente ${paciente.nombres}`
        )
        continue
      }
      const fechaNacimiento = paciente.fechaNacimiento
      const edad = dayjs().diff(dayjs(fechaNacimiento), 'year')
      const evaluacionGenerada = generarDiagnosticoNutricional(
        (paciente.genero as Genero) ?? Genero.MASCULINO,
        {
          edad,
          ...(evaluacionesGenerada.length > 0
            ? evaluacionesGenerada[evaluacionesGenerada.length - 1]
            : {}),
        }
      )

      const evaluacion = await crearEvaluacionNutricional({
        idHistoria: historia.id,
        diagnostico: `${evaluacionGenerada.clasificacion} - ${evaluacionGenerada.comentario}`,
        peso: parseFloat(evaluacionGenerada.peso.replace(' kg', '')),
        pesoObjetivo: parseFloat(
          evaluacionGenerada.pesoObjetivo.replace(' kg', '')
        ),
        estatura: parseInt(evaluacionGenerada.altura.replace(' cm', '')),
        idCita: cita.id,
      })

      console.log(
        `✅ Evaluación nutricional creada para el paciente ${paciente.nombres} en la cita ${cita.detalle}:`,
        evaluacion
      )
    }
  }
}
