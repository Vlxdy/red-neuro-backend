import dayjs from 'dayjs'
import {
  CitaResponseDto,
  EspecialidadCitaDto,
  EstudioCitaDto,
} from '../dto/cita.dto'
import { Cita } from '../entities/cita.entity'
import { formatearPersonal } from '@/application/personal/utils/formateo-personal.utils'
import { formatearPaciente } from '@/application/paciente/utils/formateo-paciente'
import { formatearConsultorio } from '@/application/consultorio/utils/formateo.consultorio'
import { Estudio } from '@/application/estudio/entities/estudio.entity'

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

export const formatearEstudio = (estudio: Estudio): EstudioCitaDto => {
  return {
    id: estudio.id,
    nombre: estudio.nombre,
    descripcion: estudio.descripcion,
    duracionMinutos: estudio.duracionMinutos,
    estado: estudio.estado,
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
    estudioId: cita.idEstudio ?? undefined,
    estado: cita.estado,
    tipoCita: cita.tipoCita,
    medico: cita.medico ? formatearPersonal(cita.medico) : undefined,
    paciente: cita.paciente ? formatearPaciente(cita.paciente) : undefined,
    especialidad: formatearEspecialidad(cita.especialidad),
    estudio: cita.estudio ? formatearEstudio(cita.estudio) : undefined,
    consultorio: cita.consultorio
      ? formatearConsultorio(cita.consultorio)
      : undefined,
  }
}

export function formatearCitas(citas: Cita[]): CitaResponseDto[] {
  return citas.map((cita) => formatearCita(cita))
}
