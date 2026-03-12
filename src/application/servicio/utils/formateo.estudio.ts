import { ServicioResponseDto, OcupacionResumenDto } from '../dto/servicio.dto'
import { Servicio } from '../entities/servicio.entity'
import { ServicioEstado } from '../constants'
import { OcupacionEstado } from '@/application/personal/constants'

const formatearOcupaciones = (
  servicioOcupaciones: Servicio['servicioOcupaciones']
): OcupacionResumenDto[] => {
  if (!servicioOcupaciones?.length) {
    return []
  }

  const ocupacionesUnicas = new Map<string, OcupacionResumenDto>()

  for (const servicioOcupacion of servicioOcupaciones) {
    if (servicioOcupacion.estado !== ServicioEstado.ACTIVO) {
      continue
    }

    const ocupacion = servicioOcupacion.ocupacion
    if (!ocupacion || ocupacion.estado !== OcupacionEstado.ACTIVO) continue

    ocupacionesUnicas.set(String(ocupacion.id), {
      id: ocupacion.id,
      nombre: ocupacion.nombre,
    })
  }

  return Array.from(ocupacionesUnicas.values())
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
    ocupaciones: formatearOcupaciones(servicio.servicioOcupaciones),
  }
}

export function formatearServicios(
  servicios: Servicio[]
): ServicioResponseDto[] {
  return servicios.map((servicio) => formatearServicio(servicio))
}
