import { PaginacionAlimentosQueryDto } from '@/common/dto/paginacion-query.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { AlimentoRepository } from '../repository/alimento.repository'

@Injectable()
export class AlimentoService {
  constructor(private readonly repository: AlimentoRepository) {}

  async buscarPorId(id: string) {
    const alimento = await this.repository.buscarPorId(id)
    if (!alimento) throw new NotFoundException('Alimento no encontrado')
    return alimento
  }

  async listarTodos(paginacionQueryDto: PaginacionAlimentosQueryDto) {
    return await this.repository.listarTodos(paginacionQueryDto)
  }

  async listarPorIds(ids: string[]) {
    return await this.repository.listarPorIds(ids)
  }
}
