import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Lugar } from '../entities/lugar.entity'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { ActualizarLugarDto, CrearLugarDto } from '../dto/lugar.dto'

@Injectable()
export class LugarRepository {
  constructor(private readonly dataSource: DataSource) {}

  private repo(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Lugar)
  }

  async listarPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery
    const query = this.repo()
      .createQueryBuilder('lugar')
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('lugar.nombre', sentido)
        break
      case 'sigla':
        query.addOrderBy('lugar.sigla', sentido)
        break
      case 'direccion':
        query.addOrderBy('lugar.direccion', sentido)
        break
      case 'tipo':
        query.addOrderBy('lugar.tipo', sentido)
        break
      case 'estado':
        query.addOrderBy('lugar.estado', sentido)
        break
      default:
        query.addOrderBy('lugar.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('lugar.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('lugar.sigla ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('lugar.direccion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('lugar.tipo ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async obtenerPorId(id: string, manager?: EntityManager) {
    return await this.repo(manager).findOne({ where: { id } })
  }

  async crear(
    dto: CrearLugarDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const entity = this.repo(transaccion).create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.repo(transaccion).save(entity)
  }

  async actualizar(
    lugar: Lugar,
    dto: ActualizarLugarDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(lugar, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.repo(transaccion).save(lugar)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
