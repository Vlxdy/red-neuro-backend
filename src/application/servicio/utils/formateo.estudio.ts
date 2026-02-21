import {
  ServicioResponseDto,
  EspecialidadResumenDto,
} from '../dto/servicio.dto'
import { Servicio } from '../entities/servicio.entity'

const formatearEspecialidades = (
  servicioEspecialidades: Servicio['servicioEspecialidades']
): EspecialidadResumenDto[] => {
  if (!servicioEspecialidades?.length) {
    return []
  }

  const especialidadesUnicas = new Map<string, EspecialidadResumenDto>()

  for (const servicioEspecialidad of servicioEspecialidades) {
    const especialidad = servicioEspecialidad.especialidad
    if (!especialidad) continue

    especialidadesUnicas.set(String(especialidad.id), {
      id: especialidad.id,
      nombre: especialidad.nombre,
      colorHex: especialidad.colorHex,
    })
  }

  return Array.from(especialidadesUnicas.values())
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
    especialidades: formatearEspecialidades(servicio.servicioEspecialidades),
  }
}

export function formatearServicios(
  servicios: Servicio[]
): ServicioResponseDto[] {
  return servicios.map((servicio) => formatearServicio(servicio))
}
