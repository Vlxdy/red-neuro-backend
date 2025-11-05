import dayjs from 'dayjs'
import defaultApi from './loginNutriologo'
import type { AxiosInstance } from 'axios'
import { Genero } from '@/common/constants'
import { PacienteCitasGeneradas } from './citas'

interface DatosEvaluacionNutricional {
  fechaEvaluacion: string
  peso: number
  talla: number
  imc: number
  requerimientoCalorico: number
  diagnosticoNutricional: string
  observaciones: string
  idCita: string
}

interface CrearEvaluacionNutricionalParams {
  idHistoria: string
  datos: DatosEvaluacionNutricional
  api?: AxiosInstance
}

export async function crearEvaluacionNutricional({
  idHistoria,
  datos,
  api = defaultApi,
}: CrearEvaluacionNutricionalParams): Promise<any> {
  // Specify return type if known, e.g., Promise<EvaluacionNutricionalResponse>
  try {
    // No logging here for successful individual creations to keep console clean
    const res = await api.post(
      `/historia-clinica/${idHistoria}/evaluacion-nutricional`,
      {
        ...datos,
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
      `       ❌ Error al crear evaluación para Historia ${idHistoria} (Cita: ${datos.idCita}): ${errorMessage}`
    )
    throw err // Re-throw to propagate the error up to `generarEvaluacionNutricional`
  }
}

interface Evaluacion {
  fechaEvaluacion: string
  peso: number
  talla: number
  imc: number
  requerimientoCalorico: number
  diagnosticoNutricional: string
  observaciones: string
}

/**
 * Genera evaluaciones nutricionales realistas basadas en edad, sexo y fechas de cita.
 */
export function generarEvaluaciones(
  fechaNacimiento: string,
  sexo: Genero,
  fechasCitas: string[]
): Evaluacion[] {
  const evaluaciones: Evaluacion[] = []
  let talla = estimarTallaInicial(fechaNacimiento, sexo)
  let peso = estimarPesoInicial(talla)

  for (const fecha of fechasCitas.sort()) {
    const edad = dayjs(fecha).diff(dayjs(fechaNacimiento), 'year')

    // Ajuste de altura realista
    if (edad < 18) {
      talla += Math.random() * 0.005 // crece lentamente (<0.5 cm)
    } else if (Math.random() < 0.2) {
      talla += (Math.random() - 0.5) * 0.005 // pequeña variación por medición
    }

    // Ajuste de peso realista
    const deltaPeso = (Math.random() - 0.5) * 2 // variación entre -1kg y +1kg
    peso = Math.max(35, peso + deltaPeso)

    // Cálculos derivados
    const imc = +(peso / (talla * talla)).toFixed(2)
    const requerimientoCalorico = +(
      24 *
      peso *
      (sexo === 'M' ? random(1.0, 1.2) : random(0.9, 1.1))
    ).toFixed(1)

    const diagnostico = diagnosticoSegunIMC(imc)
    const observaciones = observacionSegunCambio(evaluaciones.at(-1)?.imc, imc)

    evaluaciones.push({
      fechaEvaluacion: fecha,
      peso: +peso.toFixed(1),
      talla: +talla.toFixed(2),
      imc,
      requerimientoCalorico,
      diagnosticoNutricional: diagnostico,
      observaciones,
    })
  }

  return evaluaciones
}

// ------------------ Funciones auxiliares ------------------

function estimarTallaInicial(fechaNacimiento: string, sexo: 'M' | 'F') {
  const edad = dayjs().diff(dayjs(fechaNacimiento), 'year')
  if (edad < 12) return random(1.3, 1.5)
  if (edad < 18) return random(1.5, 1.7)
  return sexo === Genero.MASCULINO ? random(1.65, 1.8) : random(1.55, 1.7)
}

function estimarPesoInicial(talla: number) {
  const imc = random(19, 24)
  return imc * talla * talla
}

function diagnosticoSegunIMC(imc: number): string {
  if (imc < 18.5) return 'Bajo peso — requiere aumento calórico.'
  if (imc < 25) return 'Normal — mantener hábitos saludables.'
  if (imc < 30) return 'Sobrepeso — mejorar alimentación y actividad física.'
  return 'Obesidad — requiere seguimiento nutricional intensivo.'
}

function observacionSegunCambio(
  imcPrevio?: number,
  imcActual?: number
): string {
  if (!imcPrevio) return 'Primera evaluación registrada.'
  const diff = imcActual! - imcPrevio
  if (diff > 0.5)
    return 'Se nota un leve aumento en el IMC respecto a la cita anterior.'
  if (diff < -0.5)
    return 'Se observa una ligera mejora en los indicadores nutricionales.'
  return 'El estado nutricional se mantiene estable.'
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

interface GenerarEvaluacionNutricionalParams {
  citasGenerasdas: PacienteCitasGeneradas
  historia: any
  api?: AxiosInstance
}

export async function generarEvaluacionNutricional({
  citasGenerasdas,
  historia,
  api,
}: GenerarEvaluacionNutricionalParams) {
  let evaluacionGeneradas: number = 0
  const { citas } = citasGenerasdas
  const evaluaciones = generarEvaluaciones(
    historia.paciente.fechaNacimiento,
    historia.paciente.genero,
    citas.map((c) => c.fechaInicio)
  )

  for (let i = 0; i < citas.length; i++) {
    if (dayjs(citas[i].fechaInicio).isBefore(dayjs())) {
      await crearEvaluacionNutricional({
        idHistoria: historia.id,
        datos: {
          ...evaluaciones[i],
          idCita: citas[i].id,
        },
        api,
      })
      evaluacionGeneradas++
    }
  }

  return evaluacionGeneradas
}
