import {
  EspecialidadResponseDto,
  EstudioResumenDto,
} from '../dto/especialidad.dto'
import { Especialidad } from '../entities/especialidad.entity'

const formatearEstudio = (
  relacion: Especialidad['estudioEspecialidades'][number]
): EstudioResumenDto => ({
  id: relacion.estudio.id,
  nombre: relacion.estudio.nombre,
  duracionMinutos: relacion.estudio.duracionMinutos,
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
    estudios: especialidad.estudioEspecialidades?.map(formatearEstudio) ?? [],
  }
}

export function formatearEspecialidades(
  especialidades: Especialidad[]
): EspecialidadResponseDto[] {
  return especialidades.map((especialidad) =>
    formatearEspecialidad(especialidad)
  )
}
