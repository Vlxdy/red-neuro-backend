import { CategoriaResponseDto } from '../dto/categoria.dto'
import { Categoria } from '../entities/categoria.entity'

export function formatearCategoria(categoria: Categoria): CategoriaResponseDto {
  return {
    id: categoria.id,
    nombre: categoria.nombre,
    descripcion: categoria.descripcion,
    colorHex: categoria.colorHex,
    estado: categoria.estado,
  }
}

export function formatearCategorias(
  categorias: Categoria[]
): CategoriaResponseDto[] {
  return categorias.map((categoria) => formatearCategoria(categoria))
}
