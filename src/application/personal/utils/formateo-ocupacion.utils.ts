import { OcupacionResponseDto, ServicioResumenDto } from '../dto/ocupacion.dto'
import { Ocupacion } from '../entities/ocupacion.entity'

const formatearServicio = (
  servicioOcupacion: Ocupacion['servicioOcupaciones'][number]
): ServicioResumenDto | undefined => {
  const servicio = servicioOcupacion.servicio
  if (!servicio) {
    return undefined
  }

  return {
    id: servicio.id,
    nombre: servicio.nombre,
    duracionMinutos: servicio.duracionMinutos,
  }
}

export function formatearOcupacion(ocupacion: Ocupacion): OcupacionResponseDto {
  return {
    id: ocupacion.id,
    nombre: ocupacion.nombre,
    descripcion: ocupacion.descripcion,
    grado: ocupacion.grado,
    estado: ocupacion.estado,
    servicios:
      ocupacion.servicioOcupaciones
        ?.map(formatearServicio)
        .filter((servicio): servicio is ServicioResumenDto => !!servicio) ?? [],
  }
}

export function formatearOcupaciones(
  ocupaciones: Ocupacion[]
): OcupacionResponseDto[] {
  return ocupaciones.map((ocupacion) => formatearOcupacion(ocupacion))
}
