import dayjs from 'dayjs'
import defaultApi from './loginNutriologo'
import type { AxiosInstance } from 'axios'

const alimentos = [
  { idAlimento: '14', cantidad: 1.9, tipo: 'DESAYUNO' },
  { idAlimento: '5', cantidad: 1.66, tipo: 'DESAYUNO' },
  { idAlimento: '3', cantidad: 1.4, tipo: 'DESAYUNO' },
  { idAlimento: '8', cantidad: 0.76, tipo: 'MEDIA_MANIANA' },
  { idAlimento: '9', cantidad: 0.4, tipo: 'MEDIA_MANIANA' },
  { idAlimento: '15', cantidad: 1.79, tipo: 'ALMUERZO' },
  { idAlimento: '2', cantidad: 0.93, tipo: 'ALMUERZO' },
  { idAlimento: '7', cantidad: 3, tipo: 'ALMUERZO' },
  { idAlimento: '4', cantidad: 3, tipo: 'ALMUERZO' },
  { idAlimento: '13', cantidad: 1, tipo: 'MEDIA_TARDE' },
  { idAlimento: '1', cantidad: 0.48, tipo: 'MEDIA_TARDE' },
  { idAlimento: '1', cantidad: 0.64, tipo: 'CENA' },
  { idAlimento: '6', cantidad: 0.92, tipo: 'CENA' },
  { idAlimento: '2', cantidad: 0.71, tipo: 'CENA' },
]

interface CrearPlanNutricionalParams {
  idUsuarioRol: string
  api?: AxiosInstance
}

export async function crearPlanNutricional({
  idUsuarioRol,
  api = defaultApi,
}: CrearPlanNutricionalParams): Promise<any> {
  try {
    const planes: any = []
    const hoy = dayjs()
    for (let i = 0; i < 15; i++) {
      planes.push({
        fecha: hoy.add(i, 'day').format('YYYY-MM-DD'),
        idUsuarioRol,
        recomendaciones:
          'Diagnóstico nutricional: Normal — mantener hábitos saludables.\nEl estado nutricional se mantiene estable.\nObjetivo diario aproximado: 1595.69 kcal distribuidas en cinco tiempos de comida.',
        alimentos,
      })
    }
    // No logging here for successful individual creations to keep console clean
    const res = await api.post(`/planes-nutricionales/multiple`, planes)
    return res.data
  } catch (err: any) {
    // Type 'err' as 'any' or 'unknown'
    const errorMessage =
      err.response?.data?.message || err.message || 'Error desconocido'
    // Log detailed error with indentation and context
    console.error(
      `       ❌ Error al crear plan nutricional para UsuarioRol ${idUsuarioRol}: ${errorMessage}`
    )
    throw err
  }
}
