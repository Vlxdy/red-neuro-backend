import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Categoria } from '../entities/categoria.entity'
import {
  ActualizarCategoriaDto,
  CrearCategoriaDto,
  ListarCategoriasQueryDto,
} from '../dto/categoria.dto'

@Injectable()
export class CategoriaRepository {
  constructor(private readonly dataSource: DataSource) {}

  private categoriaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Categoria)
  }

  async listarCategoriasPaginado(paginacionQuery: ListarCategoriasQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.categoriaRepository()
      .createQueryBuilder('categoria')
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('categoria.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('categoria.descripcion', sentido)
        break
      case 'colorHex':
        query.addOrderBy('categoria.colorHex', sentido)
        break
      case 'estado':
        query.addOrderBy('categoria.estado', sentido)
        break
      default:
        query.addOrderBy('categoria.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('categoria.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('categoria.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async obtenerCategoriaPorId(id: string, manager?: EntityManager) {
    return await this.categoriaRepository(manager).findOne({ where: { id } })
  }

  async crearCategoria(
    dto: CrearCategoriaDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const nueva = this.categoriaRepository(transaccion).create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })

    return await this.categoriaRepository(transaccion).save(nueva)
  }

  async actualizarCategoria(
    categoria: Categoria,
    dto: ActualizarCategoriaDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(categoria, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })

    return await this.categoriaRepository(transaccion).save(categoria)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
