import { ServicioResponseDto, EspecialidadResumenDto } from '../dto/estudio.dto'
import { Servicio } from '../entities/estudio.entity'

const formatearEspecialidad = (
  especialidad: Servicio['especialidad']
): EspecialidadResumenDto | undefined => {
  if (!especialidad) {
    return undefined
  }

  return {
    id: especialidad.id,
    nombre: especialidad.nombre,
    colorHex: especialidad.colorHex,
  }
}

export function formatearServicio(servicio: Servicio): ServicioResponseDto {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    duracionMinutos: servicio.duracionMinutos,
    estado: servicio.estado,
    tipo: servicio.tipo,
    costo: Number(servicio.costo),
    especialidad: formatearEspecialidad(servicio.especialidad),
  }
}

export function formatearServicios(
  servicios: Servicio[]
): ServicioResponseDto[] {
  return servicios.map((servicio) => formatearServicio(servicio))
}
