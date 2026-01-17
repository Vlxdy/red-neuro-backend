import dayjs from 'dayjs'
import {
  CitaResponseDto,
  EspecialidadCitaDto,
  EstudioCitaDto,
} from '../dto/cita.dto'
import { Cita } from '../entities/cita.entity'
import { formatearPersonal } from '@/application/personal/utils/formateo-personal.utils'
import { formatearConsultorio } from '@/application/consultorio/utils/formateo.consultorio'
import { TipoCita } from '../constants'

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

const formatearEstudio = (
  estudio: Cita['estudio']
): EstudioCitaDto | undefined => {
  if (!estudio) {
    return undefined
  }
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
    tipoCita: cita.esEstudio ? TipoCita.ESTUDIO : TipoCita.CONSULTA,
    comentario: cita.comentarioNutricionista ?? undefined,
    comentarioNutricionista: cita.comentarioNutricionista ?? undefined,
    medico: cita.medico ? formatearPersonal(cita.medico) : undefined,
    paciente: cita.paciente ? formatearPersonal(cita.paciente) : undefined,
    especialidad: formatearEspecialidad(cita.especialidad),
    estudio: formatearEstudio(cita.estudio),
    consultorio: cita.consultorio
      ? formatearConsultorio(cita.consultorio)
      : undefined,
  }
}

export function formatearCitas(citas: Cita[]): CitaResponseDto[] {
  return citas.map((cita) => formatearCita(cita))
}
