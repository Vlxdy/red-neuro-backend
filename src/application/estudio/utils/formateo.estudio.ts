import { EstudioResponseDto, EspecialidadResumenDto } from '../dto/estudio.dto'
import { Estudio } from '../entities/estudio.entity'

const formatearEspecialidad = (
  relacion: Estudio['estudioEspecialidades'][number]
): EspecialidadResumenDto => ({
  id: relacion.especialidad.id,
  nombre: relacion.especialidad.nombre,
  colorHex: relacion.especialidad.colorHex,
})

export function formatearEstudio(estudio: Estudio): EstudioResponseDto {
  return {
    id: estudio.id,
    nombre: estudio.nombre,
    descripcion: estudio.descripcion,
    duracionMinutos: estudio.duracionMinutos,
    estado: estudio.estado,
    especialidades:
      estudio.estudioEspecialidades?.map(formatearEspecialidad) ?? [],
  }
}

export function formatearEstudios(estudios: Estudio[]): EstudioResponseDto[] {
  return estudios.map((estudio) => formatearEstudio(estudio))
}
