import dayjs from 'dayjs'
import { CitaResponseDto } from '../dto/cita.dto'
import { Cita } from '../entities/cita.entity'
import { formatearPersonal } from '@/application/personal/utils/formateo-personal.utils'

export function formatearCita(cita: Cita): CitaResponseDto {
  return {
    id: cita.id,
    detalle: cita.detalle,
    fechaInicio: dayjs(cita.fechaInicio).toISOString(),
    fechaFin: dayjs(cita.fechaFin).toISOString(),
    medicoId: cita.idMedico,
    estado: cita.estado,
    medico: formatearPersonal(cita.medico),
  }
}

export function formatearCitas(citas: Cita[]): CitaResponseDto[] {
  return citas.map((cita) => formatearCita(cita))
}
