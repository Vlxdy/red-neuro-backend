import dayjs from 'dayjs'
import defaultApi from './loginNutriologo'
import type { AxiosInstance } from 'axios'
import { UsuarioRolResponse } from '@/common/types/data-response.type'
import { generarCitasSinSolapamiento } from '../utils/fecha-citas'
import { detallesCita, obtenerElementoAleatorio } from './detalles_cita'

interface CrearCitaParams {
  detalle: string
  fechaInicio: string // ISO con zona horaria, ej: "2025-05-28T01:00:00-04:00"
  fechaFin: string
  idPaciente: string
  api?: AxiosInstance
}

export async function crearCita({
  detalle,
  fechaInicio,
  idPaciente,
  api = defaultApi,
}: CrearCitaParams) {
  try {
    const inicio = dayjs(fechaInicio)
    const fin = inicio.add(1, 'hour')
    const res = await api.post('/citas', {
      detalle,
      fechaInicio: inicio.toISOString(),
      fechaFin: fin.toISOString(),
      idPaciente,
    })

    if (res?.data?.datos) {
      console.log('✅ Cita creada correctamente:', res.data)
      return res.data.datos.id as string
    }
    throw new Error('No se recibió datos de la cita creada en la respuesta.')
  } catch (err) {
    console.error(
      '❌ Error al crear la cita:',
      err.response?.data || err.message
    )
    throw err
  }
}
type Cita = { inicio: string; fin: string }
type CitaGenerada = {
  fechaInicio: string
  detalle: string
  id: string
}
export async function generarCitas({
  pacientes,
  fechaBase,
}: {
  fechaBase: string
  pacientes: UsuarioRolResponse[]
}) {
  const citasGeneradas: Cita[] = []
  const respuesta: Array<{
    paciente: UsuarioRolResponse
    citas: Array<CitaGenerada>
  }> = []
  for await (const paciente of pacientes) {
    const citas = generarCitasSinSolapamiento(fechaBase, citasGeneradas)
    const citasConPaciente: CitaGenerada[] = []
    if (!citas || citas.length === 0) {
      console.warn(
        `No se generaron citas para el paciente ${paciente.id} ${paciente.nroDocumento}`
      )
      continue
    }
    citasGeneradas.push(...citas)
    for await (const cita of citas) {
      const detalle = obtenerElementoAleatorio<string>(detallesCita) ?? ''
      const idCita = await crearCita({
        detalle,
        fechaInicio: cita.inicio,
        idPaciente: paciente.id,
        fechaFin: cita.fin,
      })
      if (idCita) {
        citasConPaciente.push({
          fechaInicio: cita.inicio,
          detalle,
          id: idCita,
        })
      }
    }
    respuesta.push({
      paciente,
      citas: citasConPaciente,
    })
  }

  return citasGeneradas
}
