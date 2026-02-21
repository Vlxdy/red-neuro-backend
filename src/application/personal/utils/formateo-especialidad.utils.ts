import {
  EspecialidadResponseDto,
  ServicioResumenDto,
} from '../dto/especialidad.dto'
import { Especialidad } from '../entities/especialidad.entity'

const formatearServicio = (
  servicio: Especialidad['servicios'][number]
): ServicioResumenDto => ({
  id: servicio.id,
  nombre: servicio.nombre,
  duracionMinutos: servicio.duracionMinutos,
})

export function formatearEspecialidad(
  especialidad: Especialidad
): EspecialidadResponseDto {
  return {
    id: especialidad.id,
    nombre: especialidad.nombre,
    descripcion: especialidad.descripcion,
    estado: especialidad.estado,
    colorHex: especialidad.colorHex,
    servicios: especialidad.servicios?.map(formatearServicio) ?? [],
  }
}

export function formatearEspecialidades(
  especialidades: Especialidad[]
): EspecialidadResponseDto[] {
  return especialidades.map((especialidad) =>
    formatearEspecialidad(especialidad)
  )
}
