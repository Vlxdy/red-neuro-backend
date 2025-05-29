import defaultApi from './loginNutriologo'
import type { AxiosInstance } from 'axios'

interface GetHistoriaClinicaParams {
  idPaciente: string
  api?: AxiosInstance
}

export async function getHistoriaClinicaPorPaciente({
  idPaciente,
  api = defaultApi,
}: GetHistoriaClinicaParams) {
  try {
    const res = await api.get(`/pacientes/${idPaciente}/historia-clinica`)

    return res.data?.datos || res.data
  } catch (err) {
    console.error(
      '❌ Error al obtener historia clínica:',
      err.response?.data || err.message
    )
    throw err
  }
}
