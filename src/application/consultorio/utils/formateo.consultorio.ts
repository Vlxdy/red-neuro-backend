import { ConsultorioResponseDto } from '../dto/consultorio.dto'
import { Consultorio } from '../entities/consultorio.entity'

export function formatearConsultorio(
  consultorio: Consultorio
): ConsultorioResponseDto {
  return {
    id: consultorio.id,
    nombre: consultorio.nombre,
    descripcion: consultorio.descripcion,
    estado: consultorio.estado,
    colorHex: consultorio.colorHex,
  }
}

export function formatearConsultorios(
  consultorios: Consultorio[]
): ConsultorioResponseDto[] {
  return consultorios.map((consultorio) => formatearConsultorio(consultorio))
}
