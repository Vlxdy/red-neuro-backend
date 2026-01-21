import dayjs from 'dayjs'
import { HistorialCitaResponseDto } from '../dto/cita.dto'
import { HistorialCita } from '../entities/cita-historial.entity'

export function formatearHistorialCita(
  historial: HistorialCita
): HistorialCitaResponseDto {
  return {
    id: historial.id,
    citaId: historial.idCita,
    estadoAnterior: historial.estadoAnterior ?? undefined,
    rolEjecutor: historial.rolEjecutor,
    idEjecutor: historial.idEjecutor,
    comentario: historial.comentario ?? undefined,
    fechaCreacion: dayjs(historial.fechaCreacion).toISOString(),
  }
}

export function formatearHistorialCitas(
  historial: HistorialCita[]
): HistorialCitaResponseDto[] {
  return historial.map((item) => formatearHistorialCita(item))
}
