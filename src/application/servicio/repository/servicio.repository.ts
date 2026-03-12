import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager, In } from 'typeorm'
import { Servicio } from '../entities/servicio.entity'
import {
  ActualizarServicioDto,
  CrearServicioDto,
  ListarServiciosQueryDto,
} from '../dto/servicio.dto'
import { Ocupacion } from '@/application/personal/entities/especialidad.entity'
import { ServicioOcupacion } from '../entities/servicio-especialidad.entity'
import { OcupacionEstado } from '@/application/personal/constants'
import { ServicioEstado } from '../constants'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

@Injectable()
export class ServicioRepository {
  constructor(private readonly dataSource: DataSource) {}

  private servicioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Servicio)
  }

  private ocupacionRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Ocupacion)
  }

  private servicioOcupacionRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(ServicioOcupacion)
  }

  async listarServiciosPaginado(paginacionQuery: ListarServiciosQueryDto) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .leftJoinAndSelect(
        'servicio.servicioOcupaciones',
        'servicioOcupaciones',
        'servicioOcupaciones.estado = :estadoRelacion',
        { estadoRelacion: ServicioEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'servicioOcupaciones.ocupacion',
        'especialidad',
        'especialidad.estado = :estadoOcupacion',
        { estadoOcupacion: OcupacionEstado.ACTIVO }
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
          qb.orWhere('servicio.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
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

  async listarServiciosPorOcupacionPaginado(
    ocupacionId: string,
    paginacionQuery: ListarServiciosQueryDto
  ) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .innerJoinAndSelect(
        'servicio.servicioOcupaciones',
        'servicioOcupaciones',
        'servicioOcupaciones.ocupacionId = :ocupacionId AND servicioOcupaciones.estado = :estadoRelacion',
        { ocupacionId, estadoRelacion: ServicioEstado.ACTIVO }
      )
      .innerJoinAndSelect(
        'servicioOcupaciones.ocupacion',
        'especialidad',
        'especialidad.estado = :estadoOcupacion',
        { estadoOcupacion: OcupacionEstado.ACTIVO }
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
          qb.orWhere('servicio.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
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

  async obtenerServicioPorId(id: string, manager?: EntityManager) {
    return await this.servicioRepository(manager)
      .createQueryBuilder('servicio')
      .leftJoinAndSelect(
        'servicio.servicioOcupaciones',
        'servicioOcupaciones',
        'servicioOcupaciones.estado = :estadoRelacion',
        { estadoRelacion: ServicioEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'servicioOcupaciones.ocupacion',
        'especialidad',
        'especialidad.estado = :estadoOcupacion',
        { estadoOcupacion: OcupacionEstado.ACTIVO }
      )
      .where('servicio.id = :id', { id })
      .getOne()
  }

  async obtenerOcupacionPorId(id: string, manager?: EntityManager) {
    return await this.ocupacionRepository(manager).findOne({ where: { id } })
  }

  async obtenerOcupacionesPorIds(ids: string[], manager?: EntityManager) {
    if (ids.length === 0) return []
    return await this.ocupacionRepository(manager).findBy({
      id: In(ids),
    })
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
  async crearServicioOcupaciones(
    servicioId: string,
    ocupacionIds: string[],
    usuarioAuditoria: string,
    manager: EntityManager
  ) {
    const repo = this.servicioOcupacionRepository(manager)
    const idsUnicos = Array.from(new Set(ocupacionIds))

    const existentes = await repo.find({
      where: { servicioId, ocupacionId: In(idsUnicos) },
    })
    const existentesMap = new Map(
      existentes.map((relacion) => [String(relacion.ocupacionId), relacion])
    )

    const cambios: ServicioOcupacion[] = []

    for (const ocupacionId of idsUnicos) {
      const existente = existentesMap.get(String(ocupacionId))
      if (!existente) {
        cambios.push(
          repo.create({
            servicioId,
            ocupacionId,
            estado: ServicioEstado.ACTIVO,
            usuarioCreacion: usuarioAuditoria,
          })
        )
        continue
      }

      if (existente.estado !== ServicioEstado.ACTIVO) {
        existente.estado = ServicioEstado.ACTIVO
        cambios.push(existente)
      }
    }

    if (cambios.length === 0) {
      return []
    }

    return await repo.save(cambios)
  }

  async reemplazarServicioOcupaciones(
    servicioId: string,
    ocupacionIds: string[],
    usuarioAuditoria: string,
    manager: EntityManager
  ) {
    const repo = this.servicioOcupacionRepository(manager)
    const idsUnicos = Array.from(new Set(ocupacionIds))
    const idsSet = new Set(idsUnicos.map((id) => String(id)))
    const existentes = await repo.find({ where: { servicioId } })

    const cambios: ServicioOcupacion[] = []
    const existentesMap = new Map(
      existentes.map((relacion) => [String(relacion.ocupacionId), relacion])
    )

    for (const ocupacionId of idsUnicos) {
      const existente = existentesMap.get(String(ocupacionId))

      if (!existente) {
        cambios.push(
          repo.create({
            servicioId,
            ocupacionId,
            usuarioCreacion: usuarioAuditoria,
            estado: ServicioEstado.ACTIVO,
          })
        )
        continue
      }

      if (existente.estado !== ServicioEstado.ACTIVO) {
        existente.estado = ServicioEstado.ACTIVO
        existente.usuarioModificacion = usuarioAuditoria
        cambios.push(existente)
      }
    }

    for (const relacion of existentes) {
      const estaEnPayload = idsSet.has(String(relacion.ocupacionId))
      if (!estaEnPayload && relacion.estado !== ServicioEstado.INACTIVO) {
        relacion.estado = ServicioEstado.INACTIVO
        relacion.usuarioModificacion = usuarioAuditoria
        cambios.push(relacion)
      }
    }

    if (cambios.length === 0) {
      return []
    }

    return await repo.save(cambios)
  }

  async eliminarServicio(id: string, transaccion: EntityManager) {
    await this.servicioRepository(transaccion).delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
