import { ServicioResponseDto, CategoriaResumenDto } from '../dto/servicio.dto'
import { Servicio } from '../entities/servicio.entity'
import { ServicioEstado } from '../constants'

const formatearCategorias = (
  servicioCategorias: Servicio['servicioCategorias']
): CategoriaResumenDto[] => {
  if (!servicioCategorias?.length) return []

  const categoriasUnicas = new Map<string, CategoriaResumenDto>()

  for (const servicioCategoria of servicioCategorias) {
    if (servicioCategoria.estado !== ServicioEstado.ACTIVO) continue
    const categoria = servicioCategoria.categoria
    if (!categoria || categoria.estado !== ServicioEstado.ACTIVO) continue

    categoriasUnicas.set(String(categoria.id), {
      id: categoria.id,
      nombre: categoria.nombre,
      colorHex: categoria.colorHex,
    })
  }

  return Array.from(categoriasUnicas.values())
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
    categorias: formatearCategorias(servicio.servicioCategorias),
  }
}

export function formatearServicios(
  servicios: Servicio[]
): ServicioResponseDto[] {
  return servicios.map((servicio) => formatearServicio(servicio))
}
