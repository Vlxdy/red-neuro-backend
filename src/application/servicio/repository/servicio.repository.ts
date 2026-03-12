import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager, In } from 'typeorm'
import { Servicio } from '../entities/servicio.entity'
import {
  ActualizarServicioDto,
  CrearServicioDto,
  ListarServiciosQueryDto,
} from '../dto/servicio.dto'
import { Categoria } from '../entities/categoria.entity'
import { ServicioCategoria } from '../entities/servicio-categoria.entity'
import { ServicioEstado } from '../constants'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

@Injectable()
export class ServicioRepository {
  constructor(private readonly dataSource: DataSource) {}

  private servicioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Servicio)
  }

  private categoriaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Categoria)
  }

  private servicioCategoriaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(ServicioCategoria)
  }

  async listarServiciosPaginado(paginacionQuery: ListarServiciosQueryDto) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .leftJoinAndSelect(
        'servicio.servicioCategorias',
        'servicioCategorias',
        'servicioCategorias.estado = :estadoRelacion',
        { estadoRelacion: ServicioEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'servicioCategorias.categoria',
        'categoria',
        'categoria.estado = :estadoCategoria',
        { estadoCategoria: ServicioEstado.ACTIVO }
      )
      .distinct(true)
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('servicio.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('servicio.descripcion', sentido)
        break
      case 'duracionMinutos':
        query.addOrderBy('servicio.duracionMinutos', sentido)
        break
      case 'estado':
        query.addOrderBy('servicio.estado', sentido)
        break
      default:
        query.addOrderBy('servicio.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('servicio.nombre ilike :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('servicio.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    if (tipo) {
      query.andWhere('servicio.tipo = :tipo', { tipo })
    }

    return await query.getManyAndCount()
  }

  async listarServiciosPorCategoriaPaginado(
    categoriaId: string,
    paginacionQuery: ListarServiciosQueryDto
  ) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .innerJoinAndSelect(
        'servicio.servicioCategorias',
        'servicioCategorias',
        'servicioCategorias.categoriaId = :categoriaId AND servicioCategorias.estado = :estadoRelacion',
        { categoriaId, estadoRelacion: ServicioEstado.ACTIVO }
      )
      .innerJoinAndSelect(
        'servicioCategorias.categoria',
        'categoria',
        'categoria.estado = :estadoCategoria',
        { estadoCategoria: ServicioEstado.ACTIVO }
      )
      .distinct(true)
      .take(limite)
      .skip(saltar)

    if (tipo) query.andWhere('servicio.tipo = :tipo', { tipo })
    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('servicio.nombre ilike :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('servicio.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    switch (orden) {
      case 'nombre':
        query.addOrderBy('servicio.nombre', sentido)
        break
      default:
        query.addOrderBy('servicio.id', 'ASC')
    }

    return await query.getManyAndCount()
  }

  async obtenerServicioPorId(id: string, manager?: EntityManager) {
    return await this.servicioRepository(manager)
      .createQueryBuilder('servicio')
      .leftJoinAndSelect(
        'servicio.servicioCategorias',
        'servicioCategorias',
        'servicioCategorias.estado = :estadoRelacion',
        { estadoRelacion: ServicioEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'servicioCategorias.categoria',
        'categoria',
        'categoria.estado = :estadoCategoria',
        { estadoCategoria: ServicioEstado.ACTIVO }
      )
      .where('servicio.id = :id', { id })
      .getOne()
  }

  async obtenerCategoriaPorId(id: string, manager?: EntityManager) {
    return await this.categoriaRepository(manager).findOne({ where: { id } })
  }

  async obtenerCategoriasPorIds(ids: string[], manager?: EntityManager) {
    if (ids.length === 0) return []
    return await this.categoriaRepository(manager).findBy({ id: In(ids) })
  }

  async crearServicio(
    dto: CrearServicioDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const nuevo = this.servicioRepository(transaccion).create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.servicioRepository(transaccion).save(nuevo)
  }

  async actualizarServicio(
    servicio: Servicio,
    dto: ActualizarServicioDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const repo = this.servicioRepository(transaccion)
    const partial: QueryDeepPartialEntity<Servicio> = {
      usuarioModificacion: usuarioAuditoria,
    }

    if (dto.estado !== undefined) partial.estado = dto.estado as ServicioEstado
    if (dto.nombre !== undefined) partial.nombre = dto.nombre
    if (dto.descripcion !== undefined) partial.descripcion = dto.descripcion
    if (dto.duracionMinutos !== undefined)
      partial.duracionMinutos = dto.duracionMinutos
    if (dto.tipo !== undefined) partial.tipo = dto.tipo
    if (dto.costo !== undefined) partial.costo = Number(dto.costo)

    await repo.update({ id: servicio.id }, partial)
    return await repo.findOneOrFail({ where: { id: servicio.id } })
  }

  async crearServicioCategorias(
    servicioId: string,
    categoriaIds: string[],
    usuarioAuditoria: string,
    manager: EntityManager
  ) {
    const repo = this.servicioCategoriaRepository(manager)
    const idsUnicos = Array.from(new Set(categoriaIds))
    const existentes = await repo.find({
      where: { servicioId, categoriaId: In(idsUnicos) },
    })
    const existentesMap = new Map(
      existentes.map((relacion) => [String(relacion.categoriaId), relacion])
    )

    const cambios: ServicioCategoria[] = []
    for (const categoriaId of idsUnicos) {
      const existente = existentesMap.get(String(categoriaId))
      if (!existente) {
        cambios.push(
          repo.create({
            servicioId,
            categoriaId,
            estado: ServicioEstado.ACTIVO,
            usuarioCreacion: usuarioAuditoria,
          })
        )
      } else if (existente.estado !== ServicioEstado.ACTIVO) {
        existente.estado = ServicioEstado.ACTIVO
        cambios.push(existente)
      }
    }

    return cambios.length ? await repo.save(cambios) : []
  }

  async reemplazarServicioCategorias(
    servicioId: string,
    categoriaIds: string[],
    usuarioAuditoria: string,
    manager: EntityManager
  ) {
    const repo = this.servicioCategoriaRepository(manager)
    const idsUnicos = Array.from(new Set(categoriaIds))
    const idsSet = new Set(idsUnicos.map((id) => String(id)))
    const existentes = await repo.find({ where: { servicioId } })

    const cambios: ServicioCategoria[] = []
    const existentesMap = new Map(
      existentes.map((relacion) => [String(relacion.categoriaId), relacion])
    )

    for (const categoriaId of idsUnicos) {
      const existente = existentesMap.get(String(categoriaId))
      if (!existente) {
        cambios.push(
          repo.create({
            servicioId,
            categoriaId,
            usuarioCreacion: usuarioAuditoria,
            estado: ServicioEstado.ACTIVO,
          })
        )
      } else if (existente.estado !== ServicioEstado.ACTIVO) {
        existente.estado = ServicioEstado.ACTIVO
        existente.usuarioModificacion = usuarioAuditoria
        cambios.push(existente)
      }
    }

    for (const relacion of existentes) {
      if (!idsSet.has(String(relacion.categoriaId))) {
        relacion.estado = ServicioEstado.INACTIVO
        relacion.usuarioModificacion = usuarioAuditoria
        cambios.push(relacion)
      }
    }

    return cambios.length ? await repo.save(cambios) : []
  }

  async eliminarServicio(id: string, transaccion: EntityManager) {
    await this.servicioRepository(transaccion).delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
