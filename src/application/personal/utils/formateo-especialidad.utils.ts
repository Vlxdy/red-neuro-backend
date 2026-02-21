import {
  EspecialidadResponseDto,
  ServicioResumenDto,
} from '../dto/especialidad.dto'
import { Especialidad } from '../entities/especialidad.entity'

const formatearServicio = (
  servicioEspecialidad: Especialidad['servicioEspecialidades'][number]
): ServicioResumenDto | undefined => {
  const servicio = servicioEspecialidad.servicio
  if (!servicio) {
    return undefined
  }

  return {
    id: servicio.id,
    nombre: servicio.nombre,
    duracionMinutos: servicio.duracionMinutos,
  }
}

export function formatearEspecialidad(
  especialidad: Especialidad
): EspecialidadResponseDto {
  return {
    id: especialidad.id,
    nombre: especialidad.nombre,
    descripcion: especialidad.descripcion,
    estado: especialidad.estado,
    colorHex: especialidad.colorHex,
    servicios:
      especialidad.servicioEspecialidades
        ?.map(formatearServicio)
        .filter((servicio): servicio is ServicioResumenDto => !!servicio) ?? [],
  }
}

export function formatearEspecialidades(
  especialidades: Especialidad[]
): EspecialidadResponseDto[] {
  return especialidades.map((especialidad) =>
    formatearEspecialidad(especialidad)
  )
}
