import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager, In } from 'typeorm'
import { Servicio } from '../entities/servicio.entity'
import {
  ActualizarServicioDto,
  CrearServicioDto,
  ListarServiciosQueryDto,
} from '../dto/servicio.dto'
import { Especialidad } from '@/application/personal/entities/especialidad.entity'
import { ServicioEspecialidad } from '../entities/servicio-especialidad.entity'
import { EspecialidadEstado } from '@/application/personal/constants'
import { ServicioEstado } from '../constants'

@Injectable()
export class ServicioRepository {
  constructor(private readonly dataSource: DataSource) {}

  private servicioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Servicio)
  }

  private especialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Especialidad)
  }

  private servicioEspecialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(ServicioEspecialidad)
  }

  async listarServiciosPaginado(paginacionQuery: ListarServiciosQueryDto) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .leftJoinAndSelect(
        'servicio.servicioEspecialidades',
        'servicioEspecialidades',
        'servicioEspecialidades.estado = :estadoRelacion',
        { estadoRelacion: ServicioEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'servicioEspecialidades.especialidad',
        'especialidad',
        'especialidad.estado = :estadoEspecialidad',
        { estadoEspecialidad: EspecialidadEstado.ACTIVO }
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

  async listarServiciosPorEspecialidadPaginado(
    especialidadId: string,
    paginacionQuery: ListarServiciosQueryDto
  ) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .innerJoinAndSelect(
        'servicio.servicioEspecialidades',
        'servicioEspecialidades',
        'servicioEspecialidades.especialidadId = :especialidadId AND servicioEspecialidades.estado = :estadoRelacion',
        { especialidadId, estadoRelacion: ServicioEstado.ACTIVO }
      )
      .innerJoinAndSelect(
        'servicioEspecialidades.especialidad',
        'especialidad',
        'especialidad.estado = :estadoEspecialidad',
        { estadoEspecialidad: EspecialidadEstado.ACTIVO }
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
        'servicio.servicioEspecialidades',
        'servicioEspecialidades',
        'servicioEspecialidades.estado = :estadoRelacion',
        { estadoRelacion: ServicioEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'servicioEspecialidades.especialidad',
        'especialidad',
        'especialidad.estado = :estadoEspecialidad',
        { estadoEspecialidad: EspecialidadEstado.ACTIVO }
      )
      .where('servicio.id = :id', { id })
      .getOne()
  }

  async obtenerEspecialidadPorId(id: string, manager?: EntityManager) {
    return await this.especialidadRepository(manager).findOne({ where: { id } })
  }

  async obtenerEspecialidadesPorIds(ids: string[], manager?: EntityManager) {
    if (ids.length === 0) return []
    return await this.especialidadRepository(manager).findBy({
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
    Object.assign(servicio, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })

    return await this.servicioRepository(transaccion).save(servicio)
  }

  async crearServicioEspecialidades(
    servicioId: string,
    especialidadIds: string[],
    manager: EntityManager
  ) {
    const repo = this.servicioEspecialidadRepository(manager)
    const idsUnicos = Array.from(new Set(especialidadIds))

    const existentes = await repo.find({
      where: { servicioId, especialidadId: In(idsUnicos) },
    })
    const existentesMap = new Map(
      existentes.map((relacion) => [String(relacion.especialidadId), relacion])
    )

    const cambios: ServicioEspecialidad[] = []

    for (const especialidadId of idsUnicos) {
      const existente = existentesMap.get(String(especialidadId))
      if (!existente) {
        cambios.push(
          repo.create({
            servicioId,
            especialidadId,
            estado: ServicioEstado.ACTIVO,
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

  async reemplazarServicioEspecialidades(
    servicioId: string,
    especialidadIds: string[],
    manager: EntityManager
  ) {
    const repo = this.servicioEspecialidadRepository(manager)
    const idsUnicos = Array.from(new Set(especialidadIds))
    const idsSet = new Set(idsUnicos.map((id) => String(id)))
    const existentes = await repo.find({ where: { servicioId } })

    const cambios: ServicioEspecialidad[] = []
    const existentesMap = new Map(
      existentes.map((relacion) => [String(relacion.especialidadId), relacion])
    )

    for (const especialidadId of idsUnicos) {
      const existente = existentesMap.get(String(especialidadId))

      if (!existente) {
        cambios.push(
          repo.create({
            servicioId,
            especialidadId,
            estado: ServicioEstado.ACTIVO,
          })
        )
        continue
      }

      if (existente.estado !== ServicioEstado.ACTIVO) {
        existente.estado = ServicioEstado.ACTIVO
        cambios.push(existente)
      }
    }

    for (const relacion of existentes) {
      const estaEnPayload = idsSet.has(String(relacion.especialidadId))
      if (!estaEnPayload && relacion.estado !== ServicioEstado.INACTIVO) {
        relacion.estado = ServicioEstado.INACTIVO
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
