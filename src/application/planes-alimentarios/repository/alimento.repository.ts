import { PaginacionAlimentosQueryDto } from '@/common/dto/paginacion-query.dto'
import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Alimento } from '../entity/alimento.entity'

@Injectable()
export class AlimentoRepository {
  constructor(private dataSource: DataSource) {}

  async crear(alimento: Alimento) {
    return await this.dataSource.getRepository(Alimento).save(alimento)
  }

  async actualizar(id: string, data: Partial<Alimento>) {
    return await this.dataSource.getRepository(Alimento).update(id, data)
  }

  async eliminar(id: string) {
    return await this.dataSource.getRepository(Alimento).delete(id)
  }

  async buscarPorId(id: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(Alimento)
      .createQueryBuilder('alimento')
      .where('alimento.id = :id', { id })
      .getOne()
  }

  async listarTodos(paginacionQueryDto: PaginacionAlimentosQueryDto) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQueryDto

    const query = this.dataSource
      .getRepository(Alimento)
      .createQueryBuilder('alimento')
      .select([
        'alimento.id',
        'alimento.nombre',
        'alimento.descripcion',
        'alimento.categoria',
        'alimento.unidadMedida',
        'alimento.cantidadReferencial',
        'alimento.calorias',
        'alimento.grasa',
        'alimento.carbohidratos',
        'alimento.proteinas',
        'alimento.urlImage',
      ])
      .take(limite)
      .skip(saltar)

    // if (tipo) {
    //   query.where('alimento.tipo = :tipo', { tipo })
    // }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('alimento.nombre ILIKE :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('CAST(alimento.calorias AS TEXT) ILIKE :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    if (orden) {
      switch (orden) {
        case 'nombre':
          query.addOrderBy('alimento.nombre', sentido)
          break
        case 'tipo':
          query.addOrderBy('alimento.tipo', sentido)
          break
        default:
          query.addOrderBy('alimento.id', 'ASC')
      }
    }

    return await query.getManyAndCount()
  }

  async listarPorIds(ids: string[]) {
    const query = this.dataSource
      .getRepository(Alimento)
      .createQueryBuilder('alimento')
      .select([
        'alimento.id',
        'alimento.nombre',
        'alimento.descripcion',
        'alimento.tipo',
        'alimento.calorias',
        'alimento.grasa',
        'alimento.carbohidratos',
        'alimento.proteinas',
        'alimento.urlImage',
        'alimento.receta',
      ])
      .where('alimento.id IN (:...ids)', { ids })
    return await query.getMany()
  }
}
