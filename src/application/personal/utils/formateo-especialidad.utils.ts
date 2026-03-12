import {
  EspecialidadResponseDto,
  ServicioResumenDto,
} from '../dto/especialidad.dto'
import { Especialidad } from '../entities/especialidad.entity'

const formatearServicio = (
  servicioEspecialidad: Especialidad['servicioOcupaciones'][number]
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
    grado: especialidad.grado,
    estado: especialidad.estado,
    servicios:
      especialidad.servicioOcupaciones
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
