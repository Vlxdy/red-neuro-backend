import dayjs from 'dayjs'
import {
  ServicioCitaDto,
  HistorialCambioDto,
  HistorialCitaResponseDto,
} from '../dto/cita.dto'
import { HistorialCita } from '../entities/cita-historial.entity'
import { PersonalResponseDto } from '@/application/personal/dto/personal.dto'
import { PacienteResponseDto } from '@/application/paciente/dto/paciente.dto'
import { TipoActualizacion } from '../entities/notificacion.entity'

export function formatearHistorialCita(
  historial: HistorialCita,
  ejecutor?: PersonalResponseDto,
  medicos?: Map<string, PersonalResponseDto>,
  pacientes?: Map<string, PacienteResponseDto>,
  servicios?: Map<string, ServicioCitaDto>
): HistorialCitaResponseDto {
  const detalleCambios = formatearDetalleCambios(
    historial.detalleCambios ?? undefined,
    medicos,
    pacientes,
    servicios
  )

  return {
    id: historial.id,
    citaId: historial.idCita,
    idEjecutor: historial.idEjecutor,
    comentario: historial.comentario ?? undefined,
    detalleCambios,
    ejecutor,
    fechaCreacion: dayjs(historial.fechaCreacion).toISOString(),
  }
}

export function formatearHistorialCitas(
  historial: HistorialCita[],
  ejecutores?: Map<string, PersonalResponseDto>,
  medicos?: Map<string, PersonalResponseDto>,
  pacientes?: Map<string, PacienteResponseDto>,
  servicios?: Map<string, ServicioCitaDto>
): HistorialCitaResponseDto[] {
  return historial.map((item) =>
    formatearHistorialCita(
      item,
      ejecutores?.get(item.idEjecutor),
      medicos,
      pacientes,
      servicios
    )
  )
}

function formatearDetalleCambios(
  detalleCambios?: TipoActualizacion[],
  medicos?: Map<string, PersonalResponseDto>,
  pacientes?: Map<string, PacienteResponseDto>,
  servicios?: Map<string, ServicioCitaDto>
): HistorialCambioDto[] | undefined {
  if (!detalleCambios?.length) {
    return undefined
  }

  return detalleCambios.map((cambio) => {
    if (cambio.field === 'idMedico') {
      return {
        ...cambio,
        beforeDetalle: cambio.before ? medicos?.get(cambio.before) : undefined,
        afterDetalle: cambio.after ? medicos?.get(cambio.after) : undefined,
      }
    }

    if (cambio.field === 'idPaciente') {
      return {
        ...cambio,
        beforeDetalle: cambio.before
          ? pacientes?.get(cambio.before)
          : undefined,
        afterDetalle: cambio.after ? pacientes?.get(cambio.after) : undefined,
      }
    }

    if (cambio.field === 'idServicio') {
      return {
        ...cambio,
        beforeDetalle: cambio.before
          ? servicios?.get(cambio.before)
          : undefined,
        afterDetalle: cambio.after ? servicios?.get(cambio.after) : undefined,
      }
    }

    return cambio as HistorialCambioDto
  })
}
