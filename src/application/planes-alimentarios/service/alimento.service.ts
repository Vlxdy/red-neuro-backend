import { PaginacionAlimentosQueryDto } from '@/common/dto/paginacion-query.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CategoriaAlimento } from '../constant'
import { AlimentoRepository } from '../repository/alimento.repository'

@Injectable()
export class AlimentoService {
  constructor(private readonly repository: AlimentoRepository) {}

  async buscarPorId(id: string, transaccion?: EntityManager) {
    const alimento = await this.repository.buscarPorId(id, transaccion)
    if (!alimento) throw new NotFoundException('Alimento no encontrado')
    return alimento
  }

  async listarTodos(paginacionQueryDto: PaginacionAlimentosQueryDto) {
    return await this.repository.listarTodos(paginacionQueryDto)
  }

  async listarPorIds(ids: string[]) {
    return await this.repository.listarPorIds(ids)
  }

  async listarPorCategorias(
    categorias: CategoriaAlimento[],
    transaccion?: EntityManager
  ) {
    return await this.repository.listarPorCategorias(categorias, transaccion)
  }
}
