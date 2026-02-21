import dayjs from 'dayjs'
import {
  CitaResponseDto,
  EspecialidadCitaDto,
  ServicioCitaDto,
} from '../dto/cita.dto'
import { Cita } from '../entities/cita.entity'
import { formatearPersonal } from '@/application/personal/utils/formateo-personal.utils'
import { formatearPaciente } from '@/application/paciente/utils/formateo-paciente'
import { formatearConsultorio } from '@/application/consultorio/utils/formateo.consultorio'
import { Servicio } from '@/application/estudio/entities/estudio.entity'

const formatearEspecialidad = (
  especialidad: Cita['especialidad']
): EspecialidadCitaDto | undefined => {
  if (!especialidad) {
    return undefined
  }
  return {
    id: especialidad.id,
    nombre: especialidad.nombre,
    descripcion: especialidad.descripcion,
    colorHex: especialidad.colorHex,
    estado: especialidad.estado,
  }
}

export const formatearServicio = (servicio: Servicio): ServicioCitaDto => {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion ?? '',
    tipo: servicio.tipo,
    duracionMinutos: servicio.duracionMinutos,
    costo: Number(servicio.costo),
    estado: servicio.estado,
  }
}

export function formatearCita(cita: Cita): CitaResponseDto {
  return {
    id: cita.id,
    detalle: cita.detalle,
    fechaInicio: dayjs(cita.fechaInicio).toISOString(),
    fechaFin: dayjs(cita.fechaFin).toISOString(),
    medicoId: cita.idMedico,
    pacienteId: cita.idPaciente ?? undefined,
    consultorioId: cita.idConsultorio ?? undefined,
    especialidadId: cita.idEspecialidad ?? undefined,
    servicioId: cita.idServicio ?? undefined,
    estado: cita.estado,
    tipoCita: cita.tipoCita,
    medico: cita.medico ? formatearPersonal(cita.medico) : undefined,
    paciente: cita.paciente ? formatearPaciente(cita.paciente) : undefined,
    especialidad: formatearEspecialidad(cita.especialidad),
    servicio: cita.servicio ? formatearServicio(cita.servicio) : undefined,
    consultorio: cita.consultorio
      ? formatearConsultorio(cita.consultorio)
      : undefined,
  }
}

export function formatearCitas(citas: Cita[]): CitaResponseDto[] {
  return citas.map((cita) => formatearCita(cita))
}
