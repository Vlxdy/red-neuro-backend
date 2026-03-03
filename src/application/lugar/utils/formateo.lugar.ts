import { LugarResponseDto } from '../dto/lugar.dto'
import { Lugar } from '../entities/lugar.entity'

export function formatearLugar(lugar: Lugar): LugarResponseDto {
  return {
    id: lugar.id,
    nombre: lugar.nombre,
    sigla: lugar.sigla,
    direccion: lugar.direccion,
    tipo: lugar.tipo,
    estado: lugar.estado,
  }
}

export function formatearLugares(lugares: Lugar[]): LugarResponseDto[] {
  return lugares.map(formatearLugar)
}
