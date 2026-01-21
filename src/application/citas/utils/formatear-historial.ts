import dayjs from 'dayjs'
import { HistorialCitaResponseDto } from '../dto/cita.dto'
import { HistorialCita } from '../entities/cita-historial.entity'
import { PersonalResponseDto } from '@/application/personal/dto/personal.dto'

export function formatearHistorialCita(
  historial: HistorialCita,
  ejecutor?: PersonalResponseDto
): HistorialCitaResponseDto {
  return {
    id: historial.id,
    citaId: historial.idCita,
    estadoAnterior: historial.estadoAnterior ?? undefined,
    rolEjecutor: historial.rolEjecutor,
    idEjecutor: historial.idEjecutor,
    comentario: historial.comentario ?? undefined,
    detalleCambios: historial.detalleCambios ?? undefined,
    ejecutor,
    fechaCreacion: dayjs(historial.fechaCreacion).toISOString(),
  }
}

export function formatearHistorialCitas(
  historial: HistorialCita[],
  ejecutores?: Map<string, PersonalResponseDto>
): HistorialCitaResponseDto[] {
  return historial.map((item) =>
    formatearHistorialCita(
      item,
      ejecutores?.get(`${item.idEjecutor}-${item.rolEjecutor}`)
    )
  )
}
