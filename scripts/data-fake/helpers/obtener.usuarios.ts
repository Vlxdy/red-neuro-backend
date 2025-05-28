import apiAdmin from './loginAdmin'
import type { AxiosInstance } from 'axios'
export async function getNutricionistasPorFiltro(
  filtro: string,
  pagina = 1,
  limite = 10
) {
  try {
    const res = await apiAdmin.get('/usuarios-registrados/NUTRICIONISTA', {
      params: {
        pagina,
        limite,
        filtro,
      },
    })

    console.log('Respuesta de obtenerNutricionistasPorFiltro:', res.data)

    const datos = res.data?.datos
    if (!Array.isArray(datos.filas)) {
      throw new Error(
        'Respuesta inesperada, no se encontró el arreglo "filas".'
      )
    }

    return datos.filas
  } catch (err) {
    console.error(
      '❌ Error al obtener nutricionistas por filtro:',
      err.response?.data || err.message
    )
    throw err
  }
}
interface GetPacientesPorAsignarParams {
  idMedico: string
  pagina?: number
  limite?: number
}

export async function getPacientesPorAsignar(
  params: GetPacientesPorAsignarParams
) {
  const { idMedico, pagina = 1, limite = 10 } = params

  try {
    const res = await apiAdmin.get(
      `/medicos/${idMedico}/pacientes-por-asignar`,
      {
        params: { pagina, limite },
      }
    )

    const pacientes = res.data?.datos
    if (!Array.isArray(pacientes.filas)) {
      throw new Error('No se encontró una lista de pacientes en datos.')
    }

    return pacientes.filas
  } catch (err) {
    console.error(
      '❌ Error al obtener pacientes por asignar:',
      err.response?.data || err.message
    )
    throw err
  }
}

interface AsignarPacientesParams {
  idMedico: string
  idPacientes: string[]
  api?: AxiosInstance
}

export async function asignarPacientes({
  idMedico,
  idPacientes,
  api = apiAdmin,
}: AsignarPacientesParams) {
  try {
    const res = await api.post('/asignacion', {
      idMedico,
      idPacientes,
    })

    return res.data
  } catch (err) {
    console.error(
      '❌ Error al asignar pacientes:',
      err.response?.data || err.message
    )
    throw err
  }
}
